import { PrismaClient } from "@prisma/client";
import { defaultRecipes } from "../src/lib/recipes";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.recipe.count();
  if (count > 0) {
    console.log(`Baza već ima ${count} recepata, preskačem seed.`);
    return;
  }

  for (const { id: _id, tags, ...rest } of defaultRecipes) {
    await prisma.recipe.create({
      data: { ...rest, tags: JSON.stringify(tags) },
    });
  }
  console.log(`Ubačeno ${defaultRecipes.length} podrazumevanih recepata.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
