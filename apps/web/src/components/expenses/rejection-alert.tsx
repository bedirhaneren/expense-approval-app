import type { ExpenseDetail } from '@/lib/api/types';
import { Icon } from '../ui/icon';

/** Shown at the top of a rejected expense so the reason is the first thing seen. */
export function RejectionAlert({ expense }: { expense: ExpenseDetail }) {
  if (expense.status !== 'REJECTED') return null;

  return (
    <div
      role="alert"
      className="flex gap-4 rounded-card border border-status-rejected-border bg-status-rejected-bg/60 p-5"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-rejected-bg text-danger">
        <Icon name="cancel" className="text-2xl" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-danger-strong">
          Reddedildi{expense.rejectedBy && ` — ${expense.rejectedBy.fullName}`}
        </p>
        <p>
          <span className="font-medium">Gerekçe:</span> “
          {expense.rejectionReason}”
        </p>
      </div>
    </div>
  );
}
