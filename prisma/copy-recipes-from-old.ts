// Jednokratno: kopira recepte iz stare (deljene) baze u novu meal-kit bazu,
// sa istim id-jevima i datumima. Stara baza se SAMO čita, i to unutar
// READ ONLY transakcije, pa Postgres odbija svaki eventualni upis.
//
// Pokretanje: npm run db:copy-recipes
// Potrebno: OLD_DATABASE_URL (stara baza) i DATABASE_URL (nova baza, migrirana).
// Bezbedno za ponovno pokretanje: postojeći id-jevi se preskaču.

import { PrismaClient } from "@prisma/client";

interface OldRecipeRow {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  tags: string;
  prepMinutes: number;
  calories: number;
  pricePerServing: number;
  createdAt: Date;
  updatedAt: Date;
}

// host/baza, bez korisnika i lozinke (bezbedno za ispis).
function dbIdentity(url: string): string {
  try {
    const u = new URL(url);
    // Neon pooler i direktna konekcija su ista baza.
    return `${u.hostname.replace("-pooler.", ".")}${u.pathname}`;
  } catch {
    return "(neispravan URL)";
  }
}

async function main() {
  const oldUrl = process.env.OLD_DATABASE_URL;
  const newUrl = process.env.DATABASE_URL;
  if (!oldUrl || !newUrl) throw new Error("OLD_DATABASE_URL i DATABASE_URL moraju biti podešeni.");
  if (oldUrl === newUrl || dbIdentity(oldUrl) === dbIdentity(newUrl)) {
    throw new Error("Stara i nova baza su ista baza -- prekidam.");
  }

  const oldDb = new PrismaClient({ datasourceUrl: oldUrl });
  const newDb = new PrismaClient({ datasourceUrl: newUrl });

  try {
    // Sirov SQL nad starom bazom: tamo ne postoji kolona "active", pa
    // generisani klijent ne može da čita model Recipe.
    const rows = await oldDb.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return tx.$queryRawUnsafe<OldRecipeRow[]>(
        `SELECT "id","name","description","emoji","color","tags","prepMinutes",
                "calories","pricePerServing","createdAt","updatedAt"
         FROM "Recipe" ORDER BY "createdAt" ASC`,
      );
    });
    console.log(`Stara baza (${dbIdentity(oldUrl)}): ${rows.length} recepata.`);

    const result = await newDb.recipe.createMany({
      data: rows.map((r) => ({ ...r, active: true })),
      skipDuplicates: true,
    });
    const total = await newDb.recipe.count();
    console.log(
      `Nova baza (${dbIdentity(newUrl)}): ubačeno ${result.count}, preskočeno ${rows.length - result.count}, ukupno ${total}.`,
    );
  } finally {
    await Promise.all([oldDb.$disconnect(), newDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
