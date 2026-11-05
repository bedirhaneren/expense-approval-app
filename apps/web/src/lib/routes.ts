import type { ExpenseStatus, ReviewStage, Role } from './api/types';

export const LOGIN_PATH = '/login';

/** Where each role lands after login. */
export const HOME_PATH_BY_ROLE: Record<Role, string> = {
  EMPLOYEE: '/expenses',
  MANAGER: '/approvals/manager',
  ACCOUNTING: '/approvals/accounting',
};

export const REVIEW_STAGES = ['manager', 'accounting'] as const;

export const REVIEWER_ROLE_BY_STAGE: Record<ReviewStage, Role> = {
  manager: 'MANAGER',
  accounting: 'ACCOUNTING',
};

/** The status an expense must have for a reviewer to act on it at this stage. */
export const PENDING_STATUS_BY_STAGE: Record<ReviewStage, ExpenseStatus> = {
  manager: 'PENDING_MANAGER',
  accounting: 'PENDING_ACCOUNTING',
};

export function isReviewStage(value: string): value is ReviewStage {
  return (REVIEW_STAGES as readonly string[]).includes(value);
}

export const expensePath = (id: string) => `/expenses/${id}`;
export const approvalsPath = (stage: ReviewStage) => `/approvals/${stage}`;
export const approvalDetailPath = (stage: ReviewStage, id: string) =>
  `/approvals/${stage}/${id}`;
