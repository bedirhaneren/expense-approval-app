/** Expenses are dated in Turkish local time, not in the server's (UTC) time. */
const BUSINESS_TIME_ZONE = 'Europe/Istanbul';

export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The en-CA locale formats dates as YYYY-MM-DD.
const dateOnlyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayAsDateOnly(): string {
  return dateOnlyFormatter.format(new Date());
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
