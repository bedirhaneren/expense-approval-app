'use server';

import { redirect } from 'next/navigation';
import { type ActionResult, encodeId, sendCommand } from '@/lib/api/command';
import type { ReviewStage } from '@/lib/api/types';
import { approvalsPath, isReviewStage } from '@/lib/routes';

const INVALID_REQUEST: ActionResult = { error: 'Geçersiz istek.' };

export async function approveExpense(
  stage: ReviewStage,
  expenseId: string,
): Promise<ActionResult> {
  if (!isReviewStage(stage)) return INVALID_REQUEST;

  const result = await sendCommand(
    `/approvals/${stage}/${encodeId(expenseId)}/approve`,
  );
  if (result.error) return result;

  redirect(`${approvalsPath(stage)}?notice=approved`);
}

export async function rejectExpense(
  stage: ReviewStage,
  expenseId: string,
  reason: string,
): Promise<ActionResult> {
  if (!isReviewStage(stage)) return INVALID_REQUEST;

  const result = await sendCommand(
    `/approvals/${stage}/${encodeId(expenseId)}/reject`,
    { reason },
  );
  if (result.error) return result;

  redirect(`${approvalsPath(stage)}?notice=rejected`);
}
