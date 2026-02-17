import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('mobile nav reaches schedule and admin tools', async ({ page }) => {
  await page.goto('/asw');

  await page.getByTestId('nav-schedule').click();
  await expect(page.getByRole('heading', { name: /player schedule/i })).toBeVisible();

  await page.getByTestId('nav-more').click();
  await expect(page.getByRole('dialog', { name: /more tools menu/i })).toBeVisible();

  await page.getByRole('link', { name: /schedule admin/i }).click();
  await expect(page.getByRole('heading', { name: /schedule admin/i })).toBeVisible();
});
