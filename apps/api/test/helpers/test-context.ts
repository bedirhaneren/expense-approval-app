import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { DEMO_PASSWORD, TEST_USERNAMES, TestUsername } from './test-users.js';

export interface ApiClient {
  get: (url: string) => request.Test;
  post: (url: string, body?: object) => request.Test;
  put: (url: string, body: object) => request.Test;
}

export interface TestContext {
  app: INestApplication<App>;
  as: (username: TestUsername) => ApiClient;
  anonymous: ApiClient;
  close: () => Promise<void>;
}

/**
 * Boots the real application against the test database, starts from an empty
 * expense table and logs every test user in once.
 */
export async function createTestContext(): Promise<TestContext> {
  const app = await createTestApp();
  await app.get(PrismaService)
    .$executeRaw`TRUNCATE TABLE expense_history, expenses`;

  const tokens = new Map<TestUsername, string>();
  for (const username of TEST_USERNAMES) {
    tokens.set(username, await login(app, username));
  }

  return {
    app,
    as: (username) => createApiClient(app, tokens.get(username)),
    anonymous: createApiClient(app),
    close: () => app.close(),
  };
}

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  return app;
}

function createApiClient(
  app: INestApplication<App>,
  token?: string,
): ApiClient {
  const server = app.getHttpServer();
  const withAuth = (test: request.Test) =>
    token ? test.set('Authorization', `Bearer ${token}`) : test;

  return {
    get: (url) => withAuth(request(server).get(url)),
    post: (url, body) => withAuth(request(server).post(url)).send(body),
    put: (url, body) => withAuth(request(server).put(url)).send(body),
  };
}

async function login(
  app: INestApplication<App>,
  username: TestUsername,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ login: username, password: DEMO_PASSWORD })
    .expect(200);
  return response.body.accessToken as string;
}
