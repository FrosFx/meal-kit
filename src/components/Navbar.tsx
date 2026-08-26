"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBox } from "@/context/BoxContext";

const links = [
  { href: "/", label: "Početna" },
  { href: "/meni", label: "Nedeljni meni" },
  { href: "/kutija", label: "Moja kutija" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { selectedRecipes } = useBox();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span>🍲</span>
          <span>KutijaObroka</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-emerald-600 ${
                pathname === link.href
                  ? "text-emerald-600"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {link.label === "Moja kutija" ? (
                <span className="inline-flex items-center gap-1.5">
                  {link.label}
                  {selectedRecipes.length > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-semibold text-white">
                      {selectedRecipes.length}
                    </span>
                  )}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
