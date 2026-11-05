import {
  ExpenseCategory,
  ExpenseStatus,
  Prisma,
} from '../generated/prisma/client.js';
import type { ExpenseFormDto } from './dto/expense-form.dto.js';
import { toExpenseData, toExpenseSummary } from './expense.mapper.js';

const form = {
  title: 'Taksi',
  expenseDate: '2026-10-28',
  category: ExpenseCategory.TRANSPORT,
  amount: 10.5,
  note: '',
} satisfies ExpenseFormDto;

describe('expense mapper', () => {
  describe('toExpenseData', () => {
    it('stores the amount as an exact two-decimal string', () => {
      expect(toExpenseData(form).amount).toBe('10.50');
      expect(toExpenseData({ ...form, amount: 750 }).amount).toBe('750.00');
    });

    it('stores the date at UTC midnight so it never shifts a day', () => {
      expect(toExpenseData(form).expenseDate.toISOString()).toBe(
        '2026-10-28T00:00:00.000Z',
      );
    });

    it('stores an empty note as null', () => {
      expect(toExpenseData(form).note).toBeNull();
    });
  });

  describe('toExpenseSummary', () => {
    it('formats the amount and date for the API response', () => {
      const createdAt = new Date('2026-10-28T09:00:00Z');
      const summary = toExpenseSummary({
        id: 'expense-1',
        title: 'Taksi',
        expenseDate: new Date('2026-10-28T00:00:00Z'),
        category: ExpenseCategory.TRANSPORT,
        amount: new Prisma.Decimal('750'),
        note: null,
        status: ExpenseStatus.DRAFT,
        ownerId: 'user-1',
        owner: { id: 'user-1', fullName: 'Ali Çalışan' },
        rejectionReason: null,
        rejectedById: null,
        rejectedBy: null,
        createdAt,
        updatedAt: createdAt,
      });

      expect(summary).toMatchObject({
        amount: '750.00',
        expenseDate: '2026-10-28',
      });
      expect(summary).not.toHaveProperty('ownerId');
    });
  });
});
