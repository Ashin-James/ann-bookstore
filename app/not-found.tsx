import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty-state page-wrap">
      <span className="eyebrow">A PAGE OUT OF PLACE</span>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 52 }}>
        This story wandered off.
      </h1>
      <p>We couldn&apos;t find the page you were looking for.</p>
      <Link className="button button-dark" href="/">
        Return home
      </Link>
    </div>
  );
}
