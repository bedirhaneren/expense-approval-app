import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createTestApp } from './helpers/test-context.js';
import { MAX_FAILED_LOGINS } from '../src/auth/login-attempt-limiter.js';
import { DEMO_PASSWORD } from './helpers/test-users.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = (body: object) =>
    request(app.getHttpServer()).post('/auth/login').send(body);

  describe('POST /auth/login', () => {
    it('logs in with username and returns a token and the user', async () => {
      const response = await login({ login: 'ali', password: DEMO_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user).toMatchObject({
        username: 'ali',
        role: 'EMPLOYEE',
      });
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('logs in with email', async () => {
      const response = await login({
        login: 'ayse@demo.local',
        password: DEMO_PASSWORD,
      });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('ACCOUNTING');
    });

    it('rejects a wrong password with 401', async () => {
      const response = await login({ login: 'ali', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Kullanıcı adı veya şifre hatalı.');
    });

    it('rejects an empty body with 400 and readable messages', async () => {
      const response = await login({});

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Kullanıcı adı veya e-posta zorunludur.',
          'Şifre zorunludur.',
        ]),
      );
    });

    it('rejects unknown fields with 400', async () => {
      const response = await login({
        login: 'ali',
        password: DEMO_PASSWORD,
        role: 'MANAGER',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user for a valid token', async () => {
      const { body } = await login({ login: 'ahmet', password: DEMO_PASSWORD });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${body.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        username: 'ahmet',
        role: 'MANAGER',
      });
    });

    it('rejects a request without a token with 401', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('rejects a tampered token with 401', async () => {
      const { body } = await login({ login: 'ali', password: DEMO_PASSWORD });
      const tamperedToken = `${body.accessToken.slice(0, -2)}xx`;

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('failed login limit', () => {
    it('blocks an account after too many failed attempts, by username or email', async () => {
      for (let i = 0; i < MAX_FAILED_LOGINS; i++) {
        const failed = await login({ login: 'Veli', password: 'wrong' });
        expect(failed.status).toBe(401);
      }

      // Same account addressed by email, now with the correct password.
      const blocked = await login({
        login: 'veli@demo.local',
        password: DEMO_PASSWORD,
      });

      expect(blocked.status).toBe(429);
      expect(blocked.body.message).toBe(
        'Çok fazla giriş denemesi yapıldı. Lütfen bir dakika sonra tekrar deneyin.',
      );
    });

    it('never counts successful logins', async () => {
      for (let i = 0; i < MAX_FAILED_LOGINS + 2; i++) {
        const response = await login({
          login: 'ahmet',
          password: DEMO_PASSWORD,
        });
        expect(response.status).toBe(200);
      }
    });

    it('does not affect other accounts', async () => {
      const response = await login({ login: 'ayse', password: DEMO_PASSWORD });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /health', () => {
    it('is public and reports ok', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
