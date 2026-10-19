import type { Metadata } from "next";
import { ALL_TAGS } from "@/lib/tags";
import type { Tag } from "@/lib/types";
import MenuPage from "@/components/menu/MenuPage";

export const metadata: Metadata = {
  title: "Nedeljni meni",
  description:
    "Recepti ove nedelje: filtriraj po oznakama (vegetarijansko, bez glutena, brzo...) i dodaj obroke u svoju kutiju.",
  alternates: { canonical: "/meni" },
};

// ?tag=... (linkovi sa početne) postaje početni filter.
export default async function Page({ searchParams }: PageProps<"/meni">) {
  const { tag } = await searchParams;
  const initialTag = ALL_TAGS.find((t) => t === tag) ?? null;
  return <MenuPage key={initialTag ?? "sve"} initialTag={initialTag as Tag | null} />;
}
