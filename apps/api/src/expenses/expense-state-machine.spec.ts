import { ExpenseStatus, Role } from '../generated/prisma/client.js';
import {
  EXPENSE_TRANSITIONS,
  type ExpenseTransition,
} from './expense-state-machine.js';

const transitions: ExpenseTransition[] = Object.values(EXPENSE_TRANSITIONS);

function transitionsFrom(status: ExpenseStatus): ExpenseTransition[] {
  return transitions.filter((transition) => transition.from === status);
}

describe('Expense state machine', () => {
  it('lets only the employee submit a draft to the manager', () => {
    expect(transitionsFrom(ExpenseStatus.DRAFT)).toEqual([
      {
        from: ExpenseStatus.DRAFT,
        to: ExpenseStatus.PENDING_MANAGER,
        actorRole: Role.EMPLOYEE,
      },
    ]);
  });

  it('lets only the manager approve or reject at the manager stage', () => {
    const managerStage = transitionsFrom(ExpenseStatus.PENDING_MANAGER);

    expect(managerStage.map((transition) => transition.to)).toEqual([
      ExpenseStatus.PENDING_ACCOUNTING,
      ExpenseStatus.REJECTED,
    ]);
    expect(managerStage.every((t) => t.actorRole === Role.MANAGER)).toBe(true);
  });

  it('lets only accounting approve or reject at the accounting stage', () => {
    const accountingStage = transitionsFrom(ExpenseStatus.PENDING_ACCOUNTING);

    expect(accountingStage.map((transition) => transition.to)).toEqual([
      ExpenseStatus.APPROVED,
      ExpenseStatus.REJECTED,
    ]);
    expect(accountingStage.every((t) => t.actorRole === Role.ACCOUNTING)).toBe(
      true,
    );
  });

  it.each([ExpenseStatus.APPROVED, ExpenseStatus.REJECTED])(
    'treats %s as a final status with no further transitions',
    (status) => {
      expect(transitionsFrom(status)).toEqual([]);
    },
  );

  it('never skips the manager stage on the way to approval', () => {
    const reachesApproval = transitions.filter(
      (transition) => transition.to === ExpenseStatus.APPROVED,
    );

    expect(reachesApproval).toHaveLength(1);
    expect(reachesApproval[0].from).toBe(ExpenseStatus.PENDING_ACCOUNTING);
  });
});
