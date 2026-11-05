import type { ExpenseStatus } from '@/lib/api/types';
import { STATUS_LABELS } from '@/lib/labels';

const STATUS_CLASSES: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-status-draft-bg text-status-draft-text border-status-draft-border',
  PENDING_MANAGER:
    'bg-status-manager-bg text-status-manager-text border-status-manager-border',
  PENDING_ACCOUNTING:
    'bg-status-accounting-bg text-status-accounting-text border-status-accounting-border',
  APPROVED:
    'bg-status-approved-bg text-status-approved-text border-status-approved-border',
  REJECTED:
    'bg-status-rejected-bg text-status-rejected-text border-status-rejected-border',
};

export function StatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
