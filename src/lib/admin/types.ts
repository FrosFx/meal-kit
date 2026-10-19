// Ugovor admin API-ja (backend ↔ frontend). Bez Prisma tipova, pa može da
// se uveze i u klijentske komponente. Novac je u RSD (ceo broj), vremena su
// ISO stringovi; "date" polja su YYYY-MM-DD po beogradskom kalendaru.

import type { Recipe, Tag } from "../types";
import type { DeliveryDay, OrderStatusKey } from "../orders/rules";

export type { OrderStatusKey, DeliveryDay };

export interface Paged<T> {
  items: T[];
  page: number; // od 1
  pageSize: number;
  totalCount: number;
  pageCount: number;
}

export interface DateRange {
  from: string; // YYYY-MM-DD, uključivo
  to: string; // YYYY-MM-DD, uključivo
}

// ---------- Pregled (KPI) ----------
export interface KpiValue {
  value: number;
  previous: number;
}

export interface SeriesPoint {
  date: string; // početak bucketa (dan, ili ponedeljak nedelje)
  revenue: number;
  orders: number;
}

export interface KpiResponse {
  range: DateRange;
  previousRange: DateRange; // ista dužina, neposredno pre
  bucket: "day" | "week"; // day ako je opseg ≤ 31 dan
  revenue: KpiValue; // zbir total, bez OTKAZANA
  orders: KpiValue; // broj porudžbina, bez OTKAZANA
  avgBasket: KpiValue; // revenue / orders, zaokruženo; 0 kad nema porudžbina
  customers: { new: KpiValue; returning: KpiValue };
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  statusCounts: { status: OrderStatusKey; count: number }[]; // svi statusi, uklj. 0
  topRecipes: RecipeStatsRow[]; // 5 po prihodu
}

// ---------- Porudžbine ----------
export interface OrderCustomerRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DeliveryWindow {
  date: string; // YYYY-MM-DD
  day: DeliveryDay;
  from: string; // "17:00"
  to: string; // "21:00"
}

export interface OrderListItem {
  id: string;
  number: string; // MK-xxxxxx
  createdAt: string;
  customer: OrderCustomerRef;
  deliveryWindow: DeliveryWindow;
  itemCount: number;
  total: number;
  status: OrderStatusKey;
}

export interface OrderItemDto {
  recipeId: string | null; // null ako je recept obrisan
  name: string; // snapshot
  emoji: string | null; // iz trenutnog recepta, null ako je obrisan
  color: string | null;
  servings: number;
  pricePerServing: number; // snapshot
  lineTotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatusKey;
  at: string;
  by: "kupac" | "admin";
}

export interface OrderDetail extends OrderListItem {
  customer: OrderCustomerRef & { phone: string };
  address: { street: string; city: string }; // snapshot iz porudžbine
  items: OrderItemDto[];
  people: number;
  mealsPerWeek: number;
  subtotal: number;
  deliveryFee: number;
  statusHistory: StatusHistoryEntry[]; // najstarije prvo
  allowedTransitions: OrderStatusKey[];
}

export type OrderSort =
  | "createdAt_desc"
  | "createdAt_asc"
  | "total_desc"
  | "total_asc"
  | "delivery_asc";

export interface OrderFilters {
  q?: string; // broj, ime, prezime, email, telefon
  status?: OrderStatusKey[];
  from?: string; // createdAt od (YYYY-MM-DD)
  to?: string;
  window?: string; // deliveryDate YYYY-MM-DD
  customerId?: string;
  sort?: OrderSort;
  page?: number;
  pageSize?: number; // podrazumevano 25, max 100
}

// ---------- Kupci ----------
export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number; // sve porudžbine
  lifetimeValue: number; // zbir total, bez OTKAZANA
  firstOrderAt: string | null;
  lastOrderAt: string | null;
}

export interface CustomerDetail extends CustomerListItem {
  deliveryAddress: string;
  createdAt: string;
  addresses: { street: string; city: string; lastUsedAt: string }[]; // iz porudžbina
  orders: OrderListItem[]; // najnovije prvo
}

export type CustomerSort = "lastOrder_desc" | "ltv_desc" | "orders_desc" | "name_asc";

// ---------- Recepti ----------
export const INGREDIENT_UNITS = ["g", "kg", "ml", "l", "kom", "kašika", "kašičica", "prstohvat"] as const;
export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];

export interface IngredientDto {
  name: string;
  quantity: number; // po porciji
  unit: IngredientUnit;
}

export interface RecipeStatsRow {
  recipeId: string | null;
  name: string;
  emoji: string | null;
  color: string | null;
  orders: number;
  servings: number;
  revenue: number; // zbir lineTotal
}

export interface AdminRecipe extends Recipe {
  active: boolean;
  ingredients: IngredientDto[];
  createdAt: string;
  updatedAt: string;
  stats: {
    orders: number;
    servings: number;
    revenue: number;
    weeklyServings: { week: string; servings: number }[]; // 12 nedelja, najstarija prva
  };
}

export interface AdminRecipeInput {
  name: string;
  description: string;
  emoji: string;
  color: string;
  tags: Tag[];
  prepMinutes: number;
  calories: number;
  pricePerServing: number;
  active?: boolean;
  ingredients?: IngredientDto[]; // ako je prisutno, zamenjuje celu listu
}

// ---------- Nabavka ----------
export interface ProcurementWindow {
  id: string; // = date
  date: string;
  day: DeliveryDay;
  from: string;
  to: string;
  orderCount: number;
}

export interface ProcurementReport {
  range: DateRange; // opseg deliveryDate
  statuses: OrderStatusKey[]; // NOVA, POTVRDJENA, U_PRIPREMI
  orders: number;
  boxes: number; // = orders (jedna kutija po porudžbini)
  servingsTotal: number;
  recipes: {
    recipeId: string | null;
    name: string;
    emoji: string | null;
    color: string | null;
    orders: number;
    servings: number;
  }[];
  ingredients: {
    name: string;
    unit: IngredientUnit;
    totalQuantity: number;
    recipes: string[];
  }[];
  missingIngredients: string[]; // nazivi recepata bez unetih sastojaka
}
