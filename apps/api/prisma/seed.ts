import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';

/** Shared demo password; documented in the README. Not a real credential. */
const DEMO_PASSWORD = 'Demo123!';
const BCRYPT_ROUNDS = 10;

interface DemoUser {
  username: string;
  email: string;
  fullName: string;
  role: Role;
  managerUsername?: string;
}

/** Managers come before their reports so that managerId can be resolved. */
const DEMO_USERS: DemoUser[] = [
  {
    username: 'ahmet',
    email: 'ahmet@demo.local',
    fullName: 'Ahmet Yönetici',
    role: Role.MANAGER,
  },
  {
    username: 'ayse',
    email: 'ayse@demo.local',
    fullName: 'Ayşe Muhasebe',
    role: Role.ACCOUNTING,
  },
  {
    username: 'ali',
    email: 'ali@demo.local',
    fullName: 'Ali Çalışan',
    role: Role.EMPLOYEE,
    managerUsername: 'ahmet',
  },
  {
    username: 'veli',
    email: 'veli@demo.local',
    fullName: 'Veli Çalışan',
    role: Role.EMPLOYEE,
    managerUsername: 'ahmet',
  },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function findManagerId(managerUsername?: string): Promise<string | null> {
  if (!managerUsername) return null;

  const manager = await prisma.user.findUniqueOrThrow({
    where: { username: managerUsername },
    select: { id: true },
  });
  return manager.id;
}

async function upsertDemoUser(user: DemoUser, passwordHash: string) {
  const data = {
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    passwordHash,
    managerId: await findManagerId(user.managerUsername),
  };

  return prisma.user.upsert({
    where: { username: user.username },
    update: data,
    create: { username: user.username, ...data },
  });
}

async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  for (const demoUser of DEMO_USERS) {
    const user = await upsertDemoUser(demoUser, passwordHash);
    console.log(`✔ ${user.username} (${user.role})`);
  }
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
