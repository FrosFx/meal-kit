// Demo podaci za admin panel: sastojci za 8 osnovnih recepata i ~60
// porudžbina u poslednjih 8 nedelja. NE pokretati bez dogovora sa vlasnikom
// baze.
//
//   npm run db:seed-demo -- --confirm          dodaje demo podatke
//   npm run db:seed-demo -- --confirm --reset  prvo briše prethodne demo podatke
//
// Demo kupci imaju email na domenu DEMO_DOMAIN; samo njih (i njihove
// porudžbine) skripta ikada briše. Pravi kupci i porudžbine se ne diraju.

import { OrderStatus, PrismaClient } from "@prisma/client";
import {
  computeDeliveryDate,
  DELIVERY_DAYS,
  ORDER_STATUS_TRANSITIONS,
  priceOrder,
} from "../src/lib/orders/rules";

const DEMO_DOMAIN = "demo.kutijaobroka.rs";
const ORDER_COUNT = 60;
const WEEKS = 8;

const prisma = new PrismaClient();

// Deterministički generator, da svako pokretanje da iste podatke.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261019);
const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];

// Sastojci po porciji, po nazivu recepta iz src/lib/recipes.ts.
const INGREDIENTS: Record<string, [string, number, string][]> = {
  "Teleći rižoto sa pečurkama": [
    ["Arborio pirinač", 90, "g"], ["Teleći medaljoni", 150, "g"], ["Šumske pečurke", 80, "g"],
    ["Parmezan", 25, "g"], ["Crni luk", 0.5, "kom"], ["Pileći temeljac", 250, "ml"], ["Maslinovo ulje", 1, "kašika"],
  ],
  "Pileći tacos sa avokadom": [
    ["Tortilje", 3, "kom"], ["Pileći file", 140, "g"], ["Avokado", 0.5, "kom"],
    ["Paradajz", 0.5, "kom"], ["Kisela pavlaka", 30, "g"], ["Začin za tacos", 1, "kašičica"],
  ],
  "Veggie bowl sa kinoom": [
    ["Kinoa", 70, "g"], ["Leblebije", 80, "g"], ["Batat", 120, "g"], ["Tahini", 1, "kašika"],
    ["Spanać", 40, "g"], ["Limun", 0.25, "kom"],
  ],
  "Losos teriyaki sa pirinčem": [
    ["Losos file", 160, "g"], ["Jasmin pirinač", 80, "g"], ["Brokoli", 120, "g"],
    ["Teriyaki sos", 2, "kašika"], ["Susam", 1, "kašičica"],
  ],
  "Makarone bolonjeze": [
    ["Makarone", 110, "g"], ["Mleveno meso", 130, "g"], ["Pasirani paradajz", 150, "ml"],
    ["Crni luk", 0.5, "kom"], ["Beli luk", 1, "kom"], ["Parmezan", 15, "g"],
  ],
  "Curry od povrća sa kokosovim mlekom": [
    ["Batat", 150, "g"], ["Spanać", 50, "g"], ["Kokosovo mleko", 120, "ml"],
    ["Curry pasta", 1, "kašika"], ["Jasmin pirinač", 70, "g"], ["Crni luk", 0.5, "kom"],
  ],
  "Piletina Cezar salata": [
    ["Pileći file", 130, "g"], ["Zelena salata", 1, "kom"], ["Parmezan", 20, "g"],
    ["Krutoni", 30, "g"], ["Cezar preliv", 2, "kašika"],
  ],
  "Domaći burger od govedine": [
    ["Mleveno meso", 180, "g"], ["Pecivo za burger", 1, "kom"], ["Čedar", 1, "kom"],
    ["Crni luk", 0.5, "kom"], ["Krompir", 200, "g"], ["So", 1, "prstohvat"],
  ],
};

const FIRST = ["Ana", "Marko", "Jelena", "Nikola", "Milica", "Stefan", "Jovana", "Luka", "Tamara", "Đorđe",
  "Ivana", "Nemanja", "Katarina", "Miloš", "Sanja", "Uroš", "Teodora", "Vuk", "Marija", "Filip"];
const LAST = ["Petrović", "Jovanović", "Nikolić", "Marković", "Đorđević", "Stojanović", "Ilić", "Stanković",
  "Pavlović", "Milošević", "Popović", "Šćepanović", "Kostić", "Živković", "Todorović"];
const STREETS = ["Bulevar oslobođenja", "Knez Mihailova", "Cara Dušana", "Njegoševa", "Vojvode Stepe",
  "Zmaj Jovina", "Kralja Petra", "Bulevar kralja Aleksandra", "Gospodar Jevremova", "Nemanjina"];
const CITIES = ["Beograd", "Beograd", "Beograd", "Novi Sad", "Novi Sad", "Niš", "Kragujevac", "Pančevo"];

const ascii = (s: string) =>
  s.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");

// Lanac statusa od NOVA do ciljnog, po dozvoljenim prelazima.
function statusPath(target: OrderStatus): OrderStatus[] {
  const paths: Record<OrderStatus, OrderStatus[]> = {
    NOVA: ["NOVA"],
    POTVRDJENA: ["NOVA", "POTVRDJENA"],
    U_PRIPREMI: ["NOVA", "POTVRDJENA", "U_PRIPREMI"],
    POSLATA: ["NOVA", "POTVRDJENA", "U_PRIPREMI", "POSLATA"],
    ISPORUCENA: ["NOVA", "POTVRDJENA", "U_PRIPREMI", "POSLATA", "ISPORUCENA"],
    OTKAZANA: ["NOVA", "OTKAZANA"],
  };
  const path = paths[target];
  for (let i = 1; i < path.length; i++) {
    if (!ORDER_STATUS_TRANSITIONS[path[i - 1]].includes(path[i])) throw new Error(`Nedozvoljen prelaz u seed-u: ${path[i - 1]} -> ${path[i]}`);
  }
  return path;
}

async function seedIngredients() {
  const recipes = await prisma.recipe.findMany({ include: { _count: { select: { ingredients: true } } } });
  let added = 0;
  for (const r of recipes) {
    const list = INGREDIENTS[r.name];
    if (!list || r._count.ingredients > 0) continue;
    await prisma.recipeIngredient.createMany({
      data: list.map(([name, quantityPerServing, unit]) => ({ recipeId: r.id, name, quantityPerServing, unit })),
    });
    added++;
  }
  console.log(`Sastojci dodati za ${added} recepata.`);
}

async function resetDemo() {
  const where = { customer: { email: { endsWith: `@${DEMO_DOMAIN}` } } };
  const orders = await prisma.order.deleteMany({ where });
  const customers = await prisma.customer.deleteMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } } });
  console.log(`Obrisano demo podataka: ${orders.count} porudžbina, ${customers.count} kupaca.`);
}

async function seedOrders() {
  const recipes = await prisma.recipe.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  if (recipes.length < 4) throw new Error("Potrebno je bar 4 aktivna recepta.");

  const customerCount = 34;
  const customers = Array.from({ length: customerCount }, (_, i) => {
    const firstName = FIRST[i % FIRST.length];
    const lastName = pick(LAST);
    return {
      firstName,
      lastName,
      email: `${ascii(firstName)}.${ascii(lastName)}${i}@${DEMO_DOMAIN}`,
      phone: `+3816${Math.floor(rand() * 5)}${String(Math.floor(1000000 + rand() * 8999999))}`,
      deliveryAddress: `${pick(STREETS)} ${1 + Math.floor(rand() * 120)}`,
      city: pick(CITIES),
    };
  });

  const now = Date.now();
  const span = WEEKS * 7 * 86_400_000;
  // Porudžbine sortirane po vremenu, sa blagim rastom ka skorijim nedeljama.
  const times = Array.from({ length: ORDER_COUNT }, () => now - span * (1 - Math.sqrt(rand()))).sort((a, b) => a - b);
  // Prvih ~60% porudžbina od novih kupaca, ostatak delom od povratnih.
  let nextNew = 0;
  let created = 0;

  for (const t of times) {
    const createdAt = new Date(t);
    const isReturning = nextNew >= customerCount || (nextNew > 5 && rand() < 0.4);
    const c = isReturning ? customers[Math.floor(rand() * nextNew)] : customers[nextNew++];
    const people = rand() < 0.65 ? 2 : 4;
    const mealsPerWeek = pick([2, 3, 3, 4] as const);
    const chosen = [...recipes].sort(() => rand() - 0.5).slice(0, mealsPerWeek);
    const totals = priceOrder(chosen, people);
    const deliveryDay = pick(DELIVERY_DAYS);
    const deliveryDate = computeDeliveryDate(deliveryDay, createdAt);
    const daysToDelivery = (deliveryDate.getTime() - now) / 86_400_000;

    let target: OrderStatus;
    if (rand() < 0.08) target = "OTKAZANA";
    else if (daysToDelivery < -1) target = "ISPORUCENA";
    else if (daysToDelivery < 0) target = "POSLATA";
    else if (daysToDelivery < 2) target = "U_PRIPREMI";
    else target = rand() < 0.5 ? "POTVRDJENA" : "NOVA";
    const path = statusPath(target);
    const stepMs = Math.max(60_000, Math.min(deliveryDate.getTime(), now) - t) / path.length;

    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      create: { ...c, createdAt },
      update: { phone: c.phone, deliveryAddress: c.deliveryAddress, city: c.city },
    });

    for (let attempt = 0; ; attempt++) {
      try {
        await prisma.order.create({
          data: {
            number: `MK-${Math.floor(100000 + rand() * 900000)}`,
            status: target,
            deliveryDay,
            deliveryDate,
            deliveryAddress: c.deliveryAddress,
            city: c.city,
            people,
            mealsPerWeek,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            total: totals.total,
            customerId: customer.id,
            createdAt,
            updatedAt: new Date(t + stepMs * (path.length - 1)),
            items: {
              create: totals.lines.map((l) => ({
                recipeId: l.recipeId,
                recipeName: l.recipeName,
                pricePerServing: l.pricePerServing,
                servings: l.servings,
              })),
            },
            statusChanges: {
              create: path.map((status, i) => ({
                status,
                byAdmin: i > 0,
                createdAt: new Date(t + stepMs * i),
              })),
            },
          },
        });
        break;
      } catch (error) {
        if ((error as { code?: string }).code === "P2002" && attempt < 5) continue;
        throw error;
      }
    }
    created++;
  }
  console.log(`Ubačeno ${created} demo porudžbina za ${nextNew} kupaca.`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (!args.has("--confirm")) {
    console.error("Ova skripta upisuje demo podatke u bazu iz DATABASE_URL. Pokreni sa --confirm.");
    process.exit(1);
  }
  if (args.has("--reset")) await resetDemo();
  else {
    const existing = await prisma.order.count({ where: { customer: { email: { endsWith: `@${DEMO_DOMAIN}` } } } });
    if (existing > 0) {
      console.log(`Demo porudžbine već postoje (${existing}). Za ponovno punjenje dodaj --reset.`);
      await seedIngredients();
      return;
    }
  }
  await seedIngredients();
  await seedOrders();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
