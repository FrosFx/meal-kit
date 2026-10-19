"use client";

import { useId, useState } from "react";
import Icon from "@/components/icons";

export interface FaqItem {
  question: string;
  answer: string;
}

// Jedno otvoreno pitanje u isto vreme, prvo otvoreno (MASTER 6.9).
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="group flex min-h-16 w-full items-center justify-between gap-4 py-5 text-left text-[17px] leading-snug font-semibold text-ink transition-colors hover:text-basil"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={`accordion-icon grid size-8 shrink-0 place-items-center rounded-full border ${
                    open
                      ? "rotate-45 border-basil bg-basil text-paper"
                      : "border-line-strong text-ink"
                  }`}
                >
                  <Icon name="plus" size="sm" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={open}
              className="accordion-panel"
              inert={!open}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-6 text-ink-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
