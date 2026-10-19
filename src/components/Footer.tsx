import Link from "next/link";
import Logo from "@/components/Logo";

const columns = [
  {
    title: "Kuvaj",
    links: [
      { href: "/meni", label: "Nedeljni meni" },
      { href: "/kutija", label: "Moja kutija" },
      { href: "/checkout", label: "Plaćanje" },
    ],
  },
  {
    title: "Saznaj",
    links: [
      { href: "/#kako", label: "Kako funkcioniše" },
      { href: "/#cene", label: "Cene", anchor: "cene" },
      { href: "/#pitanja", label: "Pitanja" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="on-dark bg-footer py-16 text-on-footer lg:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              aria-label="KutijaObroka — početna"
              className="inline-block rounded-[var(--radius-sm)] py-1"
            >
              <Logo onDark />
            </Link>
            <p className="mt-4 max-w-[40ch] text-on-footer-muted">
              Sveži sastojci i provereni recepti, svake nedelje na tvojim
              vratima.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="t-eyebrow text-mustard">{col.title}</h2>
              <ul className="mt-3 flex flex-col">
                {col.links.map((link) => (
                  <li key={link.href} data-nav-anchor={link.anchor}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="t-meta mt-12 flex flex-col gap-2 border-t border-white/12 pt-6 text-on-footer-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KutijaObroka · prototip</p>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-on-footer"
          >
            Admin panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
