/**
 * Generates the on-brand abstract still frames used by the semantic fallback
 * tier (Tier D) and by fixture project records.
 *
 * These are deliberately abstract compositions built from the same visual
 * vocabulary as the WebGL scenes — rails, fragments, apertures, orbits — so the
 * no-WebGL experience still looks art-directed rather than empty. They are
 * placeholders for real photography and client artwork.
 *
 * Run: node scripts/generate-posters.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 1600;
const H = 900;

const INK = '#070814';
const INK_DEEP = '#04050c';
const VIOLET = '#7456ff';
const CYAN = '#28b7ff';
const WARM = '#ff8a5b';
const PAPER = '#f4f1ea';

/** Deterministic PRNG so regenerating never churns the committed files. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const accents = { violet: VIOLET, cyan: CYAN, warm: WARM };

function frame(accentKey, body, seed) {
  const accent = accents[accentKey];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="62%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${INK_DEEP}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="45%" stop-color="${accent}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${INK_DEEP}" stop-opacity="0.7"/>
      <stop offset="45%" stop-color="${INK_DEEP}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${INK_DEEP}" stop-opacity="0.85"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${body}
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:overlay"/>
</svg>
`;
}

/** Scene 1 — scattered, unaligned fragments. */
function fragmentField(seed) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < 46; i += 1) {
    const x = r() * W;
    const y = 120 + r() * (H - 240);
    const w = 24 + r() * 150;
    const h = 3 + r() * 26;
    const rot = (r() - 0.5) * 70;
    const op = 0.1 + r() * 0.45;
    const fill = r() > 0.72 ? (r() > 0.5 ? VIOLET : CYAN) : PAPER;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" opacity="${op.toFixed(2)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  for (let i = 0; i < 9; i += 1) {
    const x = r() * W;
    const y = r() * H;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 4).toFixed(1)}" fill="${CYAN}" opacity="0.5"/>`;
  }
  return out;
}

/** Scene 2 — the approved A silhouette reads as an opening in the noise. */
function aperture(seed) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < 26; i += 1) {
    const y = r() * H;
    const len = 200 + r() * 700;
    const x = r() * (W - len);
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${len.toFixed(1)}" height="1" fill="${PAPER}" opacity="${(0.05 + r() * 0.14).toFixed(2)}"/>`;
  }
  // The approved A path, positioned and uniformly scaled only.
  const s = 0.62;
  const tx = W / 2 - (673.39 + 1039.32 / 2) * s;
  const ty = H / 2 - (803.83 + 992.02 / 2) * s;
  out += `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s})">
    <path d="M673.39,803.83h1039.32v992.02H673.39v-992.02ZM1464.75,1043.92h-548.68v519.76h548.68v-519.76Z" fill="none" stroke="${PAPER}" stroke-opacity="0.5" stroke-width="6"/>
    <path d="M673.39,803.83h1039.32v992.02H673.39v-992.02ZM1464.75,1043.92h-548.68v519.76h548.68v-519.76Z" fill="${VIOLET}" fill-opacity="0.16"/>
  </g>`;
  return out;
}

/** Scene 3 — nested rail cube. */
function tesseract(seed) {
  const cx = W / 2;
  const cy = H / 2;
  const box = (half, skew, op) => {
    const p = [
      [cx - half, cy - half * 0.68],
      [cx + half, cy - half * 0.68],
      [cx + half, cy + half * 0.68],
      [cx - half, cy + half * 0.68],
    ];
    const q = p.map(([x, y]) => [x + skew, y - skew * 0.55]);
    let s = `<path d="M${p[0]} L${p[1]} L${p[2]} L${p[3]} Z" fill="none" stroke="${CYAN}" stroke-opacity="${op}" stroke-width="1.5"/>`;
    s += `<path d="M${q[0]} L${q[1]} L${q[2]} L${q[3]} Z" fill="none" stroke="${VIOLET}" stroke-opacity="${op}" stroke-width="1.5"/>`;
    for (let i = 0; i < 4; i += 1) {
      s += `<line x1="${p[i][0]}" y1="${p[i][1]}" x2="${q[i][0]}" y2="${q[i][1]}" stroke="${PAPER}" stroke-opacity="${op * 0.5}" stroke-width="1"/>`;
    }
    return s;
  };
  return `${box(300, 96, 0.75)}${box(190, 60, 0.5)}${box(96, 30, 0.32)}<circle cx="${cx}" cy="${cy}" r="4" fill="${PAPER}" opacity="0.9"/>` + `<!-- seed ${seed} -->`;
}

/** Scene 4 — competing vectors collapsing to one north line. */
function axes(seed) {
  const r = rng(seed);
  const ox = W * 0.32;
  const oy = H * 0.7;
  let out = `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${H * 0.12}" stroke="${PAPER}" stroke-opacity="0.12" stroke-width="1"/>`;
  out += `<line x1="${ox}" y1="${oy}" x2="${W * 0.92}" y2="${oy}" stroke="${PAPER}" stroke-opacity="0.12" stroke-width="1"/>`;
  for (let i = 0; i < 11; i += 1) {
    const a = -1.35 + r() * 1.1;
    const len = 260 + r() * 320;
    const x = ox + Math.cos(a) * len;
    const y = oy + Math.sin(a) * len;
    out += `<line x1="${ox}" y1="${oy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${CYAN}" stroke-opacity="${(0.08 + r() * 0.14).toFixed(2)}" stroke-width="1"/>`;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${CYAN}" opacity="0.3"/>`;
  }
  out += `<line x1="${ox}" y1="${oy}" x2="${W * 0.86}" y2="${H * 0.24}" stroke="url(#rail)" stroke-width="3"/>`;
  out += `<circle cx="${W * 0.86}" cy="${H * 0.24}" r="7" fill="${CYAN}"/>`;
  return out;
}

/** Scene 5 — identity modules locking into a grid. */
function identity(seed) {
  const r = rng(seed);
  let out = '';
  const cols = 6;
  const rows = 3;
  const cw = 170;
  const ch = 150;
  const startX = W / 2 - (cols * cw) / 2;
  const startY = H / 2 - (rows * ch) / 2;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const px = startX + x * cw;
      const py = startY + y * ch;
      const locked = r() > 0.35;
      const jx = locked ? 0 : (r() - 0.5) * 42;
      const jy = locked ? 0 : (r() - 0.5) * 42;
      const kind = Math.floor(r() * 3);
      const fill = kind === 0 ? VIOLET : kind === 1 ? PAPER : 'none';
      out += `<rect x="${(px + jx).toFixed(1)}" y="${(py + jy).toFixed(1)}" width="${cw - 22}" height="${ch - 22}" fill="${fill}" fill-opacity="${kind === 0 ? 0.24 : kind === 1 ? 0.07 : 0}" stroke="${PAPER}" stroke-opacity="${locked ? 0.22 : 0.1}" stroke-width="1"/>`;
    }
  }
  return out;
}

/** Scene 6 — channel nodes and coordinated signal paths. */
function signals(seed) {
  const r = rng(seed);
  const nodes = [];
  for (let i = 0; i < 14; i += 1) {
    nodes.push([180 + r() * (W - 360), 140 + r() * (H - 280)]);
  }
  let out = '';
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const [x1, y1] = nodes[i];
      const [x2, y2] = nodes[j];
      const d = Math.hypot(x2 - x1, y2 - y1);
      if (d < 340) {
        out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${CYAN}" stroke-opacity="${(0.3 - d / 1400).toFixed(2)}" stroke-width="1"/>`;
      }
    }
  }
  for (const [x, y] of nodes) {
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3 + r() * 5).toFixed(1)}" fill="${CYAN}" opacity="0.75"/>`;
  }
  for (let i = 1; i <= 3; i += 1) {
    out += `<circle cx="${W / 2}" cy="${H / 2}" r="${i * 150}" fill="none" stroke="${VIOLET}" stroke-opacity="${(0.22 / i).toFixed(2)}" stroke-width="1"/>`;
  }
  return out;
}

/** Scene 7 — frames along a curved timeline. */
function momentum(seed) {
  const r = rng(seed);
  let out = `<path d="M-40 ${H * 0.72} C ${W * 0.3} ${H * 0.34}, ${W * 0.7} ${H * 0.9}, ${W + 40} ${H * 0.4}" fill="none" stroke="${PAPER}" stroke-opacity="0.12" stroke-width="1"/>`;
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    const x = -40 + t * (W + 80);
    const y = H * 0.72 + Math.sin(t * Math.PI * 1.6) * -H * 0.22;
    const w = 130 + r() * 40;
    const h = w * 0.6;
    out += `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${VIOLET}" fill-opacity="0.1" stroke="${PAPER}" stroke-opacity="0.28" stroke-width="1"/>`;
    out += `<rect x="${(x - w / 2).toFixed(1)}" y="${(y + h / 2 + 8).toFixed(1)}" width="${(w * 0.45).toFixed(1)}" height="2" fill="${VIOLET}" opacity="0.6"/>`;
  }
  return out;
}

/** Scene 8 — a minimal studio stage. */
function matterLab(seed) {
  const cx = W / 2;
  return `<ellipse cx="${cx}" cy="${H * 0.74}" rx="330" ry="52" fill="${WARM}" fill-opacity="0.08"/>
  <rect x="${cx - 120}" y="${H * 0.4}" width="240" height="${H * 0.34}" fill="${WARM}" fill-opacity="0.07" stroke="${PAPER}" stroke-opacity="0.2"/>
  <rect x="${cx - 470}" y="${H * 0.24}" width="180" height="260" fill="${PAPER}" fill-opacity="0.1" transform="skewY(8)"/>
  <rect x="${cx + 300}" y="${H * 0.2}" width="200" height="290" fill="${PAPER}" fill-opacity="0.06" transform="skewY(-8)"/>
  <line x1="0" y1="${H * 0.74}" x2="${W}" y2="${H * 0.74}" stroke="${PAPER}" stroke-opacity="0.16"/>
  <!-- seed ${seed} -->`;
}

/** Scene 9 — layered portals. */
function portals(seed) {
  let out = '';
  for (let i = 5; i >= 0; i -= 1) {
    const s = 1 - i * 0.13;
    const w = 520 * s;
    const h = 620 * s;
    const x = W / 2 - w / 2 + i * 26;
    const y = H / 2 - h / 2 - i * 10;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(6 * s).toFixed(1)}" fill="${CYAN}" fill-opacity="${(0.04 + i * 0.012).toFixed(3)}" stroke="${CYAN}" stroke-opacity="${(0.5 - i * 0.07).toFixed(2)}" stroke-width="1.5"/>`;
  }
  return out + `<!-- seed ${seed} -->`;
}

/** Scene 10 / project posters — an artefact suspended in a frame. */
function artefact(seed, variant) {
  const r = rng(seed);
  const cx = W / 2;
  const cy = H / 2;
  let out = `<rect x="${cx - 340}" y="${cy - 250}" width="680" height="500" fill="none" stroke="${PAPER}" stroke-opacity="0.18"/>`;
  if (variant === 'lattice') {
    for (let i = 0; i <= 8; i += 1) {
      const t = i / 8;
      out += `<line x1="${cx - 260 + t * 520}" y1="${cy - 180}" x2="${cx - 260 + t * 520}" y2="${cy + 180}" stroke="${CYAN}" stroke-opacity="0.35" stroke-width="1"/>`;
      out += `<line x1="${cx - 260}" y1="${cy - 180 + t * 360}" x2="${cx + 260}" y2="${cy - 180 + t * 360}" stroke="${CYAN}" stroke-opacity="0.2" stroke-width="1"/>`;
    }
  } else if (variant === 'ribbon') {
    out += `<path d="M${cx - 300} ${cy + 120} C ${cx - 120} ${cy - 220}, ${cx + 120} ${cy + 220}, ${cx + 300} ${cy - 120}" fill="none" stroke="${WARM}" stroke-opacity="0.65" stroke-width="18" stroke-linecap="round"/>`;
    out += `<path d="M${cx - 300} ${cy + 160} C ${cx - 120} ${cy - 180}, ${cx + 120} ${cy + 260}, ${cx + 300} ${cy - 80}" fill="none" stroke="${WARM}" stroke-opacity="0.2" stroke-width="8"/>`;
  } else {
    out += `<rect x="${cx - 110}" y="${cy - 210}" width="220" height="420" fill="${VIOLET}" fill-opacity="0.3" stroke="${PAPER}" stroke-opacity="0.3"/>`;
    out += `<rect x="${cx - 30}" y="${cy - 140}" width="220" height="300" fill="${VIOLET}" fill-opacity="0.14" stroke="${PAPER}" stroke-opacity="0.16"/>`;
  }
  for (let i = 0; i < 10; i += 1) {
    out += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * H).toFixed(1)}" r="2" fill="${PAPER}" opacity="0.3"/>`;
  }
  return out;
}

/** Scene 11 — warm tactile planes. */
function human(seed) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < 5; i += 1) {
    const w = 210;
    const h = 280;
    const x = W / 2 - (5 * (w + 26)) / 2 + i * (w + 26);
    const y = H / 2 - h / 2 + (r() - 0.5) * 60;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" fill="${WARM}" fill-opacity="${(0.07 + r() * 0.07).toFixed(2)}" stroke="${PAPER}" stroke-opacity="0.2"/>`;
    out += `<line x1="${(x + 18).toFixed(1)}" y1="${(y + h - 34).toFixed(1)}" x2="${(x + w - 60).toFixed(1)}" y2="${(y + h - 34).toFixed(1)}" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="2"/>`;
  }
  return out;
}

/** Scene 12 — the approved G silhouette as the earned orbit. */
function resolution(seed) {
  const cx = W / 2;
  const cy = H / 2;
  let out = '';
  for (let i = 1; i <= 4; i += 1) {
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${180 + i * 90}" ry="${120 + i * 62}" fill="none" stroke="${VIOLET}" stroke-opacity="${(0.3 / i).toFixed(2)}" stroke-width="1"/>`;
  }
  const s = 0.3;
  const tx = cx - (2002.89 + 1073.73 / 2) * s;
  const ty = cy - (803.83 + 2142.35 / 2) * s;
  out += `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s})">
    <path d="M3076.49,803.83l.13,1075.26c-10.49,188.38-64.87,370.61-162.57,531.28-191.78,315.38-539.06,525.51-911.16,535.81v-44.85c26.52-8.81,53.84-24.86,78.27-39.12,316.75-184.91,525.84-517.63,552.15-885.65,2.6-36.36.73-73.56,5.3-109.46h-625.17V803.83h1063.06Z" fill="${PAPER}" fill-opacity="0.9"/>
  </g>`;
  return out + `<!-- seed ${seed} -->`;
}

const sceneBuilders = [
  ['scene-01', 'violet', fragmentField],
  ['scene-02', 'violet', aperture],
  ['scene-03', 'cyan', tesseract],
  ['scene-04', 'cyan', axes],
  ['scene-05', 'violet', identity],
  ['scene-06', 'cyan', signals],
  ['scene-07', 'violet', momentum],
  ['scene-08', 'warm', matterLab],
  ['scene-09', 'cyan', portals],
  ['scene-10', 'violet', (s) => artefact(s, 'monolith')],
  ['scene-11', 'warm', human],
  ['scene-12', 'violet', resolution],
];

mkdirSync('public/media/posters', { recursive: true });

sceneBuilders.forEach(([name, accent, build], i) => {
  writeFileSync(`public/media/posters/${name}.svg`, frame(accent, build(i * 977 + 13), i + 1));
});

const projectPosters = [
  ['project-meridian', 'violet', 'monolith'],
  ['project-meridian-02', 'violet', 'lattice'],
  ['project-meridian-03', 'violet', 'ribbon'],
  ['project-northline', 'cyan', 'lattice'],
  ['project-northline-02', 'cyan', 'monolith'],
  ['project-sona', 'warm', 'ribbon'],
  ['project-sona-02', 'warm', 'monolith'],
];

projectPosters.forEach(([name, accent, variant], i) => {
  writeFileSync(
    `public/media/posters/${name}.svg`,
    frame(accent, artefact(i * 613 + 7, variant), i + 20),
  );
});

console.log(`wrote ${sceneBuilders.length + projectPosters.length} posters`);
