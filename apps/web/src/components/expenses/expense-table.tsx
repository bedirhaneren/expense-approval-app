import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ExpenseSummary } from '@/lib/api/types';
import { formatDate, formatMoney } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/labels';
import { Icon } from '../ui/icon';
import { StatusBadge } from '../ui/status-badge';
import { CategoryIcon } from './category-icon';

export interface ExpenseColumn {
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (expense: ExpenseSummary) => ReactNode;
}

interface ExpenseTableProps {
  expenses: ExpenseSummary[];
  /** Columns shown after the title column. */
  columns: ExpenseColumn[];
  hrefFor: (expense: ExpenseSummary) => string;
  /** Optional per-row actions (e.g. approve / reject). */
  actionsFor?: (expense: ExpenseSummary) => ReactNode;
}

const ALIGN_CLASSES = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

/** A table on wide screens and a list of cards on phones. */
export function ExpenseTable({
  expenses,
  columns,
  hrefFor,
  actionsFor,
}: ExpenseTableProps) {
  return (
    <>
      <table className="hidden w-full md:table">
        <thead className="border-b border-border bg-canvas text-xs font-medium tracking-wide text-ink-secondary uppercase">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              Başlık
            </th>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-3 ${ALIGN_CLASSES[column.align ?? 'left']}`}
              >
                {column.header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-right">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-surface-muted last:border-0 hover:bg-canvas"
            >
              <td className="px-6 py-3">
                <Link
                  href={hrefFor(expense)}
                  className="flex items-center gap-3 font-medium hover:text-primary"
                >
                  <CategoryIcon category={expense.category} />
                  {expense.title}
                </Link>
              </td>
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-4 py-3 ${ALIGN_CLASSES[column.align ?? 'left']}`}
                >
                  {column.render(expense)}
                </td>
              ))}
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-2">
                  {actionsFor ? (
                    actionsFor(expense)
                  ) : (
                    <Link
                      href={hrefFor(expense)}
                      aria-label={`${expense.title} detayı`}
                      className="text-ink-muted hover:text-ink"
                    >
                      <Icon name="chevron_right" />
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col divide-y divide-border md:hidden">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex flex-col gap-3 p-4">
            <Link href={hrefFor(expense)} className="flex items-center gap-3">
              <CategoryIcon category={expense.category} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate font-medium">{expense.title}</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(expense.amount)}
                  </span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-ink-secondary tabular-nums">
                    {formatDate(expense.expenseDate)} ·{' '}
                    {CATEGORY_LABELS[expense.category]}
                  </span>
                  <StatusBadge status={expense.status} />
                </span>
              </span>
            </Link>
            {actionsFor && (
              <div className="flex flex-wrap gap-2">{actionsFor(expense)}</div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Columns shared by the employee and reviewer tables. */
export const dateColumn: ExpenseColumn = {
  header: 'Tarih',
  render: (expense) => (
    <span className="tabular-nums">{formatDate(expense.expenseDate)}</span>
  ),
};

export const categoryColumn: ExpenseColumn = {
  header: 'Kategori',
  render: (expense) => (
    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
      {CATEGORY_LABELS[expense.category]}
    </span>
  ),
};

export const amountColumn: ExpenseColumn = {
  header: 'Tutar',
  align: 'right',
  render: (expense) => (
    <span className="font-semibold tabular-nums">
      {formatMoney(expense.amount)}
    </span>
  ),
};
