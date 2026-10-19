import type { CSSProperties, ReactNode } from "react";
import Icon from "@/components/icons";

// "Tanjir" -- kružni placeholder umesto fotografije recepta (MASTER 6.4).
// Recept daje emoji + gradijent; bez recepta crta se prazan tanjir.

export const PLATE_TILTS = [-8, 6, -4] as const;

export function plateTilt(index: number) {
  return PLATE_TILTS[index % PLATE_TILTS.length];
}

interface PlateRecipe {
  name: string;
  emoji: string;
  color: string;
}

export default function Plate({
  recipe,
  tilt = 0,
  className = "",
  style,
  labelled = false,
  sticker,
}: {
  recipe: PlateRecipe | null;
  tilt?: number;
  // Veličinu daje className (npr. "size-40 lg:size-80") -- uvek fiksna.
  className?: string;
  style?: CSSProperties;
  // true samo kad je tanjir jedini prikaz recepta.
  labelled?: boolean;
  sticker?: ReactNode;
}) {
  const a11y =
    labelled && recipe
      ? { role: "img" as const, "aria-label": recipe.name }
      : { "aria-hidden": true as const };

  return (
    <div
      className={`plate ${className}`}
      style={{ "--plate-tilt": `${tilt}deg`, ...style } as CSSProperties}
      {...a11y}
    >
      {recipe ? (
        <div className={`plate-dish bg-gradient-to-br ${recipe.color}`}>
          <span className="plate-emoji">{recipe.emoji}</span>
        </div>
      ) : (
        <div className="plate-dish plate-empty">
          <Icon name="utensils" size={24} />
        </div>
      )}
      {sticker && (
        <span
          className="sticker absolute top-[8%] left-[4%] z-10 -translate-x-1/4 -translate-y-1/2 tabular"
          style={{ transform: "rotate(-6deg)" }}
        >
          {sticker}
        </span>
      )}
    </div>
  );
}
