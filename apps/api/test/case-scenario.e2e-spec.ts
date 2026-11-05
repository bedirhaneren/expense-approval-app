import { PAST_DATE } from './helpers/expense-fixtures.js';
import { createTestContext, TestContext } from './helpers/test-context.js';

/** The end-to-end test scenario from section 6 of the case document, step by step. */
describe('Case scenario (e2e)', () => {
  let ctx: TestContext;
  let aliExpenseId: string;
  let veliExpenseId: string;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(() => ctx.close());

  it('1. Ali creates a 750 TL transport expense and submits it', async () => {
    const created = await ctx.as('ali').post('/expenses', {
      title: 'Müşteri ziyareti taksi',
      expenseDate: PAST_DATE,
      category: 'TRANSPORT',
      amount: 750,
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'DRAFT', amount: '750.00' });
    aliExpenseId = created.body.id;

    const submitted = await ctx
      .as('ali')
      .post(`/expenses/${aliExpenseId}/submit`);
    expect(submitted.body.status).toBe('PENDING_MANAGER');
  });

  it('2. Veli creates a 420 TL meal expense and submits it', async () => {
    const created = await ctx.as('veli').post('/expenses', {
      title: 'Ekip yemeği',
      expenseDate: PAST_DATE,
      category: 'MEAL',
      amount: 420,
    });
    expect(created.body).toMatchObject({ status: 'DRAFT', amount: '420.00' });
    veliExpenseId = created.body.id;

    const submitted = await ctx
      .as('veli')
      .post(`/expenses/${veliExpenseId}/submit`);
    expect(submitted.body.status).toBe('PENDING_MANAGER');
  });

  it("3. Ahmet sees both, approves Ali's and rejects Veli's with 'Eksik bilgi'", async () => {
    const pending = await ctx.as('ahmet').get('/approvals/manager');
    expect(pending.body.map((e: { id: string }) => e.id).sort()).toEqual(
      [aliExpenseId, veliExpenseId].sort(),
    );

    const approved = await ctx
      .as('ahmet')
      .post(`/approvals/manager/${aliExpenseId}/approve`);
    expect(approved.body.status).toBe('PENDING_ACCOUNTING');

    const rejected = await ctx
      .as('ahmet')
      .post(`/approvals/manager/${veliExpenseId}/reject`, {
        reason: 'Eksik bilgi',
      });
    expect(rejected.body.status).toBe('REJECTED');
  });

  it("4. Ayşe sees only Ali's manager-approved expense and approves it", async () => {
    const pending = await ctx.as('ayse').get('/approvals/accounting');
    expect(pending.body.map((e: { id: string }) => e.id)).toEqual([
      aliExpenseId,
    ]);

    const approved = await ctx
      .as('ayse')
      .post(`/approvals/accounting/${aliExpenseId}/approve`);
    expect(approved.body.status).toBe('APPROVED');
  });

  it('5. Ali sees "Onaylandı"; Veli sees "Reddedildi" and the reason', async () => {
    const ali = await ctx.as('ali').get(`/expenses/${aliExpenseId}`);
    expect(ali.body.status).toBe('APPROVED');
    expect(ali.body.history.map((h: { action: string }) => h.action)).toEqual([
      'CREATED',
      'SUBMITTED',
      'MANAGER_APPROVED',
      'ACCOUNTING_APPROVED',
    ]);

    const veli = await ctx.as('veli').get(`/expenses/${veliExpenseId}`);
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

  it("6. Ali cannot view Veli's expense; Ayşe cannot view or approve one without manager approval", async () => {
    const aliViewsVeli = await ctx.as('ali').get(`/expenses/${veliExpenseId}`);
    expect(aliViewsVeli.status).toBe(404);

    const notYetApproved = await ctx.as('veli').post('/expenses', {
      title: 'Otopark',
      expenseDate: PAST_DATE,
      category: 'OTHER',
      amount: 60,
    });
    const pendingId = notYetApproved.body.id;
    await ctx.as('veli').post(`/expenses/${pendingId}/submit`);

    const ayseViews = await ctx.as('ayse').get(`/expenses/${pendingId}`);
    expect(ayseViews.status).toBe(404);

    const ayseApproves = await ctx
      .as('ayse')
      .post(`/approvals/accounting/${pendingId}/approve`);
    expect(ayseApproves.status).toBe(404);
  });
});
