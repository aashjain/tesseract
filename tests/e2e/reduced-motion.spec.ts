import { expect, test } from '@playwright/test';

/**
 * Tier D. `prefers-reduced-motion` must remove the scroll-scrubbed camera and
 * pointer parallax entirely — not slow them down — while preserving the same
 * copy order, capability links, project links and call to action.
 */
test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('drops the renderer and keeps the whole story', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    await expect(page.locator('main.story')).toHaveAttribute('data-mode', 'reduced');
    await expect(page.locator('.canvas-host')).toHaveCount(0);

    await expect(page.locator('section.scene')).toHaveCount(12);
    await expect(page.getByRole('heading', { name: 'Present everywhere.' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Build a world only your brand can own.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start a project' }).first()).toBeVisible();
  });

  test('shows every scene copy block without waiting for a scroll trigger', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const inactive = await page.locator('section.scene:not(.is-active)').count();
    expect(inactive).toBe(0);
  });

  test('offers no sound control', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(600);
    await expect(page.getByRole('button', { name: /Sound/ })).toHaveCount(0);
  });
});
