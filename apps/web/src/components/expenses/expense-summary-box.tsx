import type { ExpenseSummary } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

/** Compact "what am I acting on" line used inside confirmation dialogs. */
export function ExpenseSummaryBox({ expense }: { expense: ExpenseSummary }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-primary-soft px-4 py-3">
      <span className="min-w-0">
        <span className="block truncate font-medium">{expense.title}</span>
        <span className="text-ink-secondary">{expense.owner.fullName}</span>
      </span>
      <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
        {formatMoney(expense.amount)}
      </span>
    </div>
  );
}
