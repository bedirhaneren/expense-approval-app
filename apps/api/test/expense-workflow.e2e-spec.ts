import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import {
  clearExpenses,
  createTestApp,
  DemoUsername,
  loginAs,
} from './helpers/test-app.js';

const PAST_DATE = '2026-10-28';

const aliTransport = {
  title: 'Müşteri ziyareti taksi',
  expenseDate: PAST_DATE,
  category: 'TRANSPORT',
  amount: 750,
};

const veliMeal = {
  title: 'Ekip yemeği',
  expenseDate: PAST_DATE,
  category: 'MEAL',
  amount: 420,
  note: 'Proje kapanış yemeği',
};

/**
 * Follows the end-to-end scenario from the case document (section 6), then
 * checks the access and ordering rules around it.
 */
describe('Expense workflow (e2e)', () => {
  let app: INestApplication<App>;
  const tokens = {} as Record<DemoUsername, string>;

  const as = (username: DemoUsername) => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${tokens[username]}` };
    return {
      get: (url: string) => request(server).get(url).set(auth),
      post: (url: string, body?: object) =>
        request(server).post(url).set(auth).send(body),
      put: (url: string, body: object) =>
        request(server).put(url).set(auth).send(body),
    };
  };

  beforeAll(async () => {
    app = await createTestApp();
    await clearExpenses(app);
    for (const username of ['ali', 'veli', 'ahmet', 'ayse'] as const) {
      tokens[username] = await loginAs(app, username);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('case scenario', () => {
    let aliExpenseId: string;
    let veliExpenseId: string;

    it('1. Ali creates a 750 TL transport expense as a draft and submits it', async () => {
      const created = await as('ali').post('/expenses', aliTransport);
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({
        status: 'DRAFT',
        amount: '750.00',
        category: 'TRANSPORT',
        expenseDate: PAST_DATE,
      });
      aliExpenseId = created.body.id;

      const submitted = await as('ali').post(
        `/expenses/${aliExpenseId}/submit`,
      );
      expect(submitted.status).toBe(200);
      expect(submitted.body.status).toBe('PENDING_MANAGER');
    });

    it('2. Veli creates a 420 TL meal expense and submits it', async () => {
      const created = await as('veli').post('/expenses', veliMeal);
      veliExpenseId = created.body.id;

      const submitted = await as('veli').post(
        `/expenses/${veliExpenseId}/submit`,
      );
      expect(submitted.body.status).toBe('PENDING_MANAGER');
    });

    it('3. Ahmet sees both, approves Ali and rejects Veli with a reason', async () => {
      const pending = await as('ahmet').get('/approvals/manager');
      expect(pending.status).toBe(200);
      expect(pending.body.map((e: { id: string }) => e.id).sort()).toEqual(
        [aliExpenseId, veliExpenseId].sort(),
      );

      const approved = await as('ahmet').post(
        `/approvals/manager/${aliExpenseId}/approve`,
      );
      expect(approved.body.status).toBe('PENDING_ACCOUNTING');

      const rejected = await as('ahmet').post(
        `/approvals/manager/${veliExpenseId}/reject`,
        { reason: 'Eksik bilgi' },
      );
      expect(rejected.body.status).toBe('REJECTED');
    });

    it("4. Ayşe sees only Ali's manager-approved expense and approves it", async () => {
      const pending = await as('ayse').get('/approvals/accounting');
      expect(pending.body.map((e: { id: string }) => e.id)).toEqual([
        aliExpenseId,
      ]);

      const approved = await as('ayse').post(
        `/approvals/accounting/${aliExpenseId}/approve`,
      );
      expect(approved.body.status).toBe('APPROVED');
    });

    it('5. Ali sees "Approved"; Veli sees "Rejected" with the reason', async () => {
      const ali = await as('ali').get(`/expenses/${aliExpenseId}`);
      expect(ali.body.status).toBe('APPROVED');
      expect(ali.body.history.map((h: { action: string }) => h.action)).toEqual(
        ['CREATED', 'SUBMITTED', 'MANAGER_APPROVED', 'ACCOUNTING_APPROVED'],
      );

      const veli = await as('veli').get(`/expenses/${veliExpenseId}`);
      expect(veli.body).toMatchObject({
        status: 'REJECTED',
        rejectionReason: 'Eksik bilgi',
        rejectedBy: { fullName: 'Ahmet Yönetici' },
      });
      expect(veli.body.history.at(-1)).toMatchObject({
        action: 'MANAGER_REJECTED',
        reason: 'Eksik bilgi',
        actor: { fullName: 'Ahmet Yönetici', role: 'MANAGER' },
      });
    });

    it("6. Ali cannot see Veli's expense", async () => {
      const response = await as('ali').get(`/expenses/${veliExpenseId}`);
      expect(response.status).toBe(404);
    });

    it('rejects a second approval of the same expense', async () => {
      const response = await as('ayse').post(
        `/approvals/accounting/${aliExpenseId}/approve`,
      );
      expect(response.status).toBe(409);
    });
  });

  describe('ordering and access rules', () => {
    let submittedId: string;

    beforeAll(async () => {
      const created = await as('ali').post('/expenses', aliTransport);
      submittedId = created.body.id;
      await as('ali').post(`/expenses/${submittedId}/submit`);
    });

    it('accounting cannot approve before the manager has', async () => {
      const response = await as('ayse').post(
        `/approvals/accounting/${submittedId}/approve`,
      );
      expect(response.status).toBe(404);
    });

    it('the owner cannot edit a submitted expense', async () => {
      const response = await as('ali').put(
        `/expenses/${submittedId}`,
        aliTransport,
      );
      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        'Yalnızca taslak durumundaki masraflar düzenlenebilir.',
      );
    });

    it('a rejection requires a reason', async () => {
      const response = await as('ahmet').post(
        `/approvals/manager/${submittedId}/reject`,
        { reason: '   ' },
      );
      expect(response.status).toBe(400);
    });

    it('a manager cannot use the accounting stage', async () => {
      const response = await as('ahmet').get('/approvals/accounting');
      expect(response.status).toBe(403);
    });

    it('accepts only one of two simultaneous approvals', async () => {
      const created = await as('veli').post('/expenses', veliMeal);
      const expenseId = created.body.id;
      await as('veli').post(`/expenses/${expenseId}/submit`);

      const approveUrl = `/approvals/manager/${expenseId}/approve`;
      const responses = await Promise.all([
        as('ahmet').post(approveUrl),
        as('ahmet').post(approveUrl),
      ]);

      expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
      const detail = await as('veli').get(`/expenses/${expenseId}`);
      expect(
        detail.body.history.filter(
          (h: { action: string }) => h.action === 'MANAGER_APPROVED',
        ),
      ).toHaveLength(1);
    });

    it('an employee cannot use the approval endpoints', async () => {
      const response = await as('ali').post(
        `/approvals/manager/${submittedId}/approve`,
      );
      expect(response.status).toBe(403);
    });
  });

  describe('drafts', () => {
    it('the owner can edit a draft, and the manager cannot see it', async () => {
      const created = await as('veli').post('/expenses', veliMeal);
      const draftId = created.body.id;

      const updated = await as('veli').put(`/expenses/${draftId}`, {
        ...veliMeal,
        amount: 455.5,
      });
      expect(updated.status).toBe(200);
      expect(updated.body.amount).toBe('455.50');

      const managerView = await as('ahmet').get(`/expenses/${draftId}`);
      expect(managerView.status).toBe(404);
    });

    it.each([
      ['a negative amount', { amount: -10 }],
      ['more than two decimals', { amount: 10.123 }],
      ['a future date', { expenseDate: '2999-01-01' }],
      ['an invalid date', { expenseDate: '2026-02-30' }],
      ['an unknown category', { category: 'GIFT' }],
      ['an empty title', { title: '  ' }],
    ])('rejects %s with 400', async (_case, override) => {
      const response = await as('ali').post('/expenses', {
        ...aliTransport,
        ...override,
      });
      expect(response.status).toBe(400);
    });
  });
});
