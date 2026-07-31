import { JSDOM } from 'jsdom';

// Three's SVGLoader parses markup with DOMParser, which jsdom provides but the
// default Vitest environment does not expose on `globalThis` for worker threads.
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = new JSDOM().window.DOMParser;
}
