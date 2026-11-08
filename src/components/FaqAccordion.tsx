"use client";
import { useId, useState } from "react";
export interface FaqItem {
  question: string;
  answer: string;
}
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className="faq-item" key={item.question}>
            <h3>
              <button
                type="button"
                id={`${id}-question-${i}`}
                className="faq-question"
                aria-expanded={open}
                aria-controls={`${id}-answer-${i}`}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                <span>{item.question}</span>
                <span aria-hidden="true">+</span>
              </button>
            </h3>
            <div
              id={`${id}-answer-${i}`}
              className="faq-answer"
              data-open={open}
              role="region"
              aria-labelledby={`${id}-question-${i}`}
              inert={!open}
            >
              <div>
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
