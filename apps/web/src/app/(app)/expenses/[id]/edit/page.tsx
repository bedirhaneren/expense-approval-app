import { redirect } from 'next/navigation';
import { saveExpense } from '@/app/actions/expenses';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { PageHeader } from '@/components/ui/page-header';
import { fetchExpense, requireUser } from '@/lib/dal';
import { todayDateOnly } from '@/lib/format';
import { expensePath } from '@/lib/routes';

export default async function EditExpensePage({
  params,
}: PageProps<'/expenses/[id]/edit'>) {
  await requireUser('EMPLOYEE');
  const { id } = await params;
  const expense = await fetchExpense(id);

  // Only drafts are editable; the API enforces this too.
  if (expense.status !== 'DRAFT') redirect(expensePath(expense.id));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        back={{ href: expensePath(expense.id), label: expense.title }}
        title="Taslağı Düzenle"
        description="Değişiklikler kaydedildikten sonra masrafı onaya gönderebilirsiniz."
      />
      <ExpenseForm
        action={saveExpense.bind(null, expense.id)}
        initialValues={{
          title: expense.title,
          expenseDate: expense.expenseDate,
          category: expense.category,
          amount: expense.amount,
          note: expense.note ?? '',
        }}
        submitLabel="Değişiklikleri Kaydet"
        cancelHref={expensePath(expense.id)}
        maxDate={todayDateOnly()}
      />
    </div>
  );
}
