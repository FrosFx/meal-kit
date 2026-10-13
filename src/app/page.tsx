import { db } from "@/lib/db";
import { toAppRecipe } from "@/lib/recipeSerialization";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import RecipeShowcase from "@/components/home/RecipeShowcase";
import WhyUs from "@/components/home/WhyUs";
import PricingPreview from "@/components/home/PricingPreview";
import FaqSection from "@/components/home/FaqSection";
import FinalCta from "@/components/home/FinalCta";

const steps = [
  {
    emoji: "📋",
    title: "Izaberi plan",
    text: "Odaberi veličinu domaćinstva i koliko obroka nedeljno želiš da kuvaš.",
  },
  {
    emoji: "🍽️",
    title: "Izaberi recepte",
    text: "Pregledaj nedeljni meni i dodaj obroke koji te zanimaju u kutiju.",
  },
  {
    emoji: "🚚",
    title: "Dostava do vrata",
    text: "Sastojci i recepti stižu isečeni, izmereni i spremni za kuvanje.",
  },
];

const benefits = [
  {
    emoji: "🥕",
    title: "Sveži, izmereni sastojci",
    text: "Tačno onoliko koliko receptu treba — bez pogađanja količina i bez bačene hrane.",
  },
  {
    emoji: "⏱️",
    title: "Manje vremena u kuhinji",
    text: "Većina recepata je gotova za manje od 30 minuta, uz jasna uputstva korak po korak.",
  },
  {
    emoji: "🗓️",
    title: "Fleksibilan plan",
    text: "Menjaš broj obroka i veličinu porcija iz nedelje u nedelju, bez dugoročne obaveze.",
  },
  {
    emoji: "🌱",
    title: "Nešto za svakoga",
    text: "Vegetarijansko, bez glutena, brzo za pripremu, porodično — filtriraš po tome šta ti treba.",
  },
];

const faqItems = [
  {
    question: "Kako biram obroke svake nedelje?",
    answer:
      "Meni se menja nedeljno. Pregledaš ponudu, filtriraš po tagovima (vegetarijansko, brzo, bez glutena...) i dodaješ obroke u kutiju dok ne popuniš plan.",
  },
  {
    question: "Mogu li da promenim broj obroka ili osoba?",
    answer:
      "Da, plan (broj osoba i broj obroka nedeljno) menjaš u svakom trenutku u sekciji \"Moja kutija\", pre nego što potvrdiš porudžbinu.",
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

// Čita recepte iz baze pri svakoj poseti -- bez ovoga bi Next.js "zamrzao"
// brojke u trenutku build-a (admin panel menja recepte u bilo kom trenutku).
export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await db.recipe.findMany({ orderBy: { createdAt: "asc" } });
  const recipes = rows.map(toAppRecipe);
  const prices = recipes.map((r) => r.pricePerServing);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const showcase = recipes.slice(0, 6);
  const preview = recipes.slice(0, 3);

  const stats = [
    { value: `${recipes.length || "—"}`, label: "recepata na meniju" },
    { value: minPrice ? `od ${minPrice}` : "—", label: "RSD po porciji" },
    { value: "< 30 min", label: "do gotovog obroka" },
  ];

  return (
    <div className="flex flex-col items-center">
      <Hero stats={stats} showcase={showcase} />
      <HowItWorks steps={steps} />
      <RecipeShowcase recipes={preview} />
      <WhyUs benefits={benefits} />
      <PricingPreview minPrice={minPrice} maxPrice={maxPrice} />
      <FaqSection items={faqItems} />
      <FinalCta />
    </div>
  );
}
