const { test, expect } = require('@playwright/test');

test('homepage presents projects and a single primary heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hélio Conde/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.project-card[data-category]')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: 'Slimekeepers: Lost Valley' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Base Studio Pizzas' })).toBeVisible();
  await expect(page.locator('#project-slime').locator('..').locator('.project-tag')).toContainText('Em desenvolvimento');
  const order = await page.locator('main > section[id]').evaluateAll((els) => els.map((el) => el.id));
  expect(order.slice(0, 2)).toEqual(['home', 'projetos']);
});

test('project filters work for games and can reset without hiding unfinished status', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Jogos', exact: true }).click();
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Jogos', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#project-count')).toHaveText('2 projetos');
  await expect(page.getByRole('heading', { name: 'Slimekeepers: Lost Valley' })).toBeVisible();
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(6);
});

test('menu remains keyboard accessible and closes on Escape on mobile', async ({ page }, testInfo) => {
  await page.goto('/');
  const mobile = testInfo.project.use.viewport.width <= 760;
  if (mobile) {
    const toggle = page.getByRole('button', { name: 'Abrir menu' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#site-menu')).toBeHidden();
  } else {
    await expect(page.locator('#site-menu')).toBeVisible();
  }
});

test('anchor navigation, external links and metadata are valid', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#conteudo');
  const invalid = await page.locator('a[href]').evaluateAll((links) => links.filter((a) => {
    const value = a.getAttribute('href');
    if (!value || value === '#') return true;
    if (value.startsWith('#') && !document.getElementById(value.slice(1))) return true;
    if (a.target === '_blank' && !(a.rel.includes('noopener') && a.rel.includes('noreferrer'))) return true;
    return false;
  }).map((a) => a.outerHTML));
  expect(invalid).toEqual([]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://helioconde.github.io/portfolio2.0/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:/);
});

test('page has no horizontal overflow or uncaught JavaScript errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(errors).toEqual([]);
});

test('reduced-motion users see content without reveal animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const opacity = await page.locator('.reveal').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');
});


test('published project screenshots are real assets and load correctly', async ({ page }) => {
  await page.goto('/');
  const assets = [
    'base-studio-pizzas.jpg',
    'ofertamatica.jpg',
    'redream.jpg',
    'baby-on-screen.jpg',
    'slimekeepers-menu.png'
  ];
  for (const asset of assets) {
    const img = page.locator('img[src$="' + asset + '"]');
    await expect(img, 'Expected asset ' + asset).toHaveCount(1);
    const width = await img.evaluate(async element => {
      element.loading = 'eager';
      try { await element.decode(); } catch (_) {}
      return element.naturalWidth;
    });
    expect(width, 'Broken asset: ' + asset).toBeGreaterThan(200);
  }
  await expect(page.locator('#project-slime').locator('..').locator('.project-tag'))
    .toContainText('Em desenvolvimento');
  await expect(page.locator('img[src$="slimekeepers-menu.png"]'))
    .toHaveAttribute('alt', /não é uma captura de gameplay/);
  await expect(page.locator('a[href="https://helioconde.github.io/Re-Dream/"]')).toHaveCount(1);
  await expect(page.locator('a[href="https://helioconde.github.io/babyOnScreen/web/"]')).toHaveCount(1);
});
