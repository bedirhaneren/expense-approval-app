import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

export const DEMO_PASSWORD = 'Demo123!';

export type DemoUsername = 'ali' | 'veli' | 'ahmet' | 'ayse';

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  return app;
}

export async function loginAs(
  app: INestApplication<App>,
  username: DemoUsername,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ login: username, password: DEMO_PASSWORD })
    .expect(200);
  return response.body.accessToken as string;
}

/** Removes all expenses so each test file starts from a clean state. */
export async function clearExpenses(app: INestApplication<App>): Promise<void> {
  await app.get(PrismaService)
    .$executeRaw`TRUNCATE TABLE expense_history, expenses`;
}
