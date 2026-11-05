import { expect, test } from '@playwright/test';
import {
  createDraft,
  login,
  openSessionAs,
  submitDraft,
  uniqueTitle,
} from './helpers';

test.describe('access', () => {
  test('visitors without a session are sent to the login page', async ({
    page,
  }) => {
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('a wrong password shows a readable error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Kullanıcı adı veya e-posta').fill('ayse');
    await page.getByLabel('Şifre').fill('yanlis-sifre');
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    await expect(
      page.getByText('Kullanıcı adı veya şifre hatalı.'),
    ).toBeVisible();
  });

  test('each role lands on its own page and cannot open the others', async ({
    page,
  }) => {
    await login(page, 'ahmet');
    await expect(page).toHaveURL(/\/approvals\/manager$/);

    await page.goto('/approvals/accounting');
    await expect(page).toHaveURL(/\/approvals\/manager$/);
    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/approvals\/manager$/);
  });

  test("an employee cannot open another employee's expense", async ({
    browser,
  }) => {
    const veli = await openSessionAs(browser, 'veli');
    const id = await createDraft(veli, {
      title: uniqueTitle('Otopark'),
      category: 'Diğer',
      amount: '60',
    });
    await submitDraft(veli);

    const ali = await openSessionAs(browser, 'ali');
    await ali.goto(`/expenses/${id}`);
    await expect(ali.getByText('Masraf bulunamadı')).toBeVisible();
  });

  test('logging out returns to the login page', async ({ page }) => {
    await login(page, 'ali');
    await page.getByRole('button', { name: 'Çıkış' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/expenses');
    await expect(page).toHaveURL(/\/login$/);
  });
});
