import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      username: 'admin',
      password: 'admin',
      name: 'admin name',
      email: 'admin@test.com',
      role: 'admin'
    },
    {
      username: 'user',
      password: 'user',
      name: 'user name',
      email: 'user@test.com',
      role: 'user'
    },
  ]
  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user
    });
    console.log({ record });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
