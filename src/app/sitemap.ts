import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Samo javne, indeksabilne strane. /kutija, /checkout i /admin zavise od
// stanja korisnika i ne idu u pretragu.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/meni`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
