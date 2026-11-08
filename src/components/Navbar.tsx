"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBox } from "@/context/BoxContext";

export default function Navbar() {
  const pathname = usePathname();
  const { selectedRecipes } = useBox();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Početna" },
    { href: "/meni", label: "Nedeljni meni" },
    { href: "/#kako-radi", label: "Kako funkcioniše" },
  ];
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Glavna navigacija">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            ✳
          </span>
          KutijaObroka<span className="sr-only"> — početna</span>
        </Link>
        <div className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/kutija"
          className="nav-box"
          onClick={() => setOpen(false)}
          aria-current={pathname === "/kutija" ? "page" : undefined}
        >
          <span aria-hidden="true">▣</span> Moja kutija{" "}
          <span
            key={selectedRecipes.length}
            className="box-count"
            aria-label={`${selectedRecipes.length} izabranih obroka`}
          >
            {selectedRecipes.length}
          </span>
        </Link>
        <button
          type="button"
          className="mobile-toggle"
          aria-label={open ? "Zatvori navigaciju" : "Otvori navigaciju"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {open ? "×" : "☰"}
        </button>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobilna navigacija"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
