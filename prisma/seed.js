/**
 * prisma/seed.js
 * Plain JS seed to avoid ts-node ESM issues.
 * author: Aftab
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.link.upsert({
    where: { code: 'google' },
    update: {},
    create: {
      code: 'google',
      target: 'https://www.google.com',
      clicks: 12,
      lastClicked: new Date(),
    },
  });

  await prisma.link.upsert({
    where: { code: 'github1' },
    update: {},
    create: {
      code: 'github1',
      target: 'https://github.com',
      clicks: 5,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
