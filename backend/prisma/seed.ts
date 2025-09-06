
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const work = await prisma.category.upsert({
    where: { name: 'Work' },
    update: {},
    create: { name: 'Work' },
  });
  const personal = await prisma.category.upsert({
    where: { name: 'Personal' },
    update: {},
    create: { name: 'Personal' },
  });

  await prisma.note.create({
    data: {
      title: 'Welcome to Ensolvers Notes',
      content: 'Edit me, archive me, tag me!',
      categories: { create: [{ categoryId: work.id }] },
    },
  });
  await prisma.note.create({
    data: {
      title: 'Another example note',
      content: 'This one is archived and tagged as Personal.',
      archived: true,
      categories: { create: [{ categoryId: personal.id }] },
    },
  });
}

main().finally(async () => await prisma.$disconnect());
