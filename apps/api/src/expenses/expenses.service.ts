import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { visibleExpensesWhere } from './expense-access.js';
import {
  EXPENSE_DETAIL_INCLUDE,
  EXPENSE_SUMMARY_INCLUDE,
  toExpenseDetail,
  toExpenseSummary,
} from './expense.mapper.js';
import { ExpenseMessages } from './expense.messages.js';
import type { ExpenseDetail, ExpenseSummary } from './expense.types.js';

/** Read side: every query is scoped to the expenses the user may see. */
@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async listVisible(
    user: AuthUser,
    filter: Prisma.ExpenseWhereInput = {},
  ): Promise<ExpenseSummary[]> {
    const records = await this.prisma.expense.findMany({
      where: { AND: [visibleExpensesWhere(user), filter] },
      include: EXPENSE_SUMMARY_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toExpenseSummary);
  }

  async getVisibleById(id: string, user: AuthUser): Promise<ExpenseDetail> {
    const record = await this.prisma.expense.findFirst({
      where: { AND: [{ id }, visibleExpensesWhere(user)] },
      include: EXPENSE_DETAIL_INCLUDE,
    });
    if (!record) {
      throw new NotFoundException(ExpenseMessages.NOT_FOUND);
    }
    return toExpenseDetail(record);
  }
}
