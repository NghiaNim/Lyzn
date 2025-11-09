import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Example seed data (optional)
  console.log('No seed data defined yet');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

