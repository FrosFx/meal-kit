"use client";
import { useEffect, useRef, ReactNode } from "react";
/** Progressive enhancement: content is visible with JavaScript disabled. */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || node.getBoundingClientRect().top < window.innerHeight)
      return;
    node.dataset.pending = "true";
    const show = () => {
      delete node.dataset.pending;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -35px 0px" },
    );
    const onMotion = () => {
      if (motion.matches) {
        show();
        observer.disconnect();
      }
    };
    observer.observe(node);
    motion.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      show();
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
