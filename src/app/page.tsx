import type { Metadata } from "next";
import { getHomeData } from "@/lib/home";
import Hero from "@/components/home/Hero";
import ValueStrip from "@/components/home/ValueStrip";
import HowItWorks, { type Step } from "@/components/home/HowItWorks";
import MenuSection from "@/components/home/MenuSection";
import WhyUs from "@/components/home/WhyUs";
import Pricing from "@/components/home/Pricing";
import FaqSection from "@/components/home/FaqSection";
import FinalCta from "@/components/home/FinalCta";
import type { FaqItem } from "@/components/FaqAccordion";

const title = "KutijaObroka — sveži obroci na tvojim vratima";
const description =
  "Izmereni sastojci i jednostavni recepti dostavljeni na kućnu adresu. Izaberi plan i obroke iz nedeljnog menija — gotovo za manje od 30 minuta.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/" },
};

const steps: Step[] = [
  {
    icon: "utensils",
    title: "Izaberi plan",
    text: "Odaberi veličinu domaćinstva i koliko obroka nedeljno želiš da kuvaš.",
  },
  {
    icon: "shopping-basket",
    title: "Izaberi recepte",
    text: "Pregledaj nedeljni meni i dodaj obroke koji te zanimaju u kutiju.",
  },
  {
    icon: "truck",
    title: "Dostava do vrata",
    text: "Sastojci i recepti stižu isečeni, izmereni i spremni za kuvanje.",
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Kako biram obroke svake nedelje?",
    answer:
      "Meni se menja nedeljno. Pregledaš ponudu, filtriraš po tagovima (vegetarijansko, brzo, bez glutena...) i dodaješ obroke u kutiju dok ne popuniš plan.",
  },
  {
    question: "Mogu li da promenim broj obroka ili osoba?",
    answer:
      "Da, plan (broj osoba i broj obroka nedeljno) menjaš u svakom trenutku u sekciji „Moja kutija”, pre nego što potvrdiš porudžbinu.",
  },
  {
    question: "Ima li vegetarijanskih ili bezglutenskih opcija?",
    answer:
      "Da — svaki recept je označen tagovima, tako da lako filtriraš meni po ishrani koja ti odgovara.",
  },
  {
    question: "Koliko traje priprema obroka?",
    answer:
      "Većina recepata je spremna za manje od 30 minuta, uz sastojke koji stižu već izmereni.",
  },
  {
    question: "Kako se formira cena?",
    answer:
      "Cena zavisi od izabranih recepata (varira po porciji) i broja osoba, plus fiksna dostava po kutiji. Tačan iznos vidiš pre potvrde porudžbine.",
  },
];

// getHomeData() poziva connection(), pa se strana uvek renderuje po zahtevu
// (admin panel menja recepte u bilo kom trenutku).
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getHomeData();
  const { minPrice, maxPrice } = data.stats;
  const showPricing = data.status === "ok" && minPrice !== null && maxPrice !== null;

  return (
    <>
      {/* Bez cena na strani i linkovi "Cene" (nav, footer) nemaju kuda da vode. */}
      {!showPricing && <style>{`[data-nav-anchor="cene"]{display:none}`}</style>}
      <Hero data={data} />
      <ValueStrip />
      <HowItWorks steps={steps} />
      <MenuSection data={data} />
      <WhyUs data={data} />
      {showPricing && (
        <Pricing minPrice={minPrice} maxPrice={maxPrice} deliveryFee={data.deliveryFee} />
      )}
      <FaqSection items={faqItems} />
      <FinalCta data={data} />
    </>
  );
}
