import type {
  ExpenseAction,
  ExpenseCategory,
  ExpenseStatus,
  Role,
} from '../generated/prisma/client.js';

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
  /** Decimal string with two fractional digits, e.g. "750.00", to avoid float errors. */
  amount: string;
  note: string | null;
  status: ExpenseStatus;
  owner: PersonSummary;
  rejectionReason: string | null;
  rejectedBy: PersonSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseHistoryEntry {
  id: string;
  action: ExpenseAction;
  fromStatus: ExpenseStatus | null;
  toStatus: ExpenseStatus;
  reason: string | null;
  actor: PersonSummary & { role: Role };
  createdAt: Date;
}

export interface ExpenseDetail extends ExpenseSummary {
  history: ExpenseHistoryEntry[];
}
