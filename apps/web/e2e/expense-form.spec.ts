import { expect, test } from '@playwright/test';
import { createDraft, login, uniqueTitle } from './helpers';

test.describe('expense form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'veli');
  });

  test('shows API validation messages under the matching fields and keeps the input', async ({
    page,
  }) => {
    await page.goto('/expenses/new');
    // Skip the browser's own checks so the API's messages are exercised.
    await page.locator('main form').evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
    });
    await page.getByLabel('Başlık').fill('   ');
    await page.getByLabel('Masraf tarihi').fill('2999-01-01');
    await page.getByLabel('Tutar').fill('0');
    await page.getByRole('button', { name: 'Taslak Olarak Kaydet' }).click();

    await expect(page.getByText('Başlık zorunludur.')).toBeVisible();
    await expect(
      page.getByText('Masraf tarihi gelecekte olamaz.'),
    ).toBeVisible();
    await expect(
      page.getByText('Kategori ulaşım, yemek, konaklama veya diğer olmalıdır.'),
    ).toBeVisible();
    await expect(
      page.getByText('Tutar sıfırdan büyük olmalıdır.'),
    ).toBeVisible();
    await expect(page.getByLabel('Tutar')).toHaveValue('0');
    await expect(page.getByLabel('Tutar')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('a draft can be edited until it is submitted', async ({ page }) => {
    const title = uniqueTitle('Kırtasiye');
    await createDraft(page, { title, category: 'Diğer', amount: '60' });

    await page.getByRole('link', { name: 'Düzenle' }).click();
    await expect(page.getByLabel('Başlık')).toHaveValue(title);
    await page.getByLabel('Tutar').fill('85.5');
    await page.getByRole('button', { name: 'Değişiklikleri Kaydet' }).click();

    await expect(page.getByText('Taslak güncellendi.')).toBeVisible();
    await expect(page.locator('dd').getByText('85,50 ₺')).toBeVisible();
    await expect(
      page.getByText('Taslak güncellendi', { exact: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Onaya Gönder' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Onaya Gönder' })
      .click();
    await expect(page.getByText('Masraf onaya gönderildi.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Düzenle' })).toHaveCount(0);
  });

  test('works on a phone-sized screen without horizontal scrolling', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/expenses');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBe(0);
  });
});
