import type { ReactNode } from 'react';
import type { ExpenseDetail } from '@/lib/api/types';
import { PageHeader } from '../ui/page-header';
import { StatusBadge } from '../ui/status-badge';
import { ExpenseInfoCard } from './expense-info-card';
import { HistoryTimeline } from './history-timeline';
import { RejectionAlert } from './rejection-alert';

interface ExpenseDetailViewProps {
  expense: ExpenseDetail;
  back: { href: string; label: string };
  /** Role-specific buttons (submit, approve, reject…). */
  actions?: ReactNode;
}

/** Shared by the employee and reviewer detail pages. */
export function ExpenseDetailView({
  expense,
  back,
  actions,
}: ExpenseDetailViewProps) {
  return (
    <>
      <PageHeader
        back={back}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {expense.title}
            <StatusBadge status={expense.status} />
          </span>
        }
        description={`${expense.owner.fullName} tarafından oluşturuldu`}
        actions={actions}
      />
      <RejectionAlert expense={expense} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpenseInfoCard expense={expense} />
        </div>
        <div className="lg:col-span-2">
          <HistoryTimeline entries={expense.history} />
        </div>
      </div>
    </>
  );
}
