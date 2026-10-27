const fs = require('node:fs');
const path = require('node:path');

const root = path.join(process.cwd(), 'visual-reports');
const dataDir = path.join(root, 'dados');
const capturesDir = path.join(root, 'capturas');
const viewports = ['mobile-360', 'mobile-390', 'tablet-768', 'laptop-1024', 'desktop-1440'];
const shots = [
  ['pagina-inteira', 'Página inteira'],
  ['inicio', 'Seção inicial'],
  ['primeira-dobra', 'Primeira dobra (viewport)'],
  ['projetos', 'Projetos'],
  ['destaque', 'Projeto principal'],
  ['contato', 'Contato'],
  ['filtro-jogos', 'Filtro de jogos'],
  ['menu-mobile', 'Menu mobile aberto'],
];
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

fs.mkdirSync(root, { recursive: true });
const summaries = [];
const gallery = [];
for (const viewport of viewports) {
  const metricsFile = path.join(dataDir, viewport + '.json');
  const metrics = fs.existsSync(metricsFile)
    ? JSON.parse(fs.readFileSync(metricsFile, 'utf8')) : null;
  const imgs = shots.filter(([name]) => fs.existsSync(path.join(capturesDir, viewport, name + '.png')));
  let problems = [];
  if (!metrics) problems.push('Métricas não geradas');
  else {
    if (metrics.horizontalOverflow) problems.push('Rolagem horizontal');
    if (metrics.outOfViewport.length) problems.push(metrics.outOfViewport.length + ' elementos fora da tela');
    if (metrics.clippedText?.length) problems.push(metrics.clippedText.length + ' textos cortados');
    if (metrics.brokenImages.length) problems.push(metrics.brokenImages.length + ' imagens não carregadas');
    if (metrics.pageErrors.length) problems.push(metrics.pageErrors.length + ' erros de JavaScript');
    if (metrics.consoleErrors?.length) problems.push(metrics.consoleErrors.length + ' erros no console');
  }
  const expected = viewport.startsWith('mobile-') ? 8 : 7;
  if (imgs.length < expected) problems.push((expected - imgs.length) + ' capturas ausentes');
  const result = problems.length ? 'REVISAR' : 'OK';
  summaries.push({ viewport, result, images: imgs.length, problems, metrics });

  const cards = imgs.map(([name, label]) => {
    const file = 'capturas/' + viewport + '/' + name + '.png';
    return '<a class="shot" href="' + escapeHtml(file) + '" target="_blank" rel="noopener">' +
      '<img src="' + escapeHtml(file) + '" loading="lazy" alt="' + escapeHtml(label + ' em ' + viewport) + '">' +
      '<span>' + escapeHtml(label) + '</span></a>';
  }).join('\n');
  gallery.push('<section class="viewport"><h2>' + escapeHtml(viewport) +
    ' <small>' + escapeHtml(result) + '</small></h2>' +
    '<p>' + escapeHtml(problems.length ? problems.join(' · ') : 'Sem problemas detectados nas medições automáticas.') +
    '</p><div class="shots">' + cards + '</div></section>');
}
const total = summaries.reduce((sum, item) => sum + item.images, 0);
const failures = summaries.filter((r) => r.result !== 'OK');
const report = {
  generatedAt: new Date().toISOString(),
  totalScreenshots: total,
  viewports: summaries,
};
fs.writeFileSync(path.join(root, 'relatorio.json'), JSON.stringify(report, null, 2));

const markdown = [
  '## Auditoria visual automática',
  '',
  '- Resoluções analisadas: **' + summaries.filter(s => s.metrics).length + '/' + viewports.length + '**',
  '- Capturas disponíveis: **' + total + '**',
  '- Viewports com alertas: **' + failures.length + '**',
  '',
  '| Viewport | Capturas | Situação |',
  '| --- | ---: | --- |',
  ...summaries.map((s) => '| ' + s.viewport + ' | ' + s.images + ' | ' +
    (s.problems.length ? s.problems.join('; ') : 'Sem alertas automáticos') + ' |'),
  '',
  '> A ausência de alertas não substitui a revisão visual das imagens e testes de acessibilidade.',
  '',
  'Abra o arquivo **index.html** no artefato visual para comparar as capturas.',
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'resumo.md'), markdown);
const html = [
  '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>Relatório visual · Portfólio 2.0</title>',
  '<style>',
  ':root{color-scheme:dark;font-family:system-ui,Arial,sans-serif;background:#0b1120;color:#eef2ff}',
  '*{box-sizing:border-box}body{max-width:1440px;margin:auto;padding:24px}',
  'h1{font-size:clamp(1.7rem,4vw,2.8rem)}p{color:#b6c4dc;line-height:1.5}',
  '.summary{display:flex;flex-wrap:wrap;gap:14px;margin:24px 0}',
  '.summary span{padding:12px 16px;background:#19243c;border-radius:12px}',
  '.viewport{margin:30px 0;padding:24px;border:1px solid #33415f;border-radius:18px;background:#111b30}',
  '.viewport h2{margin-top:0}.viewport small{font-size:.72rem;color:#a5f3fc}',
  '.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:18px}',
  '.shot{display:block;overflow:hidden;border:1px solid #415173;border-radius:12px;color:#fff;text-decoration:none;background:#17243b}',
  '.shot img{display:block;object-fit:cover;object-position:top;width:100%;height:235px;background:#070b14}',
  '.shot span{display:block;padding:12px;font-weight:600}.shot:focus-visible{outline:3px solid #67e8f9;outline-offset:3px}',
  '@media(max-width:600px){body{padding:12px}.viewport{padding:12px}}',
  '</style></head><body>',
  '<h1>Portfólio 2.0 · Relatório de capturas</h1>',
  '<p>Capturas reais do navegador automatizado. Clique numa imagem para examinar sua resolução completa.</p>',
  '<div class="summary"><span>' + total + ' capturas</span><span>' + viewports.length +
  ' tamanhos de tela</span><span>' + failures.length + ' alertas por viewport</span></div>',
  ...gallery,
  '</body></html>',
].join('\n');
fs.writeFileSync(path.join(root, 'index.html'), html);
process.stdout.write(markdown);
