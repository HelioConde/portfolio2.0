const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const REPORT_ROOT = path.join(process.cwd(), 'visual-reports');
const TARGETS = [
  ['pagina-inteira', 'body'],
  ['primeira-dobra', 'html'],
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
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    if (request.url().startsWith('http')) {
      failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' });
    }
  });
  await page.goto(process.env.SCREENSHOT_URL || '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Screenshots must include images initially below the fold.
    // Eager loading avoids waiting forever for offscreen lazy-loaded images.
    await Promise.all(Array.from(document.images, async (img) => {
      img.loading = 'eager';
      try {
        await img.decode();
      } catch (_) {
        // Broken files will be reported in the metrics below.
      }
    }));
  });

  const viewport = testInfo.project.name;
  const folder = path.join(REPORT_ROOT, 'capturas', viewport);
  fs.mkdirSync(folder, { recursive: true });

  for (const [name, selector] of TARGETS) {
    const file = path.join(folder, name + '.png');
    if (name === 'pagina-inteira') {
      await page.screenshot({ path: file, fullPage: true, animations: 'disabled', timeout: 20000 });
    } else if (name === 'primeira-dobra') {
      await page.evaluate(async () => {
        window.scrollTo(0, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.screenshot({ path: file, animations: 'disabled', timeout: 20000 });
    } else {
      await page.locator(selector).first().screenshot({
        path: file, animations: 'disabled', timeout: 20000,
        // A section screenshot is taller than one viewport. Do not render the
        // sticky navigation or skip-link across its middle.
        style: '.site-header, .skip-link { visibility: hidden !important; }',
      });
    }
  }

  // Preview should be readable and should not inherit the thumbnail crop.
  await page.locator('.preview-trigger').first().click();
  await page.locator('#preview-dialog-image').evaluate(async img => {
    await img.decode();
  });
  await page.screenshot({
    path: path.join(folder, 'preview-modal.png'),
    animations: 'disabled',
    timeout: 20000,
  });
  await page.getByRole('button', { name: 'Fechar visualização' }).click();

  await page.getByRole('button', { name: 'Jogos', exact: true }).click();
  await page.locator('#projetos').screenshot({
    path: path.join(folder, 'filtro-jogos.png'),
    animations: 'disabled',
    style: '.site-header, .skip-link { visibility: hidden !important; }',
  });
  await page.getByRole('button', { name: 'Todos', exact: true }).click();

  if (testInfo.project.use.viewport.width <= 760) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
    const clippedText = Array.from(document.querySelectorAll(
      'h1, h2, h3, p, .btn, .project-tag, .site-nav a'
    )).filter(el => {
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length &&
        (el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3);
    }).map(el => ({
      node: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().slice(0, 80),
      css: String(el.className || '').slice(0, 80),
      client: [el.clientWidth, el.clientHeight],
      scroll: [el.scrollWidth, el.scrollHeight],
    }));
    const brokenImages = Array.from(document.images)
      .filter(img => img.hasAttribute('src'))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.getAttribute('src'));
    return {
      viewportWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      outOfViewport,
      clippedText,
      brokenImages,
      primaryHeadingCount: document.querySelectorAll('h1').length,
      projectCount: document.querySelectorAll('.project-card[data-category]').length,
    };
  });
  metrics.project = viewport;
  metrics.source = process.env.SCREENSHOT_URL || 'http://127.0.0.1:4173/';
  metrics.pageErrors = pageErrors;
  metrics.consoleErrors = consoleErrors;
  metrics.failedRequests = failedRequests;

  const metricsPath = path.join(REPORT_ROOT, 'dados');
  fs.mkdirSync(metricsPath, { recursive: true });
  fs.writeFileSync(path.join(metricsPath, viewport + '.json'), JSON.stringify(metrics, null, 2));

  expect(metrics.horizontalOverflow, 'Pagina nao deve ter rolagem horizontal').toBe(false);
  expect(metrics.outOfViewport, 'Elementos importantes devem caber na viewport').toEqual([]);
  expect(metrics.clippedText, 'Textos nao devem estar cortados').toEqual([]);
  expect(metrics.brokenImages, 'Todas as imagens devem carregar').toEqual([]);
  expect(metrics.pageErrors, 'Nao deve haver erros de JavaScript').toEqual([]);
  expect(metrics.consoleErrors, 'Nao deve haver erros no console').toEqual([]);
});
