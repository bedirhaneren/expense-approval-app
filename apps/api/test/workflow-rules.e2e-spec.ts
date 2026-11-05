import {
  createExpenseAt,
  validExpenseForm,
} from './helpers/expense-fixtures.js';
import { createTestContext, TestContext } from './helpers/test-context.js';

const reason = { reason: 'Gerekçe' };

/** Status order rules: each action is only allowed at its own step. */
describe('Workflow rules (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(() => ctx.close());

  describe('drafts', () => {
    it('the owner can edit a draft, and the edit is recorded', async () => {
      const id = await createExpenseAt(ctx, 'draft');

      const updated = await ctx
        .as('ali')
        .put(`/expenses/${id}`, { ...validExpenseForm, amount: 455.5 });

      expect(updated.status).toBe(200);
      expect(updated.body.amount).toBe('455.50');
      expect(
        updated.body.history.map((h: { action: string }) => h.action),
      ).toEqual(['CREATED', 'UPDATED']);
    });

    it('a submitted expense can no longer be edited', async () => {
      const id = await createExpenseAt(ctx, 'pendingManager');

      const response = await ctx
        .as('ali')
        .put(`/expenses/${id}`, validExpenseForm);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        'Yalnızca taslak durumundaki masraflar düzenlenebilir.',
      );
    });

    it('an expense cannot be submitted twice', async () => {
      const id = await createExpenseAt(ctx, 'pendingManager');

      const response = await ctx.as('ali').post(`/expenses/${id}/submit`);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        'Masraf "Yönetici Onayı Bekliyor" durumunda olduğu için bu işlem yapılamaz.',
      );
    });
  });

  describe('manager stage', () => {
    // A manager only sees expenses that wait for them (case 3.1), so once an
    // expense leaves their stage it is reported as not found.
    it('the manager cannot act again after approving', async () => {
      const id = await createExpenseAt(ctx, 'pendingAccounting');
      const url = `/approvals/manager/${id}`;

      expect((await ctx.as('ahmet').post(`${url}/approve`)).status).toBe(404);
      expect((await ctx.as('ahmet').post(`${url}/reject`, reason)).status).toBe(
        404,
      );
    });

    it('a rejected expense cannot be approved', async () => {
      const id = await createExpenseAt(ctx, 'managerRejected');

      const response = await ctx
        .as('ahmet')
        .post(`/approvals/manager/${id}/approve`);

      expect(response.status).toBe(404);
    });

    it('returns the result of an approval, after which the manager no longer sees the expense', async () => {
      const id = await createExpenseAt(ctx, 'pendingManager');

      const approved = await ctx
        .as('ahmet')
        .post(`/approvals/manager/${id}/approve`);
      expect(approved.status).toBe(200);
      expect(approved.body.status).toBe('PENDING_ACCOUNTING');

      const afterwards = await ctx.as('ahmet').get(`/expenses/${id}`);
      expect(afterwards.status).toBe(404);
    });

    it.each([
      ['missing', {}],
      ['blank', { reason: '   ' }],
    ])('a rejection with a %s reason is refused', async (_case, body) => {
      const id = await createExpenseAt(ctx, 'pendingManager');

      const response = await ctx
        .as('ahmet')
        .post(`/approvals/manager/${id}/reject`, body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Red gerekçesi zorunludur.');
    });
  });

  describe('accounting stage', () => {
    it('an approved expense is final', async () => {
      const id = await createExpenseAt(ctx, 'approved');
      const url = `/approvals/accounting/${id}`;

      expect((await ctx.as('ayse').post(`${url}/approve`)).status).toBe(409);
      expect((await ctx.as('ayse').post(`${url}/reject`, reason)).status).toBe(
        409,
      );
    });

    it('an expense rejected by accounting is final', async () => {
      const id = await createExpenseAt(ctx, 'accountingRejected');

      const response = await ctx
        .as('ayse')
        .post(`/approvals/accounting/${id}/approve`);

      expect(response.status).toBe(409);
    });

    it('records who rejected and why', async () => {
      const id = await createExpenseAt(ctx, 'pendingAccounting');

      const response = await ctx
        .as('ayse')
        .post(`/approvals/accounting/${id}/reject`, { reason: 'Fiş eksik' });

      expect(response.body).toMatchObject({
        status: 'REJECTED',
        rejectionReason: 'Fiş eksik',
        rejectedBy: { fullName: 'Ayşe Muhasebe' },
      });
    });
  });

  describe('concurrency', () => {
    it('accepts only one of two simultaneous approvals', async () => {
      const id = await createExpenseAt(ctx, 'pendingManager');
      const url = `/approvals/manager/${id}/approve`;

      const responses = await Promise.all([
        ctx.as('ahmet').post(url),
        ctx.as('ahmet').post(url),
      ]);

      // The losing request finds the expense already out of the manager's scope.
      expect(responses.map((r) => r.status).sort((a, b) => a - b)).toEqual([
        200, 404,
      ]);
      const detail = await ctx.as('ali').get(`/expenses/${id}`);
      const approvals = detail.body.history.filter(
        (h: { action: string }) => h.action === 'MANAGER_APPROVED',
      );
      expect(approvals).toHaveLength(1);
    });
  });
});
