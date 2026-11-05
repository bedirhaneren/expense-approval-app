import type { AuthUser } from '../auth/auth.types.js';
import { ExpenseStatus, Role } from '../generated/prisma/client.js';
import { visibleExpensesWhere } from './expense-access.js';

function userWithRole(role: Role): AuthUser {
  return {
    id: 'user-1',
    username: 'user',
    email: 'user@demo.local',
    fullName: 'User',
    role,
    managerId: null,
  };
}

describe('visibleExpensesWhere', () => {
  it('limits employees to their own expenses', () => {
    expect(visibleExpensesWhere(userWithRole(Role.EMPLOYEE))).toEqual({
      ownerId: 'user-1',
    });
  });

  it("limits managers to their team's expenses awaiting their approval", () => {
    expect(visibleExpensesWhere(userWithRole(Role.MANAGER))).toEqual({
      owner: { managerId: 'user-1' },
      status: ExpenseStatus.PENDING_MANAGER,
    });
  });

  it('limits accounting to expenses that reached the accounting stage', () => {
    const where = visibleExpensesWhere(userWithRole(Role.ACCOUNTING));

    expect(JSON.stringify(where)).not.toContain(ExpenseStatus.DRAFT);
    expect(JSON.stringify(where)).not.toContain(ExpenseStatus.PENDING_MANAGER);
    expect(JSON.stringify(where)).toContain('ACCOUNTING_REJECTED');
  });
});
