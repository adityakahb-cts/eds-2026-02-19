import { test, expect } from '@playwright/test';

test.describe('header block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/header-test.html');
    // Wait for the nav to be fully decorated before each assertion.
    await page.waitForSelector('header nav#nav');
  });

  test('renders nav-wrapper containing nav#nav', async ({ page }) => {
    await expect(page.locator('header .nav-wrapper')).toBeVisible();
    await expect(page.locator('header nav#nav')).toBeVisible();
  });

  test('nav starts collapsed (aria-expanded="false")', async ({ page }) => {
    await expect(page.locator('header nav#nav')).toHaveAttribute('aria-expanded', 'false');
  });

  test('hamburger button is present and has an accessible aria-label', async ({ page }) => {
    const btn = page.locator('header .nav-hamburger button');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', /.+/);
  });

  test('nav-brand section is rendered', async ({ page }) => {
    await expect(page.locator('header .nav-brand')).toBeVisible();
  });

  test('nav-sections section is rendered', async ({ page }) => {
    await expect(page.locator('header .nav-sections')).toBeVisible();
  });

  test('nav-tools section is rendered', async ({ page }) => {
    await expect(page.locator('header .nav-tools')).toBeVisible();
  });

  test('clicking hamburger toggles aria-expanded on nav', async ({ page }) => {
    // Force mobile viewport so the hamburger is active.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tests/header-test.html');
    await page.waitForSelector('header nav#nav');

    const nav = page.locator('header nav#nav');
    const btn = page.locator('header .nav-hamburger button');

    await expect(nav).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(nav).toHaveAttribute('aria-expanded', 'true');
    await btn.click();
    await expect(nav).toHaveAttribute('aria-expanded', 'false');
  });
});
