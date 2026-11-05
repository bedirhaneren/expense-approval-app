import {
  createExpenseAt,
  validExpenseForm,
} from './helpers/expense-fixtures.js';
import { createTestContext, TestContext } from './helpers/test-context.js';
import type { TestUsername } from './helpers/test-users.js';

/**
 * Who may see and act on which expense. Teams: Ahmet → Ali, Veli;
 * Zeynep → Can (test-only). Ayşe is accounting for everyone.
 */
describe('Access control (e2e)', () => {
  let ctx: TestContext;
  const expenses = {} as Record<
    | 'aliDraft'
    | 'aliPendingManager'
    | 'aliManagerRejected'
    | 'aliPendingAccounting'
    | 'aliApproved'
    | 'aliAccountingRejected'
    | 'canPendingManager',
    string
  >;

  beforeAll(async () => {
    ctx = await createTestContext();
    expenses.aliDraft = await createExpenseAt(ctx, 'draft');
    expenses.aliPendingManager = await createExpenseAt(ctx, 'pendingManager');
    expenses.aliManagerRejected = await createExpenseAt(ctx, 'managerRejected');
    expenses.aliPendingAccounting = await createExpenseAt(
      ctx,
      'pendingAccounting',
    );
    expenses.aliApproved = await createExpenseAt(ctx, 'approved');
    expenses.aliAccountingRejected = await createExpenseAt(
      ctx,
      'accountingRejected',
    );
    expenses.canPendingManager = await createExpenseAt(
      ctx,
      'pendingManager',
      'can',
    );
  });

  afterAll(() => ctx.close());

  describe('viewing an expense: GET /expenses/:id', () => {
    it.each<[TestUsername, keyof typeof expenses, number]>([
      // Employees see only their own expenses, in every status.
      ['ali', 'aliDraft', 200],
      ['ali', 'aliApproved', 200],
      ['veli', 'aliDraft', 404],
      ['veli', 'aliPendingManager', 404],
      ['can', 'aliPendingManager', 404],

      // Managers see only their own team's expenses that wait for them.
      ['ahmet', 'aliDraft', 404],
      ['ahmet', 'aliPendingManager', 200],
      ['ahmet', 'aliManagerRejected', 404],
      ['ahmet', 'aliPendingAccounting', 404],
      ['ahmet', 'aliApproved', 404],
      ['ahmet', 'canPendingManager', 404],
      ['zeynep', 'canPendingManager', 200],
      ['zeynep', 'aliPendingManager', 404],

      // Accounting sees only expenses that reached the accounting stage.
      ['ayse', 'aliDraft', 404],
      ['ayse', 'aliPendingManager', 404],
      ['ayse', 'aliManagerRejected', 404],
      ['ayse', 'canPendingManager', 404],
      ['ayse', 'aliPendingAccounting', 200],
      ['ayse', 'aliApproved', 200],
      ['ayse', 'aliAccountingRejected', 200],
    ])('%s → %s → %i', async (viewer, expense, expectedStatus) => {
      const response = await ctx
        .as(viewer)
        .get(`/expenses/${expenses[expense]}`);
      expect(response.status).toBe(expectedStatus);
    });
  });

  describe('listing', () => {
    const idsOf = (body: { id: string }[]) => body.map((e) => e.id);

    it("an employee's list contains only their own expenses", async () => {
      const veli = await ctx.as('veli').get('/expenses');
      expect(veli.status).toBe(200);
      expect(veli.body).toEqual([]);
    });

    it("a manager's queue contains only their own team's pending expenses", async () => {
      const ahmet = await ctx.as('ahmet').get('/approvals/manager');
      expect(idsOf(ahmet.body)).toEqual([expenses.aliPendingManager]);

      const zeynep = await ctx.as('zeynep').get('/approvals/manager');
      expect(idsOf(zeynep.body)).toEqual([expenses.canPendingManager]);
    });

    it("accounting's queue contains only manager-approved expenses", async () => {
      const ayse = await ctx.as('ayse').get('/approvals/accounting');
      expect(idsOf(ayse.body)).toEqual([expenses.aliPendingAccounting]);
    });
  });

  describe('acting on an expense outside your scope', () => {
    it("an employee cannot edit or submit someone else's draft", async () => {
      const url = `/expenses/${expenses.aliDraft}`;

      expect((await ctx.as('veli').put(url, validExpenseForm)).status).toBe(
        404,
      );
      expect((await ctx.as('veli').post(`${url}/submit`)).status).toBe(404);
    });

    it("a manager cannot approve or reject another team's expense", async () => {
      const url = `/approvals/manager/${expenses.canPendingManager}`;

      expect((await ctx.as('ahmet').post(`${url}/approve`)).status).toBe(404);
      expect(
        (await ctx.as('ahmet').post(`${url}/reject`, { reason: 'Hayır' }))
          .status,
      ).toBe(404);
    });

    it('accounting cannot approve or reject before the manager', async () => {
      const url = `/approvals/accounting/${expenses.aliPendingManager}`;

      expect((await ctx.as('ayse').post(`${url}/approve`)).status).toBe(404);
      expect(
        (await ctx.as('ayse').post(`${url}/reject`, { reason: 'Erken' }))
          .status,
      ).toBe(404);
    });
  });

  describe('role restrictions (403)', () => {
    it.each<[TestUsername, 'get' | 'post', string]>([
      ['ahmet', 'get', '/expenses'],
      ['ahmet', 'post', '/expenses'],
      ['ayse', 'get', '/expenses'],
      ['ali', 'get', '/approvals/manager'],
      ['ali', 'get', '/approvals/accounting'],
      ['ahmet', 'get', '/approvals/accounting'],
      ['ayse', 'get', '/approvals/manager'],
    ])('%s cannot %s %s', async (username, method, url) => {
      const response = await ctx.as(username)[method](url);
      expect(response.status).toBe(403);
    });

    it('a manager cannot approve at the accounting stage', async () => {
      const response = await ctx
        .as('ahmet')
        .post(`/approvals/accounting/${expenses.aliPendingAccounting}/approve`);
      expect(response.status).toBe(403);
    });
  });

  describe('unauthenticated requests (401)', () => {
    it.each(['/expenses', '/approvals/manager', '/approvals/accounting'])(
      'GET %s requires login',
      async (url) => {
        expect((await ctx.anonymous.get(url)).status).toBe(401);
      },
    );

    it('viewing an expense requires login', async () => {
      const response = await ctx.anonymous.get(
        `/expenses/${expenses.aliApproved}`,
      );
      expect(response.status).toBe(401);
    });
  });

  describe('malformed routes (404)', () => {
    it('an invalid expense id is reported as not found', async () => {
      expect((await ctx.as('ali').get('/expenses/not-a-uuid')).status).toBe(
        404,
      );
    });

    it('an unknown approval stage is reported as not found', async () => {
      expect((await ctx.as('ahmet').get('/approvals/ceo')).status).toBe(404);
    });
  });
});
