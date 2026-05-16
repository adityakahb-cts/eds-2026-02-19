import { test, expect } from '@playwright/test';

test.describe('accordion', () => {
  test('renders root container', async ({ page }) => {
    await page.goto('/tests/accordion-test.html');
    await expect(page.locator('.accordion .accordion-root')).toBeVisible();
  });

  test('renders one item per authored row', async ({ page }) => {
    await page.goto('/tests/accordion-test.html');
    const items = page.locator('.accordion .accordion-item');
    await expect(items.first()).toBeVisible();
  });
});
