'use server';

import { redirect } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api/client';
import { type ActionResult, encodeId, sendCommand } from '@/lib/api/command';
import type { ExpenseDetail } from '@/lib/api/types';
import { requireSessionToken } from '@/lib/dal';
import {
  type ExpenseFormState,
  mapValidationMessages,
  readExpenseForm,
  toExpensePayload,
} from '@/lib/expense-form';
import { expensePath } from '@/lib/routes';

/** Creates a draft (expenseId = null) or replaces an existing draft. */
export async function saveExpense(
  expenseId: string | null,
  _previous: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const token = await requireSessionToken();
  const values = readExpenseForm(formData);

  let saved: ExpenseDetail;
  try {
    saved = await apiRequest<ExpenseDetail>(
      expenseId ? `/expenses/${encodeId(expenseId)}` : '/expenses',
      {
        method: expenseId ? 'PUT' : 'POST',
        body: toExpensePayload(values),
        token,
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ...mapValidationMessages(error.messages), values };
    }
    if (error instanceof ApiError) {
      return { formError: error.messages[0], values };
    }
    throw error;
  }

  const notice = expenseId ? 'updated' : 'created';
  redirect(`${expensePath(saved.id)}?notice=${notice}`);
}

export async function submitExpense(expenseId: string): Promise<ActionResult> {
  const result = await sendCommand(`/expenses/${encodeId(expenseId)}/submit`);
  if (result.error) return result;

  redirect(`${expensePath(expenseId)}?notice=submitted`);
}
