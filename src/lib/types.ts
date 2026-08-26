export type Tag =
  | "vegetarijansko"
  | "bez glutena"
  | "brzo"
  | "porodično"
  | "niskokalorično"
  | "začinjeno";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string; // tailwind gradient classes for the placeholder "photo"
  tags: Tag[];
  prepMinutes: number;
  calories: number;
  pricePerServing: number; // in RSD
}

export interface Plan {
  people: 2 | 4;
  mealsPerWeek: 2 | 3 | 4;
}
