import { test, expect } from '@playwright/test';

test.describe('image-teaser', () => {
  test('renders the block container', async ({ page }) => {
    await page.goto('/tests/image-teaser-test.html');
    await expect(page.locator('.image-teaser')).toBeVisible();
  });
});
