const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const REPORT_ROOT = path.join(process.cwd(), 'visual-reports');
const TARGETS = [
  ['pagina-inteira', 'body'],
  ['inicio', '#home'],
  ['projetos', '#projetos'],
  ['destaque', '.project-card.featured'],
  ['contato', '#contato'],
];

test('capturar layout, estados e diagnostico visual', async ({ page }, testInfo) => {
  test.setTimeout(90000);

  // Capture stable frames, independent of animations or scroll position.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(process.env.SCREENSHOT_URL || '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  });

  const viewport = testInfo.project.name;
  const folder = path.join(REPORT_ROOT, 'capturas', viewport);
  fs.mkdirSync(folder, { recursive: true });

  for (const [name, selector] of TARGETS) {
    const file = path.join(folder, name + '.png');
    if (name === 'pagina-inteira') {
      await page.screenshot({ path: file, fullPage: true, animations: 'disabled', timeout: 20000 });
    } else {
      await page.locator(selector).first().screenshot({ path: file, animations: 'disabled', timeout: 20000 });
    }
  }

  await page.getByRole('button', { name: 'Jogos', exact: true }).click();
  await page.locator('#projetos').screenshot({
    path: path.join(folder, 'filtro-jogos.png'),
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Todos', exact: true }).click();

  if (testInfo.project.use.viewport.width <= 760) {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.screenshot({
      path: path.join(folder, 'menu-mobile.png'),
      clip: { x: 0, y: 0, width: testInfo.project.use.viewport.width, height: 420 },
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
  }

  const metrics = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const visibleElements = Array.from(document.querySelectorAll(
      'header .container, main .container, main h1, main h2, main h3, main article, main img, main a, main button, footer .container'
    )).filter(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' &&
        rect.width > 0 && rect.height > 0;
    });
    const outOfViewport = visibleElements.filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < -2 || r.right > viewportWidth + 2;
    }).map(el => ({
      node: el.tagName.toLowerCase(),
      className: String(el.className).slice(0, 100),
      left: Math.round(el.getBoundingClientRect().left),
      right: Math.round(el.getBoundingClientRect().right),
    }));
    const brokenImages = Array.from(document.images)
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.getAttribute('src'));
    return {
      viewportWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      outOfViewport,
      brokenImages,
      primaryHeadingCount: document.querySelectorAll('h1').length,
      projectCount: document.querySelectorAll('.project-card[data-category]').length,
    };
  });
  metrics.project = viewport;
  metrics.source = process.env.SCREENSHOT_URL || 'http://127.0.0.1:4173/';
  metrics.pageErrors = pageErrors;

  const metricsPath = path.join(REPORT_ROOT, 'dados');
  fs.mkdirSync(metricsPath, { recursive: true });
  fs.writeFileSync(path.join(metricsPath, viewport + '.json'), JSON.stringify(metrics, null, 2));

  expect(metrics.horizontalOverflow, 'Pagina nao deve ter rolagem horizontal').toBe(false);
  expect(metrics.outOfViewport, 'Elementos importantes devem caber na viewport').toEqual([]);
  expect(metrics.brokenImages, 'Todas as imagens devem carregar').toEqual([]);
  expect(metrics.pageErrors, 'Nao deve haver erros de JavaScript').toEqual([]);
});
