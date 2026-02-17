import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('loads Now view and supports main nav switching', async ({ page }) => {
  await page.goto('/asw');

  await expect(page.getByRole('heading', { name: /panini nba asw/i })).toBeVisible();
  await expect(page.getByText(/pt \(los angeles\)/i).first()).toBeVisible();

  await page.getByTestId('nav-schedule').click();
  await expect(page.getByRole('heading', { name: /player schedule/i })).toBeVisible();

  await page.getByTestId('nav-now').click();
  await expect(page.getByTestId('nav-now')).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText(/pt \(los angeles\)/i).first()).toBeVisible();
});
