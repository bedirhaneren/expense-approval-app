import { type Browser, expect, type Page } from '@playwright/test';

export const DEMO_PASSWORD = 'Demo123!';

export type DemoUser = 'ali' | 'veli' | 'ahmet' | 'ayse';

/** Makes test data unique per run, so tests also work on a non-empty database. */
export function uniqueTitle(base: string): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${base} ${suffix}`;
}

export async function login(page: Page, username: DemoUser): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Kullanıcı adı veya e-posta').fill(username);
  await page.getByLabel('Şifre').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

/** A separate browser session for each user, like different people on different machines. */
export async function openSessionAs(
  browser: Browser,
  username: DemoUser,
): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await login(page, username);
  return page;
}

interface ExpenseInput {
  title: string;
  category: 'Ulaşım' | 'Yemek' | 'Konaklama' | 'Diğer';
  amount: string;
  date?: string;
}

/** Creates a draft through the form and returns its id. */
export async function createDraft(
  page: Page,
  { title, category, amount, date = '2026-10-28' }: ExpenseInput,
): Promise<string> {
  await page.goto('/expenses/new');
  await page.getByLabel('Başlık').fill(title);
  await page.getByLabel('Masraf tarihi').fill(date);
  await page.getByLabel('Kategori').selectOption({ label: category });
  await page.getByLabel('Tutar').fill(amount);
  await page.getByRole('button', { name: 'Taslak Olarak Kaydet' }).click();

  await expect(
    page.getByText('Masraf taslak olarak kaydedildi.'),
  ).toBeVisible();
  return expenseIdFromUrl(page);
}

/** Submits the draft shown on the current detail page, confirming the dialog. */
export async function submitDraft(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Onaya Gönder' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Onaya Gönder' })
    .click();
  await expect(page.getByText('Masraf onaya gönderildi.')).toBeVisible();
}

/** The table row of an expense in an approval queue. */
export function queueRow(page: Page, title: string) {
  return page.locator('table tbody tr').filter({ hasText: title });
}

function expenseIdFromUrl(page: Page): string {
  const match = page.url().match(/\/expenses\/([0-9a-f-]{36})/);
  if (!match) throw new Error(`Not on an expense page: ${page.url()}`);
  return match[1];
}
