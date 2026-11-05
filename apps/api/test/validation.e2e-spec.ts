import { todayAsDateOnly } from '../src/common/date-only.js';
import {
  createExpenseAt,
  validExpenseForm,
} from './helpers/expense-fixtures.js';
import { createTestContext, TestContext } from './helpers/test-context.js';

/** Expense form validation, applied to both creating and editing. */
describe('Expense form validation (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(() => ctx.close());

  const create = (override: object) =>
    ctx.as('ali').post('/expenses', { ...validExpenseForm, ...override });

  it.each<[string, object, string]>([
    ['a missing title', { title: undefined }, 'Başlık zorunludur.'],
    ['a blank title', { title: '   ' }, 'Başlık zorunludur.'],
    [
      'a title over 200 characters',
      { title: 'a'.repeat(201) },
      'Başlık en fazla 200 karakter olabilir.',
    ],
    [
      'a missing date',
      { expenseDate: undefined },
      'Masraf tarihi YYYY-AA-GG biçiminde olmalıdır.',
    ],
    [
      'a non-existent date',
      { expenseDate: '2026-02-30' },
      'Masraf tarihi geçerli bir tarih olmalıdır.',
    ],
    [
      'a future date',
      { expenseDate: '2999-01-01' },
      'Masraf tarihi gelecekte olamaz.',
    ],
    [
      'an unknown category',
      { category: 'GIFT' },
      'Kategori ulaşım, yemek, konaklama veya diğer olmalıdır.',
    ],
    ['a zero amount', { amount: 0 }, 'Tutar sıfırdan büyük olmalıdır.'],
    ['a negative amount', { amount: -10 }, 'Tutar sıfırdan büyük olmalıdır.'],
    [
      'an amount with three decimals',
      { amount: 10.123 },
      'Tutar en fazla 2 ondalık basamaklı bir sayı olmalıdır.',
    ],
    [
      'an amount sent as text',
      { amount: '750' },
      'Tutar en fazla 2 ondalık basamaklı bir sayı olmalıdır.',
    ],
    [
      'an amount over the limit',
      { amount: 1_000_000.01 },
      'Tutar en fazla 1.000.000 TL olabilir.',
    ],
    [
      'a note over 1000 characters',
      { note: 'a'.repeat(1001) },
      'Not en fazla 1000 karakter olabilir.',
    ],
  ])('rejects %s', async (_case, override, expectedMessage) => {
    const response = await create(override);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(expectedMessage);
  });

  it('rejects fields that are not part of the form', async () => {
    const response = await create({ status: 'APPROVED' });

    expect(response.status).toBe(400);
  });

  it.each<[string, object]>([
    ["today's date", { expenseDate: todayAsDateOnly() }],
    ['the maximum amount', { amount: 1_000_000 }],
    ['the smallest amount', { amount: 0.01 }],
    ['an optional note', { note: 'Fiş ektedir' }],
  ])('accepts %s', async (_case, override) => {
    const response = await create(override);

    expect(response.status).toBe(201);
  });

  it('trims the title and stores an empty note as null', async () => {
    const response = await create({ title: '  Taksi  ', note: '   ' });

    expect(response.body).toMatchObject({ title: 'Taksi', note: null });
  });

  it('applies the same rules when editing a draft', async () => {
    const id = await createExpenseAt(ctx, 'draft');

    const response = await ctx
      .as('ali')
      .put(`/expenses/${id}`, { ...validExpenseForm, amount: -1 });

    expect(response.status).toBe(400);
  });
});
