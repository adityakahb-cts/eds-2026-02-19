import { test, expect } from '@playwright/test';

test.describe('tabs block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/tabs-test.html');
    await page.waitForSelector('.tabs[data-block-status="loaded"]');
  });

  test('renders tablist and correct number of tabs', async ({ page }) => {
    const tabs = page.locator('.tabs [role="tab"]');
    await expect(tabs).toHaveCount(3);
  });

  test('first tab is selected by default', async ({ page }) => {
    const first = page.locator('.tabs [role="tab"]').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');
  });

  test('first panel is visible; others are hidden', async ({ page }) => {
    const panels = page.locator('.tabs [role="tabpanel"]');
    await expect(panels.first()).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();
  });

  test('clicking a tab activates it and shows its panel', async ({ page }) => {
    const secondTab = page.locator('.tabs [role="tab"]').nth(1);
    await secondTab.click();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    const secondPanel = page.locator('.tabs [role="tabpanel"]').nth(1);
    await expect(secondPanel).toBeVisible();
  });

  test('arrow key navigation moves focus and activates tabs', async ({ page }) => {
    const firstTab = page.locator('.tabs [role="tab"]').first();
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    const secondTab = page.locator('.tabs [role="tab"]').nth(1);
    await expect(secondTab).toBeFocused();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });
});
