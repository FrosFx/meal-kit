import { cleanText, FieldErrors, isPlainObject, ValidationResult } from "../validation";
import {
  ALLOWED_MEALS_PER_WEEK,
  ALLOWED_PEOPLE,
  DELIVERY_DAYS,
  DeliveryDay,
  MAX_RECIPES_PER_ORDER,
} from "./rules";

// Ulaz za POST /api/orders. Cene i totali se NE primaju od klijenta.
export interface OrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    phone: string; // normalizovan, npr. +381601234567
    email: string; // mala slova
    deliveryAddress: string;
    city: string;
  };
  deliveryDay: DeliveryDay;
  plan: { people: 2 | 4; mealsPerWeek: 2 | 3 | 4 };
  recipeIds: string[];
}

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;
const CITY_RE = /^[\p{L}\p{M}][\p{L}\p{M}\d' .-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const RECIPE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Prihvata 060 123 4567, 060/123-4567, +381 60 1234567, 00381...;
// vraća E.164 oblik ili null.
export function normalizeSerbianPhone(input: string): string | null {
  const compact = input.replace(/[\s/().-]/g, "");
  const match = compact.match(/^(?:\+381|00381|0)([1-9]\d{7,8})$/);
  return match ? `+381${match[1]}` : null;
}

function text(
  errors: FieldErrors,
  key: string,
  raw: unknown,
  min: number,
  max: number,
  label: string,
  pattern?: RegExp,
): string {
  const value = cleanText(raw);
  if (!value) {
    errors[key] = `${label} je obavezno polje.`;
  } else if (value.length < min || value.length > max) {
    errors[key] = `${label} mora imati od ${min} do ${max} karaktera.`;
  } else if (pattern && !pattern.test(value)) {
    errors[key] = `${label} sadrži nedozvoljene karaktere.`;
  }
  return value ?? "";
}

export function validateOrderRequest(body: unknown): ValidationResult<OrderRequest> {
  const errors: FieldErrors = {};
  if (!isPlainObject(body)) {
    return { ok: false, errors: { body: "Neispravan zahtev." } };
  }
  const c = isPlainObject(body.customer) ? body.customer : {};

  const firstName = text(errors, "customer.firstName", c.firstName, 2, 50, "Ime", NAME_RE);
  const lastName = text(errors, "customer.lastName", c.lastName, 2, 50, "Prezime", NAME_RE);
  const deliveryAddress = text(errors, "customer.deliveryAddress", c.deliveryAddress, 5, 200, "Adresa dostave");
  const city = text(errors, "customer.city", c.city, 2, 80, "Grad", CITY_RE);

  const emailRaw = cleanText(c.email)?.toLowerCase() ?? "";
  if (!emailRaw) errors["customer.email"] = "Email je obavezno polje.";
  else if (emailRaw.length > 254 || !EMAIL_RE.test(emailRaw)) {
    errors["customer.email"] = "Unesi ispravnu email adresu.";
  }

  const phoneRaw = cleanText(c.phone) ?? "";
  const phone = phoneRaw.length <= 25 ? normalizeSerbianPhone(phoneRaw) : null;
  if (!phoneRaw) errors["customer.phone"] = "Telefon je obavezno polje.";
  else if (!phone) errors["customer.phone"] = "Unesi ispravan broj telefona (npr. 060 123 4567).";

  const deliveryDay = body.deliveryDay;
  if (typeof deliveryDay !== "string" || !(DELIVERY_DAYS as readonly string[]).includes(deliveryDay)) {
    errors.deliveryDay = "Izaberi dan dostave (ponedeljak–petak).";
  }

  const plan = isPlainObject(body.plan) ? body.plan : {};
  if (!(ALLOWED_PEOPLE as readonly unknown[]).includes(plan.people)) {
    errors["plan.people"] = "Broj osoba mora biti 2 ili 4.";
  }
  if (!(ALLOWED_MEALS_PER_WEEK as readonly unknown[]).includes(plan.mealsPerWeek)) {
    errors["plan.mealsPerWeek"] = "Broj obroka nedeljno mora biti 2, 3 ili 4.";
  }

  const ids = body.recipeIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    errors.recipeIds = "Kutija je prazna.";
  } else if (ids.length > MAX_RECIPES_PER_ORDER) {
    errors.recipeIds = `Najviše ${MAX_RECIPES_PER_ORDER} recepata po porudžbini.`;
  } else if (!ids.every((id) => typeof id === "string" && RECIPE_ID_RE.test(id))) {
    errors.recipeIds = "Neispravan recept u kutiji.";
  } else if (new Set(ids).size !== ids.length) {
    errors.recipeIds = "Isti recept je dodat više puta.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      customer: { firstName, lastName, phone: phone!, email: emailRaw, deliveryAddress, city },
      deliveryDay: deliveryDay as DeliveryDay,
      plan: { people: plan.people as 2 | 4, mealsPerWeek: plan.mealsPerWeek as 2 | 3 | 4 },
      recipeIds: ids as string[],
    },
  };
}
