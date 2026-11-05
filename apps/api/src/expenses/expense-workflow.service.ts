import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertRole } from '../auth/assert-role.js';
import type { AuthUser } from '../auth/auth.types.js';
import {
  ExpenseAction,
  ExpenseStatus,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ExpenseFormDto } from './dto/expense-form.dto.js';
import { visibleExpensesWhere } from './expense-access.js';
import {
  EDITABLE_STATUS,
  EXPENSE_TRANSITIONS,
  type TransitionAction,
} from './expense-state-machine.js';
import { toExpenseData } from './expense.mapper.js';
import { ExpenseMessages } from './expense.messages.js';
import type { ExpenseDetail } from './expense.types.js';
import { ExpensesService } from './expenses.service.js';

export interface TransitionCommand {
  expenseId: string;
  action: TransitionAction;
  actor: AuthUser;
  reason?: string;
}

interface GuardedUpdate {
  expenseId: string;
  actor: AuthUser;
  expectedStatus: ExpenseStatus;
  data: Prisma.ExpenseUncheckedUpdateManyInput;
  conflictMessage: (currentStatus: ExpenseStatus) => string;
}

interface HistoryEntryInput {
  expenseId: string;
  actorId: string;
  action: ExpenseAction;
  fromStatus: ExpenseStatus | null;
  toStatus: ExpenseStatus;
  reason?: string;
}

/**
 * Write side: every change to an expense goes through here, and every change
 * is recorded in the history within the same transaction.
 */
@Injectable()
export class ExpenseWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenses: ExpensesService,
  ) {}

  async create(form: ExpenseFormDto, owner: AuthUser): Promise<ExpenseDetail> {
    const expenseId = await this.prisma.$transaction(async (tx) => {
      const { id } = await tx.expense.create({
        data: { ...toExpenseData(form), ownerId: owner.id },
        select: { id: true },
      });
      await recordHistory(tx, {
        expenseId: id,
        actorId: owner.id,
        action: ExpenseAction.CREATED,
        fromStatus: null,
        toStatus: ExpenseStatus.DRAFT,
      });
      return id;
    });

    return this.expenses.getVisibleById(expenseId, owner);
  }

  async updateDraft(
    expenseId: string,
    form: ExpenseFormDto,
    owner: AuthUser,
  ): Promise<ExpenseDetail> {
    await this.prisma.$transaction(async (tx) => {
      await updateIfInStatus(tx, {
        expenseId,
        actor: owner,
        expectedStatus: EDITABLE_STATUS,
        data: toExpenseData(form),
        conflictMessage: () => ExpenseMessages.NOT_EDITABLE,
      });
      await recordHistory(tx, {
        expenseId,
        actorId: owner.id,
        action: ExpenseAction.UPDATED,
        fromStatus: EDITABLE_STATUS,
        toStatus: EDITABLE_STATUS,
      });
    });

    return this.expenses.getVisibleById(expenseId, owner);
  }

  async transition({
    expenseId,
    action,
    actor,
    reason,
  }: TransitionCommand): Promise<ExpenseDetail> {
    const { from, to, actorRole } = EXPENSE_TRANSITIONS[action];
    assertRole(actor, actorRole);

    await this.prisma.$transaction(async (tx) => {
      await updateIfInStatus(tx, {
        expenseId,
        actor,
        expectedStatus: from,
        data: { status: to, ...rejectionFields(to, actor, reason) },
        conflictMessage: ExpenseMessages.invalidTransition,
      });
      await recordHistory(tx, {
        expenseId,
        actorId: actor.id,
        action,
        fromStatus: from,
        toStatus: to,
        reason,
      });
    });

    return this.expenses.getVisibleById(expenseId, actor);
  }
}

/**
 * Updates the expense only if the actor can see it and it is still in the
 * expected status. The status check is part of the UPDATE itself, so two
 * concurrent requests (e.g. a double-clicked approve) cannot both succeed.
 */
async function updateIfInStatus(
  tx: Prisma.TransactionClient,
  { expenseId, actor, expectedStatus, data, conflictMessage }: GuardedUpdate,
): Promise<void> {
  const visibleExpense: Prisma.ExpenseWhereInput = {
    AND: [{ id: expenseId }, visibleExpensesWhere(actor)],
  };

  const { count } = await tx.expense.updateMany({
    where: { AND: [visibleExpense, { status: expectedStatus }] },
    data,
  });
  if (count > 0) return;

  const current = await tx.expense.findFirst({
    where: visibleExpense,
    select: { status: true },
  });
  if (!current) {
    throw new NotFoundException(ExpenseMessages.NOT_FOUND);
  }
  throw new ConflictException(conflictMessage(current.status));
}

function rejectionFields(
  targetStatus: ExpenseStatus,
  actor: AuthUser,
  reason?: string,
): Prisma.ExpenseUncheckedUpdateManyInput {
  if (targetStatus !== ExpenseStatus.REJECTED) return {};
  return { rejectionReason: reason, rejectedById: actor.id };
}

async function recordHistory(
  tx: Prisma.TransactionClient,
  entry: HistoryEntryInput,
): Promise<void> {
  await tx.expenseHistory.create({ data: entry });
}
