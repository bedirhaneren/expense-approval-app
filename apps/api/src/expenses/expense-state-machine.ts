import {
  ExpenseAction,
  ExpenseStatus,
  Role,
} from '../generated/prisma/client.js';

export interface ExpenseTransition {
  from: ExpenseStatus;
  to: ExpenseStatus;
  actorRole: Role;
}

/**
 * Single source of truth for the approval workflow:
 *
 *   DRAFT → PENDING_MANAGER → PENDING_ACCOUNTING → APPROVED
 *                 ↘ REJECTED          ↘ REJECTED
 *
 * Any status change that is not listed here is rejected.
 */
export const EXPENSE_TRANSITIONS = {
  [ExpenseAction.SUBMITTED]: {
    from: ExpenseStatus.DRAFT,
    to: ExpenseStatus.PENDING_MANAGER,
    actorRole: Role.EMPLOYEE,
  },
  [ExpenseAction.MANAGER_APPROVED]: {
    from: ExpenseStatus.PENDING_MANAGER,
    to: ExpenseStatus.PENDING_ACCOUNTING,
    actorRole: Role.MANAGER,
  },
  [ExpenseAction.MANAGER_REJECTED]: {
    from: ExpenseStatus.PENDING_MANAGER,
    to: ExpenseStatus.REJECTED,
    actorRole: Role.MANAGER,
  },
  [ExpenseAction.ACCOUNTING_APPROVED]: {
    from: ExpenseStatus.PENDING_ACCOUNTING,
    to: ExpenseStatus.APPROVED,
    actorRole: Role.ACCOUNTING,
  },
  [ExpenseAction.ACCOUNTING_REJECTED]: {
    from: ExpenseStatus.PENDING_ACCOUNTING,
    to: ExpenseStatus.REJECTED,
    actorRole: Role.ACCOUNTING,
  },
} as const satisfies Partial<Record<ExpenseAction, ExpenseTransition>>;

export type TransitionAction = keyof typeof EXPENSE_TRANSITIONS;

/** Only drafts can be edited; once submitted, an expense is read-only for its owner. */
export const EDITABLE_STATUS = ExpenseStatus.DRAFT;
