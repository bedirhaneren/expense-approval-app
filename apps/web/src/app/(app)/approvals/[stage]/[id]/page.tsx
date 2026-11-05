import { notFound } from 'next/navigation';
import { ExpenseDetailView } from '@/components/expenses/expense-detail-view';
import { ReviewActions } from '@/components/expenses/review-actions';
import { fetchExpense, requireUser } from '@/lib/dal';
import {
  approvalsPath,
  isReviewStage,
  PENDING_STATUS_BY_STAGE,
  REVIEWER_ROLE_BY_STAGE,
} from '@/lib/routes';

export default async function ApprovalDetailPage({
  params,
}: PageProps<'/approvals/[stage]/[id]'>) {
  const { stage, id } = await params;
  if (!isReviewStage(stage)) notFound();

  await requireUser(REVIEWER_ROLE_BY_STAGE[stage]);
  const expense = await fetchExpense(id);
  const awaitsThisReviewer = expense.status === PENDING_STATUS_BY_STAGE[stage];

  return (
    <ExpenseDetailView
      expense={expense}
      back={{ href: approvalsPath(stage), label: 'Onay bekleyenler' }}
      actions={
        awaitsThisReviewer && <ReviewActions stage={stage} expense={expense} />
      }
    />
  );
}
