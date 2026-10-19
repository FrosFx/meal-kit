import type { ReactNode } from "react";

// Eyebrow -> h2 -> lede (MASTER 6.8). Naslov prima ReactNode da bi jedna
// reč mogla da bude u kurzivu (<em>).
export default function SectionHeader({
  eyebrow,
  title,
  lede,
  id,
  center = false,
  dark = false,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  center?: boolean;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} ${className}`}>
      <p className={`t-eyebrow ${dark ? "text-mustard" : "text-basil"}`}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`t-display-l mt-3 [&_em]:italic ${
          dark ? "text-on-forest" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`t-body-l mt-4 max-w-[52ch] ${center ? "mx-auto" : ""} ${
            dark ? "text-on-forest-muted" : "text-ink-muted"
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
