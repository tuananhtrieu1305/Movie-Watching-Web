const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const countries = await prisma.productions.findMany({ select: { country: true }, distinct: ["country"] });
  const genres = await prisma.genres.findMany();
  console.log("Countries:", countries);
  console.log("Genres:", genres);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
