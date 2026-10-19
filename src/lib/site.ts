// Apsolutni URL sajta za sitemap, robots i metadataBase.
// Redosled: eksplicitni SITE_URL, pa produkcioni domen koji Vercel sam
// postavlja, pa localhost u razvoju.
export function getSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
