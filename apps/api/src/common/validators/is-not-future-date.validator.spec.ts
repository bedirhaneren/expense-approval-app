import { validateSync } from 'class-validator';
import { IsNotFutureDate } from './is-not-future-date.validator.js';

class DatedForm {
  @IsNotFutureDate()
  date: string;

  constructor(date: string) {
    this.date = date;
  }
}

const isValid = (date: string) =>
  validateSync(new DatedForm(date)).length === 0;

describe('IsNotFutureDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts today and past dates, rejects tomorrow', () => {
    vi.useFakeTimers({ now: new Date('2026-11-04T12:00:00Z') });

    expect(isValid('2026-11-03')).toBe(true);
    expect(isValid('2026-11-04')).toBe(true);
    expect(isValid('2026-11-05')).toBe(false);
  });

  it('uses Turkish time: just after midnight in Istanbul it is already the next day', () => {
    // 22:30 UTC on 4 Nov is 01:30 on 5 Nov in Istanbul (UTC+3).
    vi.useFakeTimers({ now: new Date('2026-11-04T22:30:00Z') });

    expect(isValid('2026-11-05')).toBe(true);
    expect(isValid('2026-11-06')).toBe(false);
  });

  it('rejects values that are not strings', () => {
    expect(
      validateSync(new DatedForm(20261104 as unknown as string)),
    ).not.toEqual([]);
  });
});
