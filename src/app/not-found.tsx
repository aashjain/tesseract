import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="page page--centred">
      <div className="u-shell notfound">
        <p className="u-eyebrow">404</p>
        <h1 className="page__title">This signal left the system.</h1>
        <p className="u-lede">The page moved, changed or never found its orbit.</p>
        <div className="page__cta-actions">
          <Link href="/" className="u-btn u-btn--primary">
            Return home
          </Link>
          <Link href="/work" className="u-btn">
            Explore work
          </Link>
        </div>
      </div>
    </main>
  );
}
