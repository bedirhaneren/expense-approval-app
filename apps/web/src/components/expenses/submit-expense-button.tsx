'use client';

import { useState, useTransition } from 'react';
import { submitExpense } from '@/app/actions/expenses';
import type { ExpenseSummary } from '@/lib/api/types';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { ExpenseSummaryBox } from './expense-summary-box';

/** Asks for confirmation, because a submitted expense can no longer be edited. */
export function SubmitExpenseButton({ expense }: { expense: ExpenseSummary }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await submitExpense(expense.id);
      setError(result.error);
    });

  return (
    <>
      <Button icon="send" onClick={() => setOpen(true)}>
        Onaya Gönder
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        icon="send"
        title="Onaya gönderilsin mi?"
        description="Onaya gönderdikten sonra bu masrafı düzenleyemezsiniz. Masraf, yöneticinizin onayına iletilecek."
      >
        <ExpenseSummaryBox expense={expense} />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button
            icon="send"
            onClick={confirm}
            pending={pending}
            pendingLabel="Gönderiliyor..."
          >
            Onaya Gönder
          </Button>
        </div>
      </Dialog>
    </>
  );
}
