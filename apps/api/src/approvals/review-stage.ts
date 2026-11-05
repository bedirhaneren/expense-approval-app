import { NotFoundException, ParseEnumPipe } from '@nestjs/common';
import { ExpenseAction } from '../generated/prisma/client.js';
import type { TransitionAction } from '../expenses/expense-state-machine.js';

export enum ReviewStage {
  MANAGER = 'manager',
  ACCOUNTING = 'accounting',
}

interface ReviewStageActions {
  approve: TransitionAction;
  reject: TransitionAction;
}

/**
 * Maps each review stage to its workflow actions. The pending status and the
 * reviewer role are derived from the state machine, not repeated here.
 */
export const REVIEW_STAGE_ACTIONS: Record<ReviewStage, ReviewStageActions> = {
  [ReviewStage.MANAGER]: {
    approve: ExpenseAction.MANAGER_APPROVED,
    reject: ExpenseAction.MANAGER_REJECTED,
  },
  [ReviewStage.ACCOUNTING]: {
    approve: ExpenseAction.ACCOUNTING_APPROVED,
    reject: ExpenseAction.ACCOUNTING_REJECTED,
  },
};

export const ParseReviewStagePipe = new ParseEnumPipe(ReviewStage, {
  exceptionFactory: () => new NotFoundException('Onay aşaması bulunamadı.'),
});
