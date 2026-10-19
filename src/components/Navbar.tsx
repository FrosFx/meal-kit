"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBox } from "@/context/BoxContext";
import { useRecipes } from "@/context/RecipeContext";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";

const links = [
  { href: "/meni", label: "Nedeljni meni" },
  { href: "/#kako", label: "Kako funkcioniše" },
  { href: "/#cene", label: "Cene", anchor: "cene" },
  { href: "/#pitanja", label: "Pitanja" },
];

const SCROLLED_AT = 8;
const HIDE_AFTER = 400;

function obrokaLabel(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "obrok";
  return "obroka";
}

export default function Navbar() {
  const pathname = usePathname();
  const { selectedRecipes } = useBox();
  const { isLoading } = useRecipes();
  const count = selectedRecipes.length;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuOpenRef = useRef(menuOpen);
  const prevCount = useRef<number | null>(null);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Pozadina posle 8px skrola; sakrivanje pri skrolu nadole posle 400px.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AT);
      const focusInside = headerRef.current?.contains(document.activeElement);
      if (reduce.matches || menuOpenRef.current || focusInside || y < HIDE_AFTER) {
        setHidden(false);
      } else if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY);
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Najava promene broja obroka. Broj je poznat tek kad se recepti učitaju,
  // pa se tada uzima polazna vrednost (bez najave).
  useEffect(() => {
    if (isLoading) return;
    if (prevCount.current !== null && prevCount.current !== count) {
      setAnnouncement(`U kutiji: ${count} ${obrokaLabel(count)}`);
    }
    prevCount.current = count;
  }, [count, isLoading]);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  // Mobilni meni: zaključan skrol, Esc zatvara, fokus ostaje unutar panela.
  useEffect(() => {
    if (!menuOpen) return;
    const sheet = sheetRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    sheet?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      // Dugme za zatvaranje je u zaglavlju, pa je i ono deo zamke fokusa.
      const items = [
        menuButtonRef.current,
        ...sheet.querySelectorAll<HTMLElement>("a[href], button"),
      ].filter((el): el is HTMLElement => el !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) closeMenu(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen, closeMenu]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <a href="#sadrzaj" className="skip-link btn btn-primary">
        Preskoči na sadržaj
      </a>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 h-[var(--nav-h)] border-b transition-[transform,background-color,border-color,box-shadow] duration-[240ms] ease-out ${
          solid
            ? "border-line bg-paper/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-paper"
        } ${hidden && !menuOpen ? "-translate-y-full" : ""}`}
      >
        <nav
          aria-label="Glavna navigacija"
          className="container-page flex h-full items-center justify-between gap-4"
        >
          <Link
            href="/"
            aria-label="KutijaObroka — početna"
            className="-mx-1 rounded-[var(--radius-sm)] px-1 py-2"
            onClick={() => setMenuOpen(false)}
          >
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href} data-nav-anchor={link.anchor}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-[15px] font-semibold transition-colors hover:text-basil ${
                      active ? "text-basil" : "text-ink"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-mustard"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/kutija"
              aria-label={`Moja kutija, ${count} ${obrokaLabel(count)}`}
              aria-current={pathname === "/kutija" ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 font-semibold transition-colors hover:bg-paper-2 lg:px-4 ${
                pathname === "/kutija" ? "text-basil" : "text-ink"
              }`}
            >
              <span className="relative">
                <Icon name="shopping-basket" />
                {count > 0 && (
                  <span key={count} className="count-badge absolute -top-1 -right-1.5">
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden text-[15px] lg:inline">Kutija</span>
            </Link>
            <Link href="/meni" className="btn btn-primary hidden lg:inline-flex">
              Sastavi kutiju
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobilni-meni"
              aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            >
              <Icon name={menuOpen ? "x" : "menu"} />
            </button>
          </div>
        </nav>

      </header>
      {menuOpen && (
        <div
          ref={sheetRef}
          id="mobilni-meni"
          role="dialog"
          aria-label="Meni"
          className="fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-50 flex flex-col overflow-y-auto bg-paper px-[var(--gutter)] pt-4 pb-6 animate-[menu-in_240ms_var(--ease-out)] lg:hidden"
        >
          <ul className="flex flex-col divide-y divide-line">
            {links.map((link) => (
              <li key={link.href} data-nav-anchor={link.anchor}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => closeMenu(false)}
                  className={`fraunces flex min-h-16 items-center text-[32px] leading-tight font-semibold ${
                    pathname === link.href ? "text-basil" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/kutija"
                onClick={() => closeMenu(false)}
                className="fraunces flex min-h-16 items-center gap-3 text-[32px] leading-tight font-semibold text-ink"
              >
                Moja kutija
                {count > 0 && <span className="count-badge">{count}</span>}
              </Link>
            </li>
          </ul>
          <Link
            href="/meni"
            onClick={() => closeMenu(false)}
            className="btn btn-primary btn-lg mt-auto w-full"
          >
            Sastavi kutiju
            <Icon name="arrow-right" className="btn-arrow" />
          </Link>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
