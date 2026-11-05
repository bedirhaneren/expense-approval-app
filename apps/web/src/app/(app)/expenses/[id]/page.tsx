import { ExpenseDetailView } from '@/components/expenses/expense-detail-view';
import { SubmitExpenseButton } from '@/components/expenses/submit-expense-button';
import { LinkButton } from '@/components/ui/button';
import { NoticeToast } from '@/components/ui/notice-toast';
import { fetchExpense, requireUser } from '@/lib/dal';

export default async function ExpenseDetailPage({
  params,
  searchParams,
}: PageProps<'/expenses/[id]'>) {
  await requireUser('EMPLOYEE');
  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  const expense = await fetchExpense(id);

  const draftActions = expense.status === 'DRAFT' && (
    <>
      <LinkButton
        href={`/expenses/${expense.id}/edit`}
        variant="secondary"
        icon="edit"
      >
        Düzenle
      </LinkButton>
      <SubmitExpenseButton expense={expense} />
    </>
  );

  return (
    <>
      <NoticeToast notice={notice} />
      <ExpenseDetailView
        expense={expense}
        back={{ href: '/expenses', label: 'Masraflarım' }}
        actions={draftActions || undefined}
      />
    </>
  );
}
