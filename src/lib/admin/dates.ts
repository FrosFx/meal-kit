import { belgradeDateString, BUSINESS_TIME_ZONE } from "../orders/rules";
import type { DateRange, SeriesPoint } from "./types";

// Rad sa kalendarskim datumima (YYYY-MM-DD) po beogradskom vremenu.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetweenInclusive(range: DateRange): number {
  return Math.round((Date.parse(range.to) - Date.parse(range.from)) / DAY_MS) + 1;
}

export function previousRange(range: DateRange): DateRange {
  const len = daysBetweenInclusive(range);
  return { from: addDays(range.from, -len), to: addDays(range.from, -1) };
}

// Ponedeljak nedelje kojoj datum pripada.
export function weekStart(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = nedelja
  return addDays(date, -((dow + 6) % 7));
}

// Offset Beograda u minutima u datom trenutku: +60 zimi, +120 leti.
function belgradeOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(at);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const m = name.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!m) return 60;
  const hours = Number(m[1]);
  return hours * 60 + Math.sign(hours) * Number(m[2] ?? 0);
}

// Trenutak (UTC) kada počinje dati beogradski kalendarski dan.
export function belgradeDayStart(date: string): Date {
  const utcMidnight = new Date(`${date}T00:00:00Z`);
  const guess = new Date(utcMidnight.getTime() - belgradeOffsetMinutes(utcMidnight) * 60_000);
  return new Date(utcMidnight.getTime() - belgradeOffsetMinutes(guess) * 60_000);
}

// [gte, lt) u UTC za ceo opseg, za upite nad createdAt.
export function rangeToInstants(range: DateRange): { gte: Date; lt: Date } {
  return { gte: belgradeDayStart(range.from), lt: belgradeDayStart(addDays(range.to, 1)) };
}

export function bucketFor(range: DateRange): "day" | "week" {
  return daysBetweenInclusive(range) <= 31 ? "day" : "week";
}

// Serija sa svim bucketima opsega (bez rupa), popunjena porudžbinama.
export function buildSeries(
  range: DateRange,
  bucket: "day" | "week",
  rows: { createdAt: Date; total: number }[],
): SeriesPoint[] {
  const points = new Map<string, SeriesPoint>();
  const first = bucket === "day" ? range.from : weekStart(range.from);
  for (let d = first; d <= range.to; d = addDays(d, bucket === "day" ? 1 : 7)) {
    points.set(d, { date: d, revenue: 0, orders: 0 });
  }
  for (const row of rows) {
    const local = belgradeDateString(row.createdAt);
    const p = points.get(bucket === "day" ? local : weekStart(local));
    if (p) {
      p.revenue += row.total;
      p.orders += 1;
    }
  }
  return [...points.values()];
}

export function todayInBelgrade(now = new Date()): string {
  return belgradeDateString(now);
}
