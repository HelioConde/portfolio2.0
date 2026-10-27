# Capturas automáticas e auditoria visual

Este portfólio possui um sistema de **capturas reais com Playwright**. Ele tira imagens em cinco resoluções, mede problemas e prepara uma galeria que pode ser aberta sem servidor.

## Capturas produzidas
- `pagina-inteira.png` — página completa
- `inicio.png` — apresentação
- `projetos.png` — vitrine de projetos
- `destaque.png` — projeto principal
- `contato.png` — contato
- `filtro-jogos.png` — filtro de jogos ativo
- `menu-mobile.png` — menu aberto (apenas 360/390px)

Resoluções: **360×780, 390×844, 768×1024, 1024×768, 1440×900**. Capturas são feitas com o modo de movimento reduzido para evitar resultados diferentes a cada execução.

## Execução automática no GitHub

Acesse **Actions → Portfolio QA + capturas visuais → escolha a execução → Artifacts → portfolio-capturas-visuais**.

O ZIP contém:
- `index.html`: galeria das imagens, agrupadas por resolução
- `capturas/`: PNGs em alta resolução
- `dados/`: JSON das medições, separados por dispositivo
- `relatorio.json`: síntese de todos os dispositivos
- `resumo.md`: tabela dos alertas automáticos

Os artefatos ficam disponíveis por **14 dias** a partir da execução.

### Quando o sistema roda
1. Automaticamente em commits e pull requests para `main`, fotografando o código do repositório servido localmente na própria Action.
2. Automaticamente toda segunda-feira às **11h UTC**, fotografando o site **publicado** em GitHub Pages.
3. Manualmente na aba Actions (`Run workflow`) quando desejar capturar a versão `local` ou `published`.

Não há necessidade de iniciar testes após cada alteração: a Action cria o relatório automaticamente.

## Executar no computador

Requisitos: Node 22+, Python 3 e Chromium do Playwright.

```bash
npm install
npx playwright install chromium
npm run screenshots
npm run screenshots:report
```

Depois, abra `visual-reports/index.html` no navegador.

Para fotografar o site publicado localmente:

```bash
SCREENSHOT_URL=https://helioconde.github.io/portfolio2.0/ npm run screenshots
npm run screenshots:report
```

No Windows PowerShell:

```powershell
$env:SCREENSHOT_URL = "https://helioconde.github.io/portfolio2.0/"
npm run screenshots
npm run screenshots:report
Remove-Item Env:SCREENSHOT_URL
```

Para testes funcionais e capturas em sequência:

```bash
npm run test:all
```

## Diagnósticos automáticos

O relatório aponta:
- Scroll horizontal (conteúdo mais largo do que a viewport).
- Elementos importantes que ultrapassam os limites esquerdo/direito.
- Imagens sem carregamento válido.
- Erros JavaScript detectados.
- Quantidade de projetos e títulos principais.

**Atenção:** ausência de alertas não significa design aprovado. É preciso abrir `index.html` e comparar visualmente cortes, contraste, espaçamentos, hierarquia, uso do espaço e botões. Esse sistema **não modifica CSS sozinho**; alterações são feitas após inspeção dos resultados.

## Como melhorar com base nas capturas

1. Verifique as cinco imagens `pagina-inteira` lado a lado.
2. Abra `inicio` para conferir clareza do título e posição dos CTAs.
3. Compare `projetos` e `filtro-jogos` para observar a altura dos cartões, espaços e status.
4. No mobile, confira `menu-mobile` e `contato` para identificar itens cortados.
5. Consulte `relatorio.json` e `resumo.md` para encontrar alertas técnicos.
6. Faça as correções no HTML/CSS/JS; o próximo commit gera novas capturas.

Não faça commit do diretório `visual-reports/`: arquivos são efêmeros e podem ser grandes. Use artefatos do GitHub Actions.

## Restrições
- Links externos podem não estar disponíveis temporariamente; o fluxo de captura valida a página, mas não tenta autenticação ou APIs externas.
- O primeiro screenshot de um commit pode ser anterior ao deploy do GitHub Pages; por isso, há também execução semanal da versão pública.
- A publicação no GitHub Pages continua totalmente estática, sem banco de dados.
