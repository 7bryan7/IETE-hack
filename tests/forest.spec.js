import { test, expect } from '@playwright/test';

async function begin(page, level = 1) {
  await page.getByRole('button', { name: 'Mouse & keyboard' }).click();
  await page.getByRole('button', { name: `Start level ${level}`, exact: true }).click();
}
async function look(page, direction, ms) {
  await page.locator('.forest-world').focus();
  await page.keyboard.down(direction);
  await page.waitForTimeout(ms);
  await page.keyboard.up(direction);
  await page.waitForTimeout(650);
}
async function itemPoint(page, item) {
  const label = page.locator(`[data-forest-item="${item}"]`);
  await expect(label).toBeVisible();
  return label.evaluate(el => {
    const rect = el.closest('.forest-world').getBoundingClientRect();
    return { x: rect.left + parseFloat(el.style.left) / 100 * rect.width, y: rect.top + parseFloat(el.style.top) / 100 * rect.height };
  });
}
async function place(page, id) {
  const object = await itemPoint(page, `objects-${id}`), target = await itemPoint(page, `targets-${id}`);
  await page.mouse.move(object.x, object.y); await page.waitForTimeout(200); await page.mouse.down();
  await expect(page.getByRole('status').filter({ hasText: 'Object held' })).toBeVisible();
  await page.mouse.move(target.x, target.y, { steps: 25 }); await page.waitForTimeout(300); await page.mouse.up();
}

test('complete all four forest levels with real mouse/keyboard events and resume progress', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#worlds');
  await expect(page.getByRole('button', { name: 'Coming soon' })).toBeDisabled();
  await page.screenshot({ path: 'test-results/world-menu.png' });
  await page.getByRole('button', { name: 'Enter the forest' }).click();
  await begin(page);
  await page.screenshot({ path: 'test-results/forest-level-1.png' });
  await look(page, 'ArrowLeft', 1200);
  await look(page, 'ArrowRight', 1200);
  await look(page, 'ArrowRight', 1200);
  await expect(page.getByRole('button', { name: 'Next level', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next level', exact: true }).click(); await begin(page, 2);
  const crystal = await itemPoint(page, 'objects-crystal');
  await page.mouse.move(crystal.x, crystal.y);
  await expect(page.getByRole('heading', { name: 'Crystal found!' })).toBeVisible();
  await page.getByRole('button', { name: 'Next level', exact: true }).click(); await begin(page, 3);
  await expect(page.locator('[data-forest-item="objects-crystal"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/forest-level-3.png' });
  await place(page, 'crystal');
  await expect(page.getByRole('heading', { name: 'Beautifully placed!' })).toBeVisible();
  await page.getByRole('button', { name: 'Next level', exact: true }).click(); await begin(page, 4);
  await page.locator('.forest-world').focus(); await page.keyboard.down('ArrowRight');
  await expect(page.locator('.forest-mission p')).toHaveText('Find and point at the magical leaf', { timeout: 8000 });
  await page.keyboard.up('ArrowRight'); await page.waitForTimeout(300);
  const leaf = await itemPoint(page, 'objects-leaf'); await page.mouse.move(leaf.x, leaf.y);
  await expect(page.locator('.forest-mission p')).toHaveText('Click and hold the magical leaf');
  await place(page, 'leaf');
  await expect(page.getByRole('heading', { name: 'Forest completed!' })).toBeVisible();
  await page.screenshot({ path: 'test-results/forest-completed.png' });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('motionforge_forest_v1'))?.completed)).toBe(4);
  await page.getByRole('button', { name: 'Explore again', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start level 1', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to worlds', exact: true }).click();
  await page.getByRole('button', { name: 'Classic missions' }).click();
  await expect(page.getByRole('heading', { name: 'Choose Your Mission' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('refresh resumes completed levels; pause and restart remain usable', async ({ page }) => {
  await page.goto('/#worlds');
  await page.evaluate(() => localStorage.setItem('motionforge_forest_v1', '{"completed":2}'));
  await page.goto('/#forest'); await page.reload();
  await page.getByRole('button', { name: 'Continue at level 3' }).click(); await begin(page, 3);
  await page.getByRole('button', { name: 'Pause forest', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your forest is waiting' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue exploring' }).click();
  await page.getByRole('button', { name: 'Restart this level' }).click();
  await expect(page.getByRole('button', { name: 'Start level 3', exact: true })).toBeVisible();
});

test('denied camera and unavailable model allow recovery to mouse controls', async ({ page, context }) => {
  await context.grantPermissions([]);
  await page.route('**/hand_landmarker.task', route => route.abort());
  await page.goto('/#forest');
  await page.getByRole('button', { name: 'Play with hands' }).click();
  await page.getByRole('button', { name: 'Start level 1', exact: true }).click();
  await expect(page.locator('.forest-tracking-help')).toContainText('Failed to load');
  await page.locator('.forest-tracking-help').getByRole('button', { name: 'Use mouse' }).click();
  await expect(page.locator('.forest-camera')).toHaveCount(0);
  await look(page, 'ArrowLeft', 700);
  await expect(page.locator('.forest-navigation')).toContainText('Arrow keys');
});

test('world menu and forest intro fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/#worlds');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Enter the forest' }).click();
  await page.getByRole('button', { name: 'Mouse & keyboard' }).click();
  await expect(page.getByRole('button', { name: 'Start level 1', exact: true })).toBeInViewport();
  await page.screenshot({ path: 'test-results/forest-mobile.png' });
});
