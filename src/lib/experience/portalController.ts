'use client';

/**
 * The project portal is a single overlay shared by the whole journey, so it has
 * a single controller rather than state threaded through every scene.
 *
 * Why this is not just `router.push` / `router.replace`: on a statically
 * prerendered route, replacing `/?project=slug` with `/` is treated as a
 * same-route navigation and does nothing at all — the URL does not change and
 * `useSearchParams` never re-fires, so a visitor who arrived on a shared link
 * could not close the overlay. Driving the URL with the History API keeps the
 * view linkable and keeps browser back working, without depending on the
 * router's opinion of whether anything changed.
 */

export const PORTAL_PARAM = 'project';

type Listener = (slug: string | null) => void;

const listeners = new Set<Listener>();

/** Reads the portal slug out of the current URL. Safe on the server. */
export function readPortalSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(PORTAL_PARAM);
}

export function subscribeToPortal(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function announce(slug: string | null): void {
  for (const listener of listeners) listener(slug);
}

/** Opens a portal and pushes a history entry, so browser back closes it. */
export function openPortal(slug: string): void {
  if (typeof window === 'undefined') return;
  const url = `${window.location.pathname}?${PORTAL_PARAM}=${encodeURIComponent(slug)}`;
  window.history.pushState({ portal: slug }, '', url);
  announce(slug);
}

/**
 * Closes the portal.
 *
 * If this session pushed the entry, step back so the visitor's history is not
 * littered. If they arrived on the link directly there is nothing to step back
 * to, so rewrite the URL in place — either way the overlay closes immediately,
 * because closing never waits on a navigation to land.
 */
export function closePortal(): void {
  if (typeof window === 'undefined') return;
  const pushedByUs = (window.history.state as { portal?: string } | null)?.portal;
  announce(null);
  if (pushedByUs) {
    window.history.back();
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/** Keeps the overlay in step with browser back and forward. */
export function watchHistory(): () => void {
  const onPopState = () => announce(readPortalSlug());
  window.addEventListener('popstate', onPopState);
  return () => window.removeEventListener('popstate', onPopState);
}
