"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Omotač koji "lenjo" otkriva sadržaj tek kad uđe u vidno polje (scroll
 * reveal): opacity 0 -> 1, translateY(24px) -> 0, jednom. Stilovi su u
 * globals.css (.reveal), pa ih i deca mogu koristiti preko
 * [data-revealed="true"]. Poštuje "prefers-reduced-motion" -- tada se
 * sadržaj odmah prikazuje bez efekta (i CSS i ovde).
 */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
  fade = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  // Samo fade, bez pomeranja.
  fade?: boolean;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    // Okida kad gornja ivica pređe 85% visine ekrana.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-revealed={visible}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={`reveal ${fade ? "reveal-fade" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
