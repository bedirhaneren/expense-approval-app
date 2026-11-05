'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { approveExpense, rejectExpense } from '@/app/actions/approvals';
import type { ExpenseSummary, ReviewStage } from '@/lib/api/types';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { errorIdFor, Field, inputClasses } from '../ui/field';
import { ExpenseSummaryBox } from './expense-summary-box';

const REASON_REQUIRED = 'Red gerekçesi zorunludur.';

interface ReviewActionsProps {
  stage: ReviewStage;
  expense: ExpenseSummary;
}

/** Approve and reject buttons for a manager or accounting reviewer. */
export function ReviewActions({ stage, expense }: ReviewActionsProps) {
  const [approving, startApprove] = useTransition();
  const [approveError, setApproveError] = useState<string>();
  const [rejectOpen, setRejectOpen] = useState(false);

  const approve = () =>
    startApprove(async () => {
      const result = await approveExpense(stage, expense.id);
      setApproveError(result.error);
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          variant="danger-outline"
          icon="close"
          onClick={() => setRejectOpen(true)}
          disabled={approving}
        >
          Reddet
        </Button>
        <Button
          variant="success"
          icon="check"
          onClick={approve}
          pending={approving}
          pendingLabel="Onaylanıyor..."
        >
          Onayla
        </Button>
      </div>
      {approveError && (
        <p role="alert" className="text-xs text-danger">
          {approveError}
        </p>
      )}
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        stage={stage}
        expense={expense}
      />
    </div>
  );
}

interface RejectDialogProps extends ReviewActionsProps {
  open: boolean;
  onClose: () => void;
}

function RejectDialog({ open, onClose, stage, expense }: RejectDialogProps) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const reasonId = `reject-reason-${expense.id}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get('reason'));
    if (!reason.trim()) {
      setError(REASON_REQUIRED);
      return;
    }
    startTransition(async () => {
      const result = await rejectExpense(stage, expense.id, reason);
      setError(result.error);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon="cancel"
      tone="danger"
      title="Masrafı reddet"
      description="Reddetme gerekçesi masraf sahibine gösterilecek."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
        <ExpenseSummaryBox expense={expense} />
        <Field id={reasonId} label="Red gerekçesi" required error={error}>
          <textarea
            id={reasonId}
            name="reason"
            rows={4}
            maxLength={500}
            placeholder="Reddetme nedeninizi yazın"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorIdFor(reasonId) : undefined}
            onChange={() => setError(undefined)}
            className={inputClasses(Boolean(error))}
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            type="submit"
            variant="danger"
            icon="block"
            pending={pending}
            pendingLabel="Reddediliyor..."
          >
            Reddet
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
