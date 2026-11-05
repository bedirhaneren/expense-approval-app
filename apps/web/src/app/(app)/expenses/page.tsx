import {
  amountColumn,
  categoryColumn,
  dateColumn,
  ExpenseTable,
  type ExpenseColumn,
} from '@/components/expenses/expense-table';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { NoticeToast } from '@/components/ui/notice-toast';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { fetchMyExpenses, requireUser } from '@/lib/dal';
import { expensePath } from '@/lib/routes';

const statusColumn: ExpenseColumn = {
  header: 'Durum',
  align: 'center',
  render: (expense) => <StatusBadge status={expense.status} />,
};

export default async function MyExpensesPage({
  searchParams,
}: PageProps<'/expenses'>) {
  await requireUser('EMPLOYEE');
  const [expenses, { notice }] = await Promise.all([
    fetchMyExpenses(),
    searchParams,
  ]);

  const newExpenseButton = (
    <LinkButton href="/expenses/new" icon="add">
      Yeni Masraf
    </LinkButton>
  );

  return (
    <>
      <NoticeToast notice={notice} />
      <PageHeader
        title="Masraflarım"
        description="Oluşturduğunuz masraf bildirimleri ve güncel onay durumları"
        actions={newExpenseButton}
      />
      <Card className="overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="Henüz masrafınız yok"
            description="İlk masraf bildiriminizi oluşturarak başlayın."
            action={newExpenseButton}
          />
        ) : (
          <ExpenseTable
            expenses={expenses}
            columns={[dateColumn, categoryColumn, amountColumn, statusColumn]}
            hrefFor={(expense) => expensePath(expense.id)}
          />
        )}
      </Card>
    </>
  );
}
