import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-main">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                ✳
              </span>
              KutijaObroka
            </Link>
            <p className="footer-tagline">Mala kutija. Veliko uživanje.</p>
          </div>
          <nav aria-label="Navigacija u podnožju" className="footer-links">
            <Link href="/meni">Nedeljni meni ↗</Link>
            <Link href="/kutija">Moja kutija ↗</Link>
            <Link href="/#kako-radi">Kako funkcioniše</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>KutijaObroka · Prototip aplikacije</span>
          <Link href="/admin">Admin panel ↗</Link>
        </div>
      </div>
    </footer>
  );
}
