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
    'playwitheliteitem.jpg',
    'ofertamatica.jpg',
    'redream.jpg',
    'baby-on-screen.jpg',
    'slimekeepers-forest.png',
    'slimekeepers-valley.png'
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
  await expect(page.locator('img[src$="slimekeepers-forest.png"]'))
    .toHaveAttribute('alt', /Captura real de gameplay/);
  await expect(page.locator('a[href="https://github.com/HelioConde/Slimekeepers-Lost-Valley"]')).toHaveCount(1);
  await expect(page.locator('.project-card[aria-labelledby="project-slime"] .preview-trigger')).toHaveCount(2);
  await expect(page.locator('a[href="https://helioconde.github.io/Re-Dream/"]')).toHaveCount(1);
  await expect(page.locator('a[href="https://helioconde.github.io/babyOnScreen/web/"]')).toHaveCount(1);
});


test('project screenshots are complete, captions do not obscure them and can be enlarged', async ({ page }) => {
  await page.goto('/');
  const thumbnails = page.locator('.preview-trigger');
  await expect(thumbnails).toHaveCount(7);
  const first = thumbnails.first();
  await expect(first).toHaveAttribute('href', /base-studio-pizzas\.jpg$/);

  const presentation = await first.evaluate((link) => {
    const img = link.querySelector('img');
    const caption = link.closest('.project-image').querySelector('.screen-note');
    return {
      fit: getComputedStyle(img).objectFit,
      captionPosition: getComputedStyle(caption).position,
      clickable: link.getAttribute('aria-label'),
    };
  });
  expect(presentation.fit).toBe('contain');
  expect(presentation.captionPosition).toBe('static');
  expect(presentation.clickable).toMatch(/ampliar/i);

  await first.click();
  const dialog = page.locator('#project-preview-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#preview-dialog-title')).toHaveText('Base Studio Pizzas');
  await expect(page.locator('#preview-dialog-image')).toHaveAttribute('src', /base-studio-pizzas\.jpg$/);
  await expect(page.locator('#preview-original')).toHaveAttribute('href', /base-studio-pizzas\.jpg$/);
  await expect(page.locator('#preview-counter')).toHaveText('1 de 7');
  const viewerGeometry = await page.locator('#preview-dialog-image').evaluate(img => {
    const stage = img.closest('.preview-stage').getBoundingClientRect();
    const image = img.getBoundingClientRect();
    const footer = img.closest('.preview-shell').querySelector('.preview-bottom').getBoundingClientRect();
    return {
      imageTop: image.top,
      imageBottom: image.bottom,
      stageTop: stage.top,
      stageBottom: stage.bottom,
      footerTop: footer.top,
    };
  });
  expect(viewerGeometry.imageTop).toBeGreaterThanOrEqual(viewerGeometry.stageTop - 1);
  expect(viewerGeometry.imageBottom).toBeLessThanOrEqual(viewerGeometry.stageBottom + 1);
  expect(viewerGeometry.stageBottom).toBeLessThanOrEqual(viewerGeometry.footerTop + 1);
  await page.getByRole('button', { name: 'Visualizar próximo projeto' }).click();
  await expect(page.locator('#preview-dialog-title')).toHaveText('PlayWithEliteItem');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#preview-dialog-title')).toHaveText('Base Studio Pizzas');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/preview-open/);
  await expect(first).toBeFocused();
});

test('filtered preview navigation only shows the chosen category', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Jogos', exact: true }).click();
  await page.locator('.project-card:not([hidden]) .preview-trigger').first().click();
  await expect(page.locator('#preview-counter')).toHaveText('1 de 3');
  await page.getByRole('button', { name: 'Visualizar próximo projeto' }).click();
  await expect(page.locator('#preview-dialog-image')).toHaveAttribute('src', /slimekeepers-valley.png$/);
  await expect(page.locator('#preview-counter')).toHaveText('2 de 3');
  await page.getByRole('button', { name: 'Visualizar próximo projeto' }).click();
  await expect(page.locator('#preview-dialog-title')).toHaveText('Re:Dream');
  await page.getByRole('button', { name: 'Fechar visualização' }).click();
  await expect(page.locator('#project-preview-dialog')).toBeHidden();
});


test('project gallery stays compact with three equal cards per desktop row', async ({ page }, testInfo) => {
  await page.goto('/');
  const cards = page.locator('.projects-grid .project-card');
  await expect(cards).toHaveCount(6);

  const actual = await cards.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    const img = node.querySelector('.preview-trigger');
    const preview = img?.getBoundingClientRect();
    return { top: Math.round(rect.top), left: Math.round(rect.left),
      width: Math.round(rect.width), height: Math.round(rect.height),
      imageHeight: preview ? Math.round(preview.height) : 0,
      columns: getComputedStyle(node).gridColumnStart,
      display: getComputedStyle(node).display };
  }));
  const viewport = testInfo.project.use.viewport.width;
  const expectedColumns = viewport > 1100 ? 3 : viewport > 760 ? 2 : 1;
  const expectedRows = 6 / expectedColumns;
  const rows = [...new Set(actual.map(card => card.top))];
  expect(rows).toHaveLength(expectedRows);
  expect(actual.every(card => card.width > 0 && card.imageHeight > 0)).toBe(true);
  expect(actual.every(card => card.imageHeight <= (viewport > 760 ? 212 : 242))).toBe(true);

  for (let row = 0; row < expectedRows; row++) {
    const group = actual.slice(row * expectedColumns, (row + 1) * expectedColumns);
    expect(new Set(group.map(card => card.top)).size).toBe(1);
    const minWidth = Math.min(...group.map(card => card.width));
    const maxWidth = Math.max(...group.map(card => card.width));
    expect(maxWidth - minWidth).toBeLessThanOrEqual(2);
    expect(group.every(card => card.display === 'flex')).toBe(true);
  }
  // Base Studio Pizzas and Baby On Screen no longer span extra columns.
  if (expectedColumns === 3) {
    expect(actual[0].top).toBe(actual[1].top);
    expect(actual[0].top).toBe(actual[2].top);
    expect(actual[3].top).toBe(actual[5].top);
  }
});


test('project filters stay on one line and preview captions remain compact', async ({ page }, testInfo) => {
  await page.goto('/');
  const chips = page.locator('.project-filters .filter-btn');
  await expect(chips).toHaveCount(5);
  if (testInfo.project.use.viewport.width <= 460) {
    const positions = await chips.evaluateAll(items => items.map(item => {
      const r = item.getBoundingClientRect();
      return { top: Math.round(r.top), right: Math.round(r.right) };
    }));
    expect(new Set(positions.map(item => item.top)).size).toBe(1);
    expect(Math.max(...positions.map(item => item.right)))
      .toBeLessThanOrEqual(testInfo.project.use.viewport.width - 5);
  }
  const captions = await page.locator('.project-image-caption').evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect();
    const note = el.querySelector('.screen-note')?.getBoundingClientRect();
    const action = el.querySelector('.preview-callout')?.getBoundingClientRect();
    return { height: Math.round(r.height), noteTop: Math.round(note?.top || 0),
      actionTop: Math.round(action?.top || 0) };
  }));
  expect(captions).toHaveLength(6);
  expect(captions.every(c => c.height <= 48 && Math.abs(c.noteTop - c.actionTop) <= 4)).toBe(true);

  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await expect(page.locator('#project-count')).toHaveText('1 projeto');
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Baby On Screen' })).toBeVisible();
});


test('project categories are shareable and keyboard navigable on Pages', async ({ page }) => {
  await page.goto('/?categoria=games');
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Jogos', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Jogos', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Modding', exact: true })).toBeFocused();
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/categoria=mods/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Modding', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(6);
  await expect(page).not.toHaveURL(/categoria=/);
});

test('invalid shared category degrades gracefully to all projects', async ({ page }) => {
  await page.goto('/?categoria=anything');
  await expect(page.locator('.project-card[data-category]:visible')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Todos', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
