import type request from 'supertest';
import type { TestContext } from './test-context.js';
import { EmployeeUsername, MANAGER_OF } from './test-users.js';

export const PAST_DATE = '2026-10-28';

export const validExpenseForm = {
  title: 'Müşteri ziyareti taksi',
  expenseDate: PAST_DATE,
  category: 'TRANSPORT',
  amount: 750,
};

export type ExpenseStage =
  | 'draft'
  | 'pendingManager'
  | 'managerRejected'
  | 'pendingAccounting'
  | 'approved'
  | 'accountingRejected';

type WorkflowStep =
  | 'submit'
  | 'managerApprove'
  | 'managerReject'
  | 'accountingApprove'
  | 'accountingReject';

/** The steps needed to bring a new expense to each point of the workflow. */
const STEPS_TO_REACH: Record<ExpenseStage, WorkflowStep[]> = {
  draft: [],
  pendingManager: ['submit'],
  managerRejected: ['submit', 'managerReject'],
  pendingAccounting: ['submit', 'managerApprove'],
  approved: ['submit', 'managerApprove', 'accountingApprove'],
  accountingRejected: ['submit', 'managerApprove', 'accountingReject'],
};

/** Creates an expense through the API and walks it to the requested stage. */
export async function createExpenseAt(
  ctx: TestContext,
  stage: ExpenseStage,
  owner: EmployeeUsername = 'ali',
): Promise<string> {
  const created = await ctx
    .as(owner)
    .post('/expenses', validExpenseForm)
    .expect(201);
  const expenseId = created.body.id as string;

  for (const step of STEPS_TO_REACH[stage]) {
    await performStep(ctx, step, expenseId, owner);
  }
  return expenseId;
}

async function performStep(
  ctx: TestContext,
  step: WorkflowStep,
  expenseId: string,
  owner: EmployeeUsername,
): Promise<void> {
  const reason = { reason: 'Test red gerekçesi' };
  const manager = ctx.as(MANAGER_OF[owner]);
  const accounting = ctx.as('ayse');

  const requests: Record<WorkflowStep, () => request.Test> = {
    submit: () => ctx.as(owner).post(`/expenses/${expenseId}/submit`),
    managerApprove: () =>
      manager.post(`/approvals/manager/${expenseId}/approve`),
    managerReject: () =>
      manager.post(`/approvals/manager/${expenseId}/reject`, reason),
    accountingApprove: () =>
      accounting.post(`/approvals/accounting/${expenseId}/approve`),
    accountingReject: () =>
      accounting.post(`/approvals/accounting/${expenseId}/reject`, reason),
  };

  const response = await requests[step]();
  if (response.status !== 200) {
    throw new Error(`Fixture step "${step}" failed with ${response.status}`);
  }
}
