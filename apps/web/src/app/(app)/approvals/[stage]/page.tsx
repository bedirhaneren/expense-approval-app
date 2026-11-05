import { notFound } from 'next/navigation';
import {
  amountColumn,
  categoryColumn,
  dateColumn,
  ExpenseTable,
  type ExpenseColumn,
} from '@/components/expenses/expense-table';
import { PersonAvatar } from '@/components/expenses/person-avatar';
import { ReviewActions } from '@/components/expenses/review-actions';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { NoticeToast } from '@/components/ui/notice-toast';
import { PageHeader } from '@/components/ui/page-header';
import type { ReviewStage } from '@/lib/api/types';
import { fetchPendingExpenses, requireUser } from '@/lib/dal';
import {
  approvalDetailPath,
  isReviewStage,
  REVIEWER_ROLE_BY_STAGE,
} from '@/lib/routes';

const PAGE_TEXT: Record<ReviewStage, { title: string; description: string }> = {
  manager: {
    title: 'Onay Bekleyen Masraflar',
    description: 'Ekibinizin onayınızı bekleyen masraf bildirimleri',
  },
  accounting: {
    title: 'Muhasebe Onayı Bekleyen Masraflar',
    description: 'Yönetici onayından geçmiş masraf bildirimleri',
  },
};

const employeeColumn: ExpenseColumn = {
  header: 'Çalışan',
  render: (expense) => <PersonAvatar fullName={expense.owner.fullName} />,
};

export default async function ApprovalQueuePage({
  params,
  searchParams,
}: PageProps<'/approvals/[stage]'>) {
  const [{ stage }, { notice }] = await Promise.all([params, searchParams]);
  if (!isReviewStage(stage)) notFound();

  await requireUser(REVIEWER_ROLE_BY_STAGE[stage]);
  const expenses = await fetchPendingExpenses(stage);

  return (
    <>
      <NoticeToast notice={notice} />
      <PageHeader {...PAGE_TEXT[stage]} />
      <Card className="overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState
            icon="check_circle"
            title="Onay bekleyen masraf yok"
            description="Yeni bir bildirim geldiğinde burada listelenecek."
          />
        ) : (
          <ExpenseTable
            expenses={expenses}
            columns={[employeeColumn, dateColumn, categoryColumn, amountColumn]}
            hrefFor={(expense) => approvalDetailPath(stage, expense.id)}
            actionsFor={(expense) => (
              <>
                <LinkButton
                  href={approvalDetailPath(stage, expense.id)}
                  variant="ghost"
                  icon="visibility"
                >
                  Detay
                </LinkButton>
                <ReviewActions stage={stage} expense={expense} />
              </>
            )}
          />
        )}
      </Card>
    </>
  );
}
