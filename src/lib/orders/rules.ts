import { DELIVERY_FEE } from "../pricing";

// Poslovna pravila porudžbine, zajednička za API, admin i seed.

export const ALLOWED_PEOPLE = [2, 4] as const;
export const ALLOWED_MEALS_PER_WEEK = [2, 3, 4] as const;
export const MAX_RECIPES_PER_ORDER = 20;

// Isti dani kao u checkout formi.
export const DELIVERY_DAYS = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"] as const;
export type DeliveryDay = (typeof DELIVERY_DAYS)[number];

// Dostava se zakazuje najranije ovoliko dana posle porudžbine.
export const MIN_LEAD_DAYS = 2;
// Vremenski prozor dostave (prikaz u adminu).
export const DELIVERY_WINDOW = { from: "17:00", to: "21:00" } as const;
export const BUSINESS_TIME_ZONE = "Europe/Belgrade";

export const ORDER_STATUSES = [
  "NOVA",
  "POTVRDJENA",
  "U_PRIPREMI",
  "POSLATA",
  "ISPORUCENA",
  "OTKAZANA",
] as const;
export type OrderStatusKey = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusKey, string> = {
  NOVA: "Nova",
  POTVRDJENA: "Potvrđena",
  U_PRIPREMI: "U pripremi",
  POSLATA: "Poslata",
  ISPORUCENA: "Isporučena",
  OTKAZANA: "Otkazana",
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatusKey, readonly OrderStatusKey[]> = {
  NOVA: ["POTVRDJENA", "U_PRIPREMI", "OTKAZANA"],
  POTVRDJENA: ["U_PRIPREMI", "OTKAZANA"],
  U_PRIPREMI: ["POSLATA", "OTKAZANA"],
  POSLATA: ["ISPORUCENA"],
  ISPORUCENA: [],
  OTKAZANA: ["NOVA"],
};

export function canTransition(from: OrderStatusKey, to: OrderStatusKey): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

// Statusi za koje se nabavljaju sastojci.
export const PROCUREMENT_STATUSES: readonly OrderStatusKey[] = ["NOVA", "POTVRDJENA", "U_PRIPREMI"];
// Statusi koji ulaze u prihod i KPI (sve osim otkazanih).
export const REVENUE_STATUSES: readonly OrderStatusKey[] = ORDER_STATUSES.filter(
  (s) => s !== "OTKAZANA",
);

export interface PricedLine {
  recipeId: string;
  recipeName: string;
  pricePerServing: number;
  servings: number;
  lineTotal: number;
}

export interface OrderTotals {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Ista formula kao BoxContext: svaki izabrani recept × broj osoba, plus
// fiksna dostava kad kutija nije prazna. Cene uvek dolaze iz baze.
export function priceOrder(
  recipes: { id: string; name: string; pricePerServing: number }[],
  people: number,
): OrderTotals {
  const lines = recipes.map((r) => ({
    recipeId: r.id,
    recipeName: r.name,
    pricePerServing: r.pricePerServing,
    servings: people,
    lineTotal: r.pricePerServing * people,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = lines.length > 0 ? DELIVERY_FEE : 0;
  return { lines, subtotal, deliveryFee, total: subtotal + deliveryFee };
}

// Kalendarski datum (YYYY-MM-DD) u Beogradu za dati trenutak.
export function belgradeDateString(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

// Prvi izabrani radni dan koji je bar MIN_LEAD_DAYS dana posle porudžbine
// (po beogradskom kalendaru). Vraća datum kao UTC ponoć (kolona je DATE).
export function computeDeliveryDate(day: DeliveryDay, orderedAt: Date): Date {
  const targetDow = DELIVERY_DAYS.indexOf(day) + 1; // 1 = ponedeljak
  const [y, m, d] = belgradeDateString(orderedAt).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + MIN_LEAD_DAYS));
  while (date.getUTCDay() !== targetDow) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
