import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test('schedule view supports filtering and reset', async ({ page }) => {
  await page.goto('/asw');
  await page.getByTestId('nav-schedule').click();

  const scheduleHeading = page.getByRole('heading', { name: /player schedule/i });
  await expect(scheduleHeading).toBeVisible();

  const searchInput = page.getByTestId('schedule-search-input');
  await expect(searchInput).toBeVisible();

  await searchInput.fill('zzzz-no-match');
  await expect(page.getByText(/no schedule rows match your current filters/i)).toBeVisible();

  await page.getByRole('button', { name: /reset filters/i }).click();
  await expect(page.getByText(/no schedule rows match your current filters/i)).toBeHidden();
});

test('day accordions can be toggled from keyboard', async ({ page }) => {
  await page.goto('/asw');
  await page.getByTestId('nav-schedule').click();

  const dayOneButton = page.getByRole('button', { name: /day 1/i }).first();
  await dayOneButton.focus();
  await page.keyboard.press('Enter');
  await expect(dayOneButton).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Enter');
  await expect(dayOneButton).toHaveAttribute('aria-expanded', 'true');
});
