import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * These are the acceptance checks the brief calls out: the story must work
 * without WebGL, navigation must be reachable from the first viewport, the
 * visitor must never be trapped, and every route must be usable by keyboard.
 */

const ROUTES = ['/', '/work', '/services', '/about', '/contact', '/privacy'];

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  // Give capability detection and the first frame a moment.
  await page.waitForTimeout(1200);
}

test.describe('routes', () => {
  for (const route of ROUTES) {
    test(`${route} renders with a single main heading`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await settle(page);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main')).toBeVisible();
    });
  }

  test('unknown routes get the custom 404', async ({ page }) => {
    const response = await page.goto('/this-page-never-found-its-orbit');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This signal left the system.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
  });
});

test.describe('the immersive homepage', () => {
  test('exposes navigation, the primary action and an escape route immediately', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    // Everything below must be reachable without scrolling.
    await expect(page.getByRole('link', { name: 'AG Designs, home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start a project' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore normally' })).toBeVisible();
  });

  test('keeps native scrolling and a real scrollbar', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const before = await page.evaluate(() => window.scrollY);
    // `scrollBy` rather than a wheel event: mobile WebKit ignores synthetic
    // wheels, and the point of the assertion is that the document scrolls
    // natively, not how the input was delivered.
    await page.evaluate(() => window.scrollBy(0, 1400));
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBeGreaterThan(before);

    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflowY);
    expect(overflow).not.toBe('hidden');
  });

  test('carries all twelve scenes as semantic sections in order', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const sections = page.locator('section.scene');
    await expect(sections).toHaveCount(12);

    const orders = await sections.evaluateAll((nodes) =>
      nodes.map((node) => Number((node as HTMLElement).dataset.order)),
    );
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // Every scene headline is real DOM text, present regardless of the renderer.
    await expect(page.getByRole('heading', { name: 'Present everywhere.' })).toBeAttached();
    await expect(page.getByRole('heading', { name: 'One connected system.' })).toBeAttached();
    await expect(
      page.getByRole('heading', { name: 'Build a world only your brand can own.' }),
    ).toBeAttached();
  });

  test('links every capability without seven service cards', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    for (const slug of [
      'brand-strategy',
      'social-media',
      'branding-identity',
      'content-production',
      'photography-video',
      'digital-experience',
      'campaigns',
    ]) {
      await expect(page.locator(`a[href="/services#${slug}"]`).first()).toBeAttached();
    }
  });

  test('a scene hash scrolls to that scene and stays linkable', async ({ page }) => {
    await page.goto('/#production');
    await settle(page);
    const y = await page.evaluate(() => window.scrollY);
    expect(y).toBeGreaterThan(500);
    expect(page.url()).toContain('#production');
  });

  test('`Explore normally` switches to the semantic presentation and is reversible', async ({
    page,
  }) => {
    await page.goto('/');
    await settle(page);

    await page.getByRole('button', { name: 'Explore normally' }).click();
    await expect(page.locator('main.story')).toHaveAttribute('data-mode', 'fallback');
    await expect(page.locator('.canvas-host')).toHaveCount(0);

    // The same copy is still there.
    await expect(page.getByRole('heading', { name: 'Proof, not promises.' })).toBeVisible();

    await page.getByRole('button', { name: 'Return to the journey' }).click();
    await settle(page);
    await expect(page.locator('main.story')).not.toHaveAttribute('data-mode', 'fallback');
  });
});

test.describe('project portals', () => {
  test('open to a linkable URL and close with the back button', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    await page.locator('button.scene__proof').first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(page.url()).toContain('project=');

    await page.goBack();
    await expect(dialog).toHaveCount(0);
  });

  test('close on Escape', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.locator('button.scene__proof').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('a direct `?project=` link opens the portal without trapping the visitor', async ({
    page,
  }) => {
    await page.goto('/?project=fixture-northline-labs');
    await settle(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('lead to a full case study with challenge, idea, work and outcome', async ({ page }) => {
    await page.goto('/work/fixture-meridian-hospitality');
    await settle(page);
    for (const heading of ['The challenge', 'The strategic idea', 'What we created', 'The outcome']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
    // Fixture records must announce themselves.
    await expect(page.getByText('Sample content', { exact: false })).toBeVisible();
  });
});

test.describe('contact', () => {
  test('reports validation errors against their own fields', async ({ page }) => {
    await page.goto('/contact');
    await settle(page);

    await page.getByRole('button', { name: 'Send enquiry' }).click();
    // Scoped to the form: Next renders its own route announcer with role=alert.
    await expect(page.locator('form').getByRole('alert')).toBeVisible();

    const name = page.getByLabel('Your name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await name.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test('accepts a complete enquiry', async ({ page }) => {
    await page.goto('/contact');
    await settle(page);

    await page.getByLabel('Your name').fill('Priya Sharma');
    await page.getByLabel('Email').fill('priya@example.com');
    await page.getByLabel('Company or brand').fill('Example Co');
    await page.getByLabel('What do you need?').selectOption('Brand strategy and positioning');
    await page.getByLabel('Approximate timing').selectOption('Within a month');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Send enquiry' }).click();

    await expect(page.getByText('Signal received. We will be in touch.')).toBeVisible();
  });
});

test.describe('keyboard', () => {
  test('the skip link is the first stop and moves focus to main content', async ({
    page,
    browserName,
  }) => {
    // WebKit only tabs to links when the OS "Tab highlights each item"
    // preference is on, which Playwright cannot set. Verified manually there.
    test.skip(browserName === 'webkit', 'WebKit tab order depends on an OS preference');
    await page.goto('/');
    await settle(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });

  test('every scene proof control is reachable and has a visible name', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const proofs = page.locator('button.scene__proof');
    const count = await proofs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(proofs.nth(i)).toHaveText(/View the proof/);
    }
  });
});

test.describe('accessibility', () => {
  for (const route of ROUTES) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(
        blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
      ).toEqual([]);
    });
  }
});

test.describe('resilience', () => {
  test('falls back to the semantic story when WebGL is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      // Remove the capability entirely, the way a locked-down browser would.
      Reflect.deleteProperty(window, 'WebGLRenderingContext');
      Reflect.deleteProperty(window, 'WebGL2RenderingContext');
    });
    await page.goto('/');
    await settle(page);

    // Either non-rendering tier is a correct answer here: a visitor who also
    // prefers reduced motion is resolved to `reduced` before WebGL is even
    // considered. What matters is that no canvas is mounted and the story is
    // complete.
    const mode = await page.locator('main.story').getAttribute('data-mode');
    expect(['fallback', 'reduced']).toContain(mode);
    await expect(page.locator('.canvas-host')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Present everywhere.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start a project' }).first()).toBeVisible();
  });

  test('is usable at 320 CSS pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await settle(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('stays sound-off until the visitor asks for sound', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    // The control only appears after a gesture, and never starts enabled.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(400);
    const toggle = page.getByRole('button', { name: /Sound/ });
    if (await toggle.count()) {
      await expect(toggle.first()).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
