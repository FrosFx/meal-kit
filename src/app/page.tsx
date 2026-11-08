import Link from "next/link";
import nextDynamic from "next/dynamic";
import { db } from "@/lib/db";
import { toAppRecipe } from "@/lib/recipeSerialization";
import RecipeCard from "@/components/RecipeCard";
import Reveal from "@/components/Reveal";
import MealIllustration from "@/components/MealIllustration";

// Stranica čita recepte direktno iz baze -- bez ovoga bi Next.js
// "zamrzao" ove brojke u trenutku build-a umesto da ih osvežava pri
// svakoj poseti (a admin panel menja recepte u bilo kom trenutku).
// Napomena: ime "dynamic" je rezervisano za ovaj izvoz od strane
// Next.js-a, zato je next/dynamic uvezen ovde kao nextDynamic.
export const dynamic = "force-dynamic";

// FAQ nosi sopstveni state (koja stavka je otvorena) i nije potreban za
// prvi prikaz stranice, pa se lenjo učitava kao poseban JS paket -- učita
// se tek kad je stranica spremna, umesto da uveća početni bandl.
const FaqAccordion = nextDynamic(() => import("@/components/FaqAccordion"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
  ),
});

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
      'Da, plan (broj osoba i broj obroka nedeljno) menjaš u svakom trenutku u sekciji "Moja kutija", pre nego što potvrdiš porudžbinu.',
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

export default async function Home() {
  const rows = await db.recipe.findMany({ orderBy: { createdAt: "asc" } });
  const recipes = rows.map(toAppRecipe);
  const prices = recipes.map((r) => r.pricePerServing);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const preview = recipes.slice(0, 3);

  const stats = [
    { value: `${recipes.length || "—"}`, label: "recepata na meniju" },
    { value: minPrice ? `od ${minPrice} RSD` : "—", label: "po porciji" },
    { value: "< 30 min", label: "do gotovog obroka" },
  ];

  const deliveryFee = 350;
  const weeklyEstimate = (people: 2 | 4) =>
    minPrice && maxPrice
      ? {
          low: minPrice * people * 3 + deliveryFee,
          high: maxPrice * people * 3 + deliveryFee,
        }
      : null;

  return (
    <div className="home-page">
      <section className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">
            <span className="live-dot" /> SVEŽA NEDELJA. NOVI UKUSI.
          </p>
          <h1 className="hero-enter">
            Manje planiranja.
            <br />
            Više <span className="serif-word">uživanja.</span>
          </h1>
          <p className="hero-description hero-enter">
            Dobra hrana počinje tvojom kutijom. Ti biraš recepte, mi šaljemo
            sveže sastojke. A najbolji deo? Kuvaš ti.
          </p>
          <div className="hero-actions hero-enter">
            <Link href="/meni" className="button-primary">
              Pronađi svoj sledeći obrok <span aria-hidden="true">↗</span>
            </Link>
            <a href="#kako-radi" className="text-link">
              Kako funkcioniše <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-note hero-enter">
            <span aria-hidden="true">✓</span> Sveže namirnice{" "}
            <span aria-hidden="true">·</span> Tvoj ritam{" "}
            <span aria-hidden="true">·</span> Bez komplikovanja
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-spark spark-one" aria-hidden="true">
            ✳
          </span>
          <span className="art-spark spark-two" aria-hidden="true">
            ✳
          </span>
          <div className="hero-plate">
            <MealIllustration />
          </div>
          <div className="floating-note note-top">
            <span className="note-icon" aria-hidden="true">
              ↗
            </span>
            <div>
              Sveže ideje.
              <br />
              <strong>Još svežiji sastojci.</strong>
            </div>
          </div>
          <div className="floating-note note-bottom">
            <span className="note-icon" aria-hidden="true">
              ◷
            </span>
            <div>
              Manje od <strong>30 min</strong>
              <br />
              <small>od kutije do tanjira</small>
            </div>
          </div>
          <div className="round-stamp" aria-hidden="true">
            MALO TRUDA
            <br />
            <span>mnogo</span>
            <br />
            DOBROG UKUSA
          </div>
          <span className="art-caption">DOBAR DAN POČINJE DOBRIM OBROKOM.</span>
        </div>
      </section>
      <div className="promise-strip">
        <span>Ti biraš. Mi pripremamo.</span>
        <span aria-hidden="true">✳</span>
        <span>Sveže do tvojih vrata.</span>
        <span aria-hidden="true">✳</span>
        <span>Svaki zalogaj se računa.</span>
        <span aria-hidden="true">✳</span>
      </div>

      <section id="kako-radi" className="section-shell section-space">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">OD KUTIJE DO TANJIRA</p>
            <h2>
              Dobar obrok.
              <br />
              <span className="serif-word">Tri jednostavna koraka.</span>
            </h2>
          </div>
          <p>
            Bez liste za kupovinu i večitog pitanja „šta danas kuvamo?“. Samo ti
            i nešto ukusno.
          </p>
        </Reveal>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <Reveal key={step.title} delayMs={i * 100} className="step">
              <div className="step-top">
                <span className="step-number">0{i + 1}</span>
                <span className="step-icon" aria-hidden="true">
                  {step.emoji}
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {preview.length > 0 && (
        <section className="menu-section">
          <div className="section-shell section-space">
            <Reveal className="section-heading">
              <div>
                <p className="eyebrow">SVEŽE NA MENIJU</p>
                <h2>
                  Tvoja nedelja,
                  <br />
                  <span className="serif-word">sa više ukusa.</span>
                </h2>
              </div>
              <Link href="/meni" className="button-outline">
                Istraži ceo meni <span aria-hidden="true">↗</span>
              </Link>
            </Reveal>
            <div className="recipe-grid">
              {preview.map((recipe, i) => (
                <Reveal key={recipe.id} delayMs={i * 100}>
                  <RecipeCard recipe={recipe} />
                </Reveal>
              ))}
            </div>
            <div className="menu-footnote">
              <span>Svake nedelje nova inspiracija za tvoj sto.</span>
              <span>{recipes.length} recepata za istraživanje ↗</span>
            </div>
          </div>
        </section>
      )}

      <section className="section-shell section-space">
        <Reveal className="benefit-panel">
          <div className="benefit-intro">
            <p className="eyebrow">MANJE OBAVEZA, VIŠE ŽIVOTA</p>
            <h2>
              Vratimo uživanje
              <br />u <span className="serif-word">kuhinju.</span>
            </h2>
            <p>
              Za večere u dvoje, porodični sto i one dane kada ti treba jedna
              obaveza manje.
            </p>
            <Link href="/meni" className="button-lime">
              Šta se danas kuva? <span aria-hidden="true">↗</span>
            </Link>
            <span className="benefit-star" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="benefit-list">
            {benefits.map((b) => (
              <div key={b.title}>
                <span aria-hidden="true">{b.emoji}</span>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="stats-row">
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </Reveal>
      </section>

      {minPrice !== null && maxPrice !== null && (
        <section className="plan-section">
          <div className="section-shell section-space">
            <Reveal className="section-heading">
              <div>
                <p className="eyebrow">TVOJA KUTIJA. TVOJA PRAVILA.</p>
                <h2>
                  Za tvoj sto.
                  <br />
                  <span className="serif-word">I tvoj apetit.</span>
                </h2>
              </div>
              <p>
                Izaberi društvo, pa obroke. Tačan iznos zavisi od recepata koje
                dodaš u kutiju.
              </p>
            </Reveal>
            <div className="plans-grid">
              {([2, 4] as const).map((people, i) => {
                const estimate = weeklyEstimate(people);
                return (
                  <Reveal
                    key={people}
                    delayMs={i * 100}
                    className={`plan-card ${i === 1 ? "plan-featured" : ""}`}
                  >
                    <div className="plan-top">
                      <span className="eyebrow">
                        {people === 2 ? "ZA VAS DVOJE" : "ZA CEO STO"}
                      </span>
                      <span aria-hidden="true">{people === 2 ? "◒" : "✳"}</span>
                    </div>
                    <h3>
                      {people} osobe<span> · 3 obroka</span>
                    </h3>
                    <p className="plan-price">
                      {estimate
                        ? `${estimate.low.toLocaleString("sr-RS")}–${estimate.high.toLocaleString("sr-RS")}`
                        : "—"}{" "}
                      <small>RSD</small>
                    </p>
                    <p className="plan-description">
                      Okvirno nedeljno, sa uključenom dostavom.
                    </p>
                    <Link
                      href="/kutija"
                      className={i === 1 ? "button-lime" : "button-primary"}
                    >
                      Sastavi svoju kutiju <span aria-hidden="true">↗</span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <p className="price-note">
              Procena na osnovu trenutnog menija. Konačnu cenu vidiš pre potvrde
              porudžbine.
            </p>
          </div>
        </section>
      )}

      <section className="section-shell section-space faq-section">
        <Reveal>
          <p className="eyebrow">JOŠ NEŠTO TE ZANIMA?</p>
          <h2>
            Dobra pitanja.
            <br />
            <span className="serif-word">Jasni odgovori.</span>
          </h2>
          <p className="faq-intro">
            Sve što treba da znaš pre nego što prva kutija stigne do tvojih
            vrata.
          </p>
        </Reveal>
        <Reveal>
          <FaqAccordion items={faqItems} />
        </Reveal>
      </section>
      <section className="section-shell final-section">
        <Reveal className="final-cta">
          <span className="cta-star" aria-hidden="true">
            ✳
          </span>
          <p className="eyebrow">VEČERAS KUVAMO NEŠTO DOBRO.</p>
          <h2>
            Tvoj sledeći omiljeni obrok
            <br />
            je u <span className="serif-word">ovoj kutiji.</span>
          </h2>
          <Link href="/meni" className="button-primary">
            Hajde da kuvamo <span aria-hidden="true">↗</span>
          </Link>
          <p>Sveži sastojci. Jednostavni recepti. Tvoje malo remek-delo.</p>
        </Reveal>
      </section>
    </div>
  );
}
