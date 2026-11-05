import { formatDateOnly, parseDateOnly } from '../common/date-only.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ExpenseFormDto } from './dto/expense-form.dto.js';
import type {
  ExpenseDetail,
  ExpenseHistoryEntry,
  ExpenseSummary,
} from './expense.types.js';

const PERSON_SELECT = { id: true, fullName: true } satisfies Prisma.UserSelect;

export const EXPENSE_SUMMARY_INCLUDE = {
  owner: { select: PERSON_SELECT },
  rejectedBy: { select: PERSON_SELECT },
} satisfies Prisma.ExpenseInclude;

export const EXPENSE_DETAIL_INCLUDE = {
  ...EXPENSE_SUMMARY_INCLUDE,
  history: {
    orderBy: { createdAt: 'asc' as const },
    include: { actor: { select: { ...PERSON_SELECT, role: true } } },
  },
} satisfies Prisma.ExpenseInclude;

type ExpenseSummaryRecord = Prisma.ExpenseGetPayload<{
  include: typeof EXPENSE_SUMMARY_INCLUDE;
}>;
type ExpenseDetailRecord = Prisma.ExpenseGetPayload<{
  include: typeof EXPENSE_DETAIL_INCLUDE;
}>;
type HistoryRecord = ExpenseDetailRecord['history'][number];

export function toExpenseData(form: ExpenseFormDto) {
  return {
    title: form.title,
    expenseDate: parseDateOnly(form.expenseDate),
    category: form.category,
    amount: form.amount.toFixed(2),
    note: form.note || null,
  };
}

export function toExpenseSummary(record: ExpenseSummaryRecord): ExpenseSummary {
  return summaryFields(record);
}

export function toExpenseDetail(record: ExpenseDetailRecord): ExpenseDetail {
  return {
    ...summaryFields(record),
    history: record.history.map(toHistoryEntry),
  };
}

/** Plain object shared by the summary and detail responses. */
function summaryFields(record: ExpenseSummaryRecord) {
  return {
    id: record.id,
    title: record.title,
    expenseDate: formatDateOnly(record.expenseDate),
    category: record.category,
    amount: record.amount.toFixed(2),
    note: record.note,
    status: record.status,
    owner: record.owner,
    rejectionReason: record.rejectionReason,
    rejectedBy: record.rejectedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toHistoryEntry(record: HistoryRecord): ExpenseHistoryEntry {
  return {
    id: record.id,
    action: record.action,
    fromStatus: record.fromStatus,
    toStatus: record.toStatus,
    reason: record.reason,
    actor: record.actor,
    createdAt: record.createdAt,
  };
}
