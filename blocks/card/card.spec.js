import { test, expect } from '@playwright/test';

test.describe('card', () => {
  test('renders image, heading, and CTA', async ({ page }) => {
    await page.goto('/tests/card-test.html');

    const card = page.locator('.card .card-inner');
    await expect(card).toBeVisible();

    await expect(card.locator('.card-image img')).toBeVisible();
    await expect(card.locator('.card-heading')).toHaveText(/.+/);

    const cta = card.locator('.card-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /.+/);
    await expect(cta.locator('.card-cta-arrow')).toBeVisible();
  });

  test('does not throw on empty block', async ({ page }) => {
    await page.goto('/tests/card-empty-test.html');
    await expect(page.locator('.card .card-inner')).toBeVisible();
  });
});
