import { expect, test } from '@playwright/test';
import {
  createDraft,
  openSessionAs,
  queueRow,
  submitDraft,
  uniqueTitle,
} from './helpers';

/** The end-to-end scenario from section 6 of the case document, in a real browser. */
test('case scenario: submit, review by manager and accounting, see the outcome', async ({
  browser,
}) => {
  const taxi = uniqueTitle('Müşteri ziyareti taksi');
  const meal = uniqueTitle('Ekip yemeği');

  await test.step('1. Ali creates a 750 TL transport expense and submits it', async () => {
    const ali = await openSessionAs(browser, 'ali');
    await createDraft(ali, { title: taxi, category: 'Ulaşım', amount: '750' });
    await submitDraft(ali);
    await expect(
      ali.getByText('Yönetici Onayı Bekliyor').first(),
    ).toBeVisible();
  });

  await test.step('2. Veli creates a 420 TL meal expense and submits it', async () => {
    const veli = await openSessionAs(browser, 'veli');
    await createDraft(veli, { title: meal, category: 'Yemek', amount: '420' });
    await submitDraft(veli);
  });

  await test.step("3. Ahmet approves Ali's expense and rejects Veli's with 'Eksik bilgi'", async () => {
    const ahmet = await openSessionAs(browser, 'ahmet');
    await expect(queueRow(ahmet, taxi)).toBeVisible();
    await expect(queueRow(ahmet, meal)).toBeVisible();

    await queueRow(ahmet, taxi).getByRole('button', { name: 'Onayla' }).click();
    await expect(ahmet.getByText('Masraf onaylandı.')).toBeVisible();

    await queueRow(ahmet, meal).getByRole('button', { name: 'Reddet' }).click();
    const dialog = ahmet.getByRole('dialog', { name: 'Masrafı reddet' });
    await dialog.getByRole('button', { name: 'Reddet' }).click();
    await expect(dialog.getByText('Red gerekçesi zorunludur.')).toBeVisible();

    await dialog.getByLabel('Red gerekçesi').fill('Eksik bilgi');
    await dialog.getByRole('button', { name: 'Reddet' }).click();
    await expect(ahmet.getByText('Masraf reddedildi.')).toBeVisible();
    await expect(queueRow(ahmet, taxi)).toHaveCount(0);
    await expect(queueRow(ahmet, meal)).toHaveCount(0);
  });

  await test.step("4. Ayşe sees only Ali's manager-approved expense and approves it", async () => {
    const ayse = await openSessionAs(browser, 'ayse');
    await expect(queueRow(ayse, taxi)).toBeVisible();
    await expect(queueRow(ayse, meal)).toHaveCount(0);

    await queueRow(ayse, taxi).getByRole('button', { name: 'Onayla' }).click();
    await expect(ayse.getByText('Masraf onaylandı.')).toBeVisible();
  });

  await test.step('5. Ali sees "Onaylandı"; Veli sees "Reddedildi" with the reason', async () => {
    const ali = await openSessionAs(browser, 'ali');
    await ali.getByRole('link', { name: taxi }).first().click();
    await expect(ali.getByText('Muhasebe tarafından onaylandı')).toBeVisible();

    const veli = await openSessionAs(browser, 'veli');
    await veli.getByRole('link', { name: meal }).first().click();
    await expect(veli.getByText('Reddedildi — Ahmet Yönetici')).toBeVisible();
    await expect(
      veli.getByRole('alert').filter({ hasText: 'Eksik bilgi' }),
    ).toBeVisible();
  });
});
