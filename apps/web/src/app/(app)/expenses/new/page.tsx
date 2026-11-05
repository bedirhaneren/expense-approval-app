import { saveExpense } from '@/app/actions/expenses';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/lib/dal';
import { todayDateOnly } from '@/lib/format';

export default async function NewExpensePage() {
  await requireUser('EMPLOYEE');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        back={{ href: '/expenses', label: 'Masraflarım' }}
        title="Yeni Masraf"
        description="Masraf taslak olarak kaydedilir; kontrol ettikten sonra onaya gönderebilirsiniz."
      />
      <ExpenseForm
        action={saveExpense.bind(null, null)}
        submitLabel="Taslak Olarak Kaydet"
        cancelHref="/expenses"
        maxDate={todayDateOnly()}
      />
    </div>
  );
}
