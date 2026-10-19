import { ALL_TAGS } from "./tags";
import { Tag } from "./types";
import { RecipeInput } from "./recipeSerialization";
import { cleanText, FieldErrors, isInt, isPlainObject, ValidationResult } from "./validation";

const COLOR_RE = /^from-[a-z]+-\d{2,3} to-[a-z]+-\d{2,3}$/;

export function validateRecipeInput(body: unknown): ValidationResult<RecipeInput> {
  if (!isPlainObject(body)) return { ok: false, errors: { body: "Neispravan zahtev." } };
  const errors: FieldErrors = {};

  const name = cleanText(body.name) ?? "";
  if (name.length < 2 || name.length > 100) errors.name = "Naziv mora imati od 2 do 100 karaktera.";
  const description = cleanText(body.description) ?? "";
  if (description.length > 500) errors.description = "Opis može imati najviše 500 karaktera.";
  if (typeof body.description !== "string") errors.description = "Opis je obavezan.";
  const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
  if (!emoji || emoji.length > 16) errors.emoji = "Izaberi emoji.";
  const color = typeof body.color === "string" ? body.color.trim() : "";
  if (!COLOR_RE.test(color)) errors.color = "Neispravna boja.";

  const tags = body.tags;
  if (!Array.isArray(tags) || !tags.every((t) => (ALL_TAGS as unknown[]).includes(t))) {
    errors.tags = "Nepoznat tag.";
  }
  if (!isInt(body.prepMinutes, 1, 600)) errors.prepMinutes = "Vreme pripreme: ceo broj od 1 do 600.";
  if (!isInt(body.calories, 0, 5000)) errors.calories = "Kalorije: ceo broj od 0 do 5000.";
  if (!isInt(body.pricePerServing, 1, 100000)) {
    errors.pricePerServing = "Cena po porciji: ceo broj od 1 do 100000 RSD.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      description,
      emoji,
      color,
      tags: [...new Set(tags as Tag[])],
      prepMinutes: body.prepMinutes as number,
      calories: body.calories as number,
      pricePerServing: body.pricePerServing as number,
    },
  };
}
