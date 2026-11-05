import type { AuthUser } from '../auth/auth.types.js';
import {
  ExpenseAction,
  ExpenseStatus,
  Prisma,
  Role,
} from '../generated/prisma/client.js';

/**
 * Which expenses a user may see. Applied to every read and write query, so a
 * user can never load or change an expense outside this scope.
 */
export function visibleExpensesWhere(user: AuthUser): Prisma.ExpenseWhereInput {
  switch (user.role) {
    case Role.EMPLOYEE:
      return { ownerId: user.id };

    case Role.MANAGER:
      // Only their own team's expenses that are waiting for them (case 3.1).
      return {
        owner: { managerId: user.id },
        status: ExpenseStatus.PENDING_MANAGER,
      };

    case Role.ACCOUNTING:
      // Only expenses that reached the accounting stage.
      return {
        OR: [
          {
            status: {
              in: [ExpenseStatus.PENDING_ACCOUNTING, ExpenseStatus.APPROVED],
            },
          },
          {
            status: ExpenseStatus.REJECTED,
            history: { some: { action: ExpenseAction.ACCOUNTING_REJECTED } },
          },
        ],
      };
  }
}
