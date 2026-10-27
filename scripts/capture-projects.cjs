/** Capture actual public project pages; never synthesize gameplay. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'img', 'projects');
const REPORT = path.join(ROOT, 'visual-reports', 'project-sites');
const PROJECTS = [
  { slug:'base-studio-pizzas', name:'Base Studio Pizzas', url:'https://helioconde.github.io/site-pizzaria/', match: /base studio|pizzas|pizzaria/i },
  { slug:'playwitheliteitem', name:'PlayWithEliteItem', url:'https://thunderstore.io/c/riskofrain2/p/CONDE/PlayWithEliteItem/', match:/playwitheliteitem|play with elite item/i },
  { slug:'ofertamatica', name:'Ofertamática', url:'https://ofertamatica.com.br/', match: /ofertam[aá]tica/i },
  { slug:'redream', name:'Re:Dream', url:'https://helioconde.github.io/Re-Dream/', match: /re.?dream/i },
  { slug:'baby-on-screen', name:'Baby On Screen', url:'https://helioconde.github.io/babyOnScreen/web/', match: /baby.?on.?screen|beb[eê].?virtual/i }
];
fs.mkdirSync(OUTPUT, { recursive: true });
fs.mkdirSync(REPORT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless:true, ...(process.env.CI ? {channel:'chrome'} : {}) });
  const results = [];
  try {
    for (const project of PROJECTS) {
      const context = await browser.newContext({viewport:{width:1280,height:800}, deviceScaleFactor:1,
        colorScheme:'light', reducedMotion:'reduce', locale:'pt-BR'});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const status = {slug:project.slug, url:project.url, ok:false};
      try {
        const response = await page.goto(project.url, {waitUntil:'domcontentloaded',timeout:45000});
        status.httpStatus = response?.status() || null;
        status.finalUrl = page.url();
        if (!response?.ok()) throw Error('HTTP ' + status.httpStatus);
        await page.waitForTimeout(2600);
        // Decline optional tracking in this disposable browser, so the
        // screenshot features the actual editor rather than a consent dialog.
        if (project.slug === 'ofertamatica') {
          const reject = page.getByRole('button', { name: /rejeitar opcionais/i });
          if (await reject.isVisible({ timeout: 1200 }).catch(() => false)) {
            await reject.click({ timeout: 3000 });
            await page.waitForTimeout(450);
          }
        }
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images).map(async img => {
            if (img.complete) return;
            await Promise.race([
              new Promise(resolve => { img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true}); }),
              new Promise(resolve => setTimeout(resolve,1800))
            ]);
          }));
        });
        status.title = await page.title();
        const data = await page.evaluate(() => ({
          text:(document.body?.innerText || '').slice(0,8000),
          width:document.documentElement.scrollWidth,
          height:document.documentElement.scrollHeight,
          canvas:Boolean(document.querySelector('canvas'))
        }));
        if (!(project.match.test(status.title) || project.match.test(data.text.slice(0,1800))) ||
            /404|403|access denied|just a moment|captcha|not found/i.test(status.title) ||
            (data.text.trim().length < 90 && !data.canvas)) {
          throw Error('Conteudo inesperado: title=' + JSON.stringify(status.title) + ', chars=' + data.text.length);
        }
        if (!status.finalUrl.startsWith(new URL(project.url).origin)) {
          throw Error('Redirecionamento inesperado: ' + status.finalUrl);
        }
        const dest = path.join(OUTPUT, project.slug + '.jpg');
        const temp = dest + '.tmp';
        await page.screenshot({path:temp,type:'jpeg',quality:83,animations:'disabled',timeout:20000});
        fs.renameSync(temp,dest);
        await page.screenshot({path:path.join(REPORT,project.slug+'-full.png'),
          fullPage:true,animations:'disabled',timeout:30000});
        status.ok = true;
        status.image = 'img/projects/' + project.slug + '.jpg';
        status.pageSize = {width:data.width,height:data.height};
        status.javascriptErrors = errors;
      } catch (error) {
        status.error = String(error.message || error);
      } finally {
        results.push(status);
        console.log(JSON.stringify(status));
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  // Slimekeepers is a Godot desktop game, not a browser site.
  // This is the actual MENU ART from its source repository, never a fake gameplay shot.
  const slimeArt = {
    slug: 'slimekeepers-menu',
    source: 'HelioConde/Slime-Harvest: assets/ui/main_menu/vale_encantado.png',
    kind: 'artwork',
    ok: false,
  };
  try {
    const url = 'https://raw.githubusercontent.com/HelioConde/Slime-Harvest/main/assets/ui/main_menu/vale_encantado.png';
    const response = await fetch(url, { signal: AbortSignal.timeout(35000) });
    if (!response.ok) throw Error('HTTP ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 5000 || bytes.length > 16 * 1024 * 1024 ||
        bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') {
      throw Error('PNG invalido ou muito grande');
    }
    fs.writeFileSync(path.join(OUTPUT, 'slimekeepers-menu.png'), bytes);
    slimeArt.ok = true;
    slimeArt.image = 'img/projects/slimekeepers-menu.png';
  } catch (e) {
    slimeArt.error = String(e.message || e);
  }
  results.push(slimeArt);
  console.log(JSON.stringify(slimeArt));
  fs.writeFileSync(path.join(REPORT,'capture-results.json'),
    JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
  const successes = results.filter(r=>r.ok);
  const summary = [
    '## Capturas dos projetos públicos', '',
    '- Sucessos: **' + successes.length + '/' + results.length + '**','',
    '| Projeto | Resultado | URL |','| --- | --- | --- |',
    ...results.map(r => '| ' + r.slug + ' | ' +
      (r.ok ? 'Imagem real obtida' : 'Falha: ' + r.error).replace(/[|]/g,'/') +
      ' | ' + r.url + ' |'),
    '', '> Imagens da página pública; nenhuma captura do jogo desktop foi simulada.'
  ].join('\n');
  fs.writeFileSync(path.join(REPORT,'capture-summary.md'),summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
  if (!successes.length) process.exitCode = 1;
})();
