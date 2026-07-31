'use client';

/**
 * Generative ambient bed.
 *
 * One continuous texture — filtered noise plus a quiet tonal interval — whose
 * filter and balance follow scene progress. There is no per-object sound effect
 * and no audio file to download.
 *
 * Rules enforced here:
 *  - nothing is constructed until the visitor explicitly enables sound
 *  - the context is suspended when the tab is hidden
 *  - the bed is decorative; no information exists only in audio
 */

const MASTER_GAIN = 0.055;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private tones: { osc: OscillatorNode; gain: GainNode }[] = [];
  private onVisibility: (() => void) | null = null;

  get running(): boolean {
    return this.ctx !== null;
  }

  /** Called only from an explicit user gesture handler. */
  start(): void {
    if (this.ctx) return;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Brown-ish noise: cheap, warm, and it does not read as a hiss.
    const length = Math.floor(ctx.sampleRate * 4);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.7;

    noise.connect(filter);
    filter.connect(master);
    noise.start();

    // A quiet perfect fifth. It narrows from broadband noise as the story
    // resolves, mirroring "signal found".
    this.tones = [220, 330].map((frequency) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      return { osc, gain };
    });

    master.gain.linearRampToValueAtTime(MASTER_GAIN, ctx.currentTime + 1.6);

    this.ctx = ctx;
    this.master = master;
    this.filter = filter;
    this.noise = noise;

    this.onVisibility = () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  /** Progress-driven timbre. Called at a low rate, not every frame. */
  update(progress: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.filter) return;
    const now = ctx.currentTime;
    // Broadband and unresolved early; narrow and tonal by the end.
    const frequency = 240 + progress * 520;
    const q = 0.6 + progress * 5.5;
    this.filter.frequency.setTargetAtTime(frequency, now, 0.6);
    this.filter.Q.setTargetAtTime(q, now, 0.6);
    const toneLevel = Math.max(0, progress - 0.16) * 0.5;
    this.tones.forEach(({ gain }, index) => {
      gain.gain.setTargetAtTime(toneLevel * (index === 0 ? 1 : 0.55), now, 0.9);
    });
  }

  stop(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const master = this.master;
    if (master) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    const teardown = () => {
      this.noise?.stop();
      this.noise?.disconnect();
      this.tones.forEach(({ osc, gain }) => {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      });
      this.tones = [];
      this.filter?.disconnect();
      master?.disconnect();
      void ctx.close();
      this.ctx = null;
      this.master = null;
      this.filter = null;
      this.noise = null;
    };

    window.setTimeout(teardown, 600);

    if (this.onVisibility) {
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.onVisibility = null;
    }
  }
}

let engine: AmbientEngine | null = null;

export function getAmbientEngine(): AmbientEngine {
  engine ??= new AmbientEngine();
  return engine;
}
