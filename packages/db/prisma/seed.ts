import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cowri.ci' },
    update: {},
    create: {
      email: 'admin@cowri.ci',
      passwordHash: '$2b$10$placeholder', // Replace with actual hash
      firstName: 'Admin',
      lastName: 'Cowri',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // Create sample categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Électronique',
      slug: 'electronics',
      description: 'Appareils et gadgets électroniques',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Mode',
      slug: 'fashion',
      description: 'Vêtements et accessoires',
    },
  });

  const food = await prisma.category.upsert({
    where: { slug: 'food' },
    update: {},
    create: {
      name: 'Alimentation',
      slug: 'food',
      description: 'Produits alimentaires locaux et importés',
    },
  });

  console.log('Seed completed:', { admin, electronics, fashion, food });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
