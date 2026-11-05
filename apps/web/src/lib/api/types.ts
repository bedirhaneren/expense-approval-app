/** Response shapes of the NestJS API (see apps/api/src/expenses/expense.types.ts). */

export type Role = 'EMPLOYEE' | 'MANAGER' | 'ACCOUNTING';

export type ExpenseCategory = 'TRANSPORT' | 'MEAL' | 'ACCOMMODATION' | 'OTHER';

export type ExpenseStatus =
  'DRAFT' | 'PENDING_MANAGER' | 'PENDING_ACCOUNTING' | 'APPROVED' | 'REJECTED';

export type ExpenseAction =
  | 'CREATED'
  | 'UPDATED'
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'MANAGER_REJECTED'
  | 'ACCOUNTING_APPROVED'
  | 'ACCOUNTING_REJECTED';

export type ReviewStage = 'manager' | 'accounting';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  managerId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface PersonSummary {
  id: string;
  fullName: string;
}

export interface ExpenseSummary {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  expenseDate: string;
  category: ExpenseCategory;
  /** Decimal string, e.g. "750.00" */
  amount: string;
  note: string | null;
  status: ExpenseStatus;
  owner: PersonSummary;
  rejectionReason: string | null;
  rejectedBy: PersonSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseHistoryEntry {
  id: string;
  action: ExpenseAction;
  fromStatus: ExpenseStatus | null;
  toStatus: ExpenseStatus;
  reason: string | null;
  actor: PersonSummary & { role: Role };
  createdAt: string;
}

export interface ExpenseDetail extends ExpenseSummary {
  history: ExpenseHistoryEntry[];
}

export interface ExpenseFormValues {
  title: string;
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
}
