import Reveal from "@/components/Reveal";
import Icon, { type IconName } from "@/components/icons";

const items: { icon: IconName; label: string }[] = [
  { icon: "scale", label: "Tačno izmereni sastojci" },
  { icon: "chef-hat", label: "Recepti korak po korak" },
  { icon: "truck", label: "Dostava na kućnu adresu" },
  { icon: "calendar-sync", label: "Bez dugoročne obaveze" },
];

export default function ValueStrip() {
  return (
    <section aria-label="Šta dobijaš" className="border-y border-line bg-paper-2 py-6 lg:py-8">
      <ul className="container-page grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((item, i) => (
          <Reveal
            as="li"
            fade
            key={item.label}
            delayMs={i * 70}
            className="relative flex flex-col items-start gap-2 md:items-center md:text-center lg:flex-row lg:justify-center lg:gap-3 lg:text-left"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 -left-[15px] hidden size-1.5 -translate-y-1/2 rounded-full bg-mustard lg:block"
              />
            )}
            <Icon name={item.icon} size="lg" className="shrink-0 text-basil" />
            <span className="leading-tight font-semibold text-ink">{item.label}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
