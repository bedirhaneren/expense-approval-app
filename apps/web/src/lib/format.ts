const BUSINESS_TIME_ZONE = 'Europe/Istanbul';

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: BUSINESS_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// The en-CA locale formats dates as YYYY-MM-DD.
const dateOnlyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
});

/** "750.00" → "750,00 ₺" */
export function formatMoney(amount: string): string {
  return `${moneyFormatter.format(Number(amount))} ₺`;
}

/** "2026-10-28" → "28.10.2026" (no time zone conversion for date-only values) */
export function formatDate(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-');
  return `${day}.${month}.${year}`;
}

/** ISO timestamp → "28.10.2026 14:32" in Turkish time */
export function formatDateTime(isoTimestamp: string): string {
  return dateTimeFormatter.format(new Date(isoTimestamp));
}

/** Today's date in Turkish time as YYYY-MM-DD, used as the latest selectable expense date. */
export function todayDateOnly(): string {
  return dateOnlyFormatter.format(new Date());
}

/** "Ali Çalışan" → "AÇ" */
export function initialsOf(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase('tr-TR'))
    .join('');
}
