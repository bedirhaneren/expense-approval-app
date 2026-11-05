import { execSync } from 'node:child_process';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import { DEMO_PASSWORD } from './helpers/test-users.js';
import './setup-env.js';

/**
 * Runs once per e2e run: migrates the test database, loads the demo users and
 * adds a second team (Zeynep → Can) so "only your own team" rules can be tested.
 */
export default async function setup(): Promise<void> {
  const run = (command: string) =>
    execSync(command, { stdio: 'pipe', env: process.env });

  run('npx prisma migrate deploy');
  run('npx prisma db seed');
  await seedSecondTeam();
}

async function seedSecondTeam(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 4);

  try {
    const zeynep = await prisma.user.upsert({
      where: { username: 'zeynep' },
      update: {},
      create: {
        username: 'zeynep',
        email: 'zeynep@test.local',
        fullName: 'Zeynep Yönetici',
        role: Role.MANAGER,
        passwordHash,
      },
    });
    await prisma.user.upsert({
      where: { username: 'can' },
      update: {},
      create: {
        username: 'can',
        email: 'can@test.local',
        fullName: 'Can Çalışan',
        role: Role.EMPLOYEE,
        managerId: zeynep.id,
        passwordHash,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
