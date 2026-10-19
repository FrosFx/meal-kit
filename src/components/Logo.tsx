// Znak (otvorena kutija sa parom) + "Kutija*Obroka*" (MASTER 6.7 / 6.10).
export default function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 28 28"
        width={28}
        height={28}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={onDark ? "text-mustard" : "text-paprika"}
        aria-hidden="true"
      >
        <path d="M4 13h20l-2 11H6L4 13Z" />
        <path d="M4 13 2 9h9l3 4" />
        <path d="M24 13l2-4h-9l-3 4" />
        <path d="M11 6c-1.2-1.4 1.2-2.6 0-4" />
        <path d="M16 6c-1.2-1.4 1.2-2.6 0-4" />
      </svg>
      <span
        className={`fraunces text-[22px] leading-none font-semibold tracking-[-0.01em] ${
          onDark ? "text-on-footer" : "text-ink"
        }`}
      >
        Kutija
        <span className={`italic ${onDark ? "text-mustard" : ""}`}>Obroka</span>
      </span>
    </span>
  );
}
