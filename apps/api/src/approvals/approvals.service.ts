import { Injectable } from '@nestjs/common';
import { assertRole } from '../auth/assert-role.js';
import type { AuthUser } from '../auth/auth.types.js';
import { ExpenseWorkflowService } from '../expenses/expense-workflow.service.js';
import { EXPENSE_TRANSITIONS } from '../expenses/expense-state-machine.js';
import type {
  ExpenseDetail,
  ExpenseSummary,
} from '../expenses/expense.types.js';
import { ExpensesService } from '../expenses/expenses.service.js';
import { REVIEW_STAGE_ACTIONS, ReviewStage } from './review-stage.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly expenses: ExpensesService,
    private readonly workflow: ExpenseWorkflowService,
  ) {}

  /** Expenses waiting for this reviewer at the given stage. */
  listPending(
    stage: ReviewStage,
    reviewer: AuthUser,
  ): Promise<ExpenseSummary[]> {
    const { from: pendingStatus, actorRole } =
      EXPENSE_TRANSITIONS[REVIEW_STAGE_ACTIONS[stage].approve];
    assertRole(reviewer, actorRole);

    return this.expenses.listVisible(reviewer, { status: pendingStatus });
  }

  approve(
    stage: ReviewStage,
    expenseId: string,
    reviewer: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.workflow.transition({
      expenseId,
      action: REVIEW_STAGE_ACTIONS[stage].approve,
      actor: reviewer,
    });
  }

  reject(
    stage: ReviewStage,
    expenseId: string,
    reviewer: AuthUser,
    reason: string,
  ): Promise<ExpenseDetail> {
    return this.workflow.transition({
      expenseId,
      action: REVIEW_STAGE_ACTIONS[stage].reject,
      actor: reviewer,
      reason,
    });
  }
}
