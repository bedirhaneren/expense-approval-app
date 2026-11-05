'use client';

import { useActionState } from 'react';
import type { ExpenseCategory } from '@/lib/api/types';
import type {
  ExpenseField,
  ExpenseFormInput,
  ExpenseFormState,
} from '@/lib/expense-form';
import { CATEGORY_LABELS } from '@/lib/labels';
import { Button, LinkButton } from '../ui/button';
import { Card } from '../ui/card';
import { errorIdFor, Field, inputClasses } from '../ui/field';
import { Icon } from '../ui/icon';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

const EMPTY_FORM: ExpenseFormInput = {
  title: '',
  expenseDate: '',
  category: '',
  amount: '',
  note: '',
};

interface ExpenseFormProps {
  action: (
    state: ExpenseFormState,
    formData: FormData,
  ) => Promise<ExpenseFormState>;
  initialValues?: ExpenseFormInput;
  submitLabel: string;
  cancelHref: string;
  /** Latest selectable date (today in Turkish time). */
  maxDate: string;
}

/**
 * The browser checks the basics (required, min/max) for quick feedback; the
 * API remains the source of truth and its messages appear under each field.
 */
export function ExpenseForm({
  action,
  initialValues = EMPTY_FORM,
  submitLabel,
  cancelHref,
  maxDate,
}: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initialValues;
  const errors = state.fieldErrors ?? {};

  const describedBy = (field: ExpenseField) =>
    errors[field] ? errorIdFor(field) : undefined;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <form action={formAction}>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          {state.formError && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg bg-status-rejected-bg p-4 text-danger-strong"
            >
              <Icon name="error" />
              <p>{state.formError}</p>
            </div>
          )}

          <Field id="title" label="Başlık" required error={errors.title}>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={values.title}
              placeholder="Örn. Müşteri ziyareti taksi"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy('title')}
              className={inputClasses(Boolean(errors.title))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              id="expenseDate"
              label="Masraf tarihi"
              required
              error={errors.expenseDate}
            >
              <input
                id="expenseDate"
                name="expenseDate"
                type="date"
                required
                max={maxDate}
                defaultValue={values.expenseDate}
                aria-invalid={Boolean(errors.expenseDate)}
                aria-describedby={describedBy('expenseDate')}
                className={inputClasses(Boolean(errors.expenseDate))}
              />
            </Field>

            <Field
              id="category"
              label="Kategori"
              required
              error={errors.category}
            >
              <select
                id="category"
                name="category"
                required
                defaultValue={values.category}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={describedBy('category')}
                className={inputClasses(Boolean(errors.category))}
              >
                <option value="" disabled>
                  Kategori seçin
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field id="amount" label="Tutar" required error={errors.amount}>
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                required
                min="0.01"
                max="1000000"
                step="0.01"
                defaultValue={values.amount}
                placeholder="0,00"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={describedBy('amount')}
                className={`${inputClasses(Boolean(errors.amount))} pr-9 tabular-nums`}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted">
                ₺
              </span>
            </div>
          </Field>

          <Field id="note" label="Not" optional error={errors.note}>
            <textarea
              id="note"
              name="note"
              rows={4}
              maxLength={1000}
              defaultValue={values.note}
              placeholder="Masrafa dair ek açıklamalar"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={describedBy('note')}
              className={inputClasses(Boolean(errors.note))}
            />
          </Field>
        </div>

        <footer className="flex items-center justify-end gap-3 rounded-b-card border-t border-border bg-canvas px-6 py-4 sm:px-8">
          <LinkButton href={cancelHref} variant="ghost">
            İptal
          </LinkButton>
          <Button
            type="submit"
            pending={pending}
            pendingLabel="Kaydediliyor..."
          >
            {submitLabel}
          </Button>
        </footer>
      </form>
    </Card>
  );
}
