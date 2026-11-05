import type { ExpenseCategory } from './api/types';

export type ExpenseField =
  'title' | 'expenseDate' | 'category' | 'amount' | 'note';

/** Raw form values, kept as strings so a failed submit can refill the form. */
export type ExpenseFormInput = Record<ExpenseField, string>;

export interface ExpenseFormState {
  fieldErrors?: Partial<Record<ExpenseField, string>>;
  formError?: string;
  values?: ExpenseFormInput;
}

/**
 * The API returns validation messages without field names. Each message starts
 * with its field label (e.g. "Tutar sıfırdan büyük olmalıdır."), which lets us
 * show it under the right input.
 */
const FIELD_BY_MESSAGE_PREFIX: [string, ExpenseField][] = [
  ['Masraf tarihi', 'expenseDate'],
  ['Başlık', 'title'],
  ['Kategori', 'category'],
  ['Tutar', 'amount'],
  ['Not', 'note'],
];

export function readExpenseForm(formData: FormData): ExpenseFormInput {
  const read = (field: ExpenseField) => String(formData.get(field) ?? '');
  return {
    title: read('title'),
    expenseDate: read('expenseDate'),
    category: read('category'),
    amount: read('amount'),
    note: read('note'),
  };
}

export function toExpensePayload(input: ExpenseFormInput) {
  return {
    title: input.title,
    expenseDate: input.expenseDate,
    category: input.category as ExpenseCategory,
    amount: input.amount === '' ? null : Number(input.amount),
    note: input.note,
  };
}

export function mapValidationMessages(
  messages: string[],
): Pick<ExpenseFormState, 'fieldErrors' | 'formError'> {
  const fieldErrors: Partial<Record<ExpenseField, string>> = {};
  const unmatched: string[] = [];

  for (const message of messages) {
    const field = FIELD_BY_MESSAGE_PREFIX.find(([prefix]) =>
      message.startsWith(prefix),
    )?.[1];
    if (field) {
      fieldErrors[field] ??= message;
    } else {
      unmatched.push(message);
    }
  }

  return {
    fieldErrors,
    formError: unmatched.length > 0 ? unmatched.join(' ') : undefined,
  };
}
