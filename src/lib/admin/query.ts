import { ORDER_STATUSES, OrderStatusKey } from "../orders/rules";
import type { FieldErrors, ValidationResult } from "../validation";
import { addDays, daysBetweenInclusive, isDateString, todayInBelgrade } from "./dates";
import type { CustomerSort, DateRange, OrderFilters, OrderSort } from "./types";

// Parsiranje query parametara admin ruta. Neispravna vrednost daje 400 sa
// porukom po parametru (ne ignoriše se tiho).

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
const MAX_RANGE_DAYS = 731;

const ORDER_SORTS: OrderSort[] = ["createdAt_desc", "createdAt_asc", "total_desc", "total_asc", "delivery_asc"];
const CUSTOMER_SORTS: CustomerSort[] = ["lastOrder_desc", "ltv_desc", "orders_desc", "name_asc"];

function parsePositiveInt(raw: string | null, fallback: number, max: number, key: string, errors: FieldErrors) {
  if (raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > max) {
    errors[key] = `${key} mora biti ceo broj od 1 do ${max}.`;
    return fallback;
  }
  return n;
}

export function parsePaging(params: URLSearchParams, errors: FieldErrors) {
  return {
    page: parsePositiveInt(params.get("page"), 1, 100000, "page", errors),
    pageSize: parsePositiveInt(params.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "pageSize", errors),
  };
}

function parseOptionalDate(params: URLSearchParams, key: string, errors: FieldErrors): string | undefined {
  const raw = params.get(key);
  if (raw === null || raw === "") return undefined;
  if (!isDateString(raw)) {
    errors[key] = `${key} mora biti datum u formatu YYYY-MM-DD.`;
    return undefined;
  }
  return raw;
}

// Opseg sa podrazumevanom vrednošću: poslednjih `defaultDays` dana sa danas.
export function parseRange(
  params: URLSearchParams,
  defaultDays = 30,
  now = new Date(),
): ValidationResult<DateRange> {
  const errors: FieldErrors = {};
  const to = parseOptionalDate(params, "to", errors) ?? todayInBelgrade(now);
  const from = parseOptionalDate(params, "from", errors) ?? addDays(to, -(defaultDays - 1));
  if (Object.keys(errors).length === 0) {
    if (from > to) errors.from = "from ne sme biti posle to.";
    else if (daysBetweenInclusive({ from, to }) > MAX_RANGE_DAYS) errors.from = "Opseg je predugačak (najviše 2 godine).";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { from, to } };
}

export function parseStatuses(raw: string | null, errors: FieldErrors): OrderStatusKey[] | undefined {
  if (!raw) return undefined;
  const list = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
  const bad = list.filter((s) => !(ORDER_STATUSES as readonly string[]).includes(s));
  if (bad.length) {
    errors.status = `Nepoznat status: ${bad.join(", ")}.`;
    return undefined;
  }
  return list as OrderStatusKey[];
}

function parseQ(params: URLSearchParams, errors: FieldErrors): string | undefined {
  const q = params.get("q")?.trim();
  if (!q) return undefined;
  if (q.length > 100) {
    errors.q = "Pretraga može imati najviše 100 karaktera.";
    return undefined;
  }
  return q;
}

export function parseOrderFilters(params: URLSearchParams): ValidationResult<Required<Pick<OrderFilters, "page" | "pageSize" | "sort">> & OrderFilters> {
  const errors: FieldErrors = {};
  const { page, pageSize } = parsePaging(params, errors);
  const sortRaw = params.get("sort") ?? "createdAt_desc";
  if (!ORDER_SORTS.includes(sortRaw as OrderSort)) errors.sort = "Nepoznato sortiranje.";
  const customerId = params.get("customerId") ?? undefined;
  if (customerId !== undefined && !/^[A-Za-z0-9_-]{1,64}$/.test(customerId)) errors.customerId = "Neispravan kupac.";
  const filters = {
    q: parseQ(params, errors),
    status: parseStatuses(params.get("status"), errors),
    from: parseOptionalDate(params, "from", errors),
    to: parseOptionalDate(params, "to", errors),
    window: parseOptionalDate(params, "window", errors),
    customerId,
    sort: sortRaw as OrderSort,
    page,
    pageSize,
  };
  if (filters.from && filters.to && filters.from > filters.to) errors.from = "from ne sme biti posle to.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: filters };
}

export function parseCustomerQuery(params: URLSearchParams): ValidationResult<{
  q?: string;
  sort: CustomerSort;
  page: number;
  pageSize: number;
}> {
  const errors: FieldErrors = {};
  const { page, pageSize } = parsePaging(params, errors);
  const sort = (params.get("sort") ?? "lastOrder_desc") as CustomerSort;
  if (!CUSTOMER_SORTS.includes(sort)) errors.sort = "Nepoznato sortiranje.";
  const q = parseQ(params, errors);
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { q, sort, page, pageSize } };
}
