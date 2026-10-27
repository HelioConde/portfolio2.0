# Design System — Portfólio 2.0

## Objetivo
Vitrine de projetos com foco em recrutadores e colaboradores. O código é HTML, CSS e JS sem framework no runtime. O teste usa Playwright apenas em desenvolvimento e CI.

## Fundamentos
- Apresentar os **projetos imediatamente após o hero**; reduzir repetição de currículos.
- Distinguir **concluído**, **em evolução**, **protótipo em desenvolvimento** e **em desenvolvimento**, sempre de acordo com o estágio real.
- Links de código e demonstração devem apontar para URLs verificáveis; não inventar métricas nem resultados.
- Interface escura, tipografia de sistema, acentos violeta e ciano e contraste adequado.

## Tokens CSS
Centralizados em `css/style.css`. Cores: `--bg`, `--surface`, `--surface-alt`, `--text`, `--muted`, `--accent`, `--accent-bright`, `--focus-ring`.
Escala de espaçamento: `--space-1/2/3/4/5/6/8/10/12/16`. Tamanhos: `--radius`, `--radius-sm`, `--container`. Use os tokens para novos componentes, sem repetir estilos ou breakpoints.

## Componentes
- **Hero**: papel profissional claro, CTA de projetos, CTA de contato e resumo do trabalho.
- **Cartão de projeto**: imagem verdadeira quando disponível; caso contrário, painel tipográfico decorativo (não simular screenshot).
- **Status**: nomenclatura cuidadosa para jogos em desenvolvimento. Nunca apresentar Slimekeepers como jogo finalizado.
- **Filtros**: botões nativos com `aria-pressed`; ocultação sem JS não impede visualizar projetos.
- **Processo**: três passos concretos, sem repetir o case da pizzaria.
- **Formação**: bloco separado da vitrine de projetos.
- **Menu**: estado em `aria-expanded`; Escape e clique externo fecham; rótulo muda conforme aberto/fechado.

## Responsividade
- >1100px: 3 colunas de projetos, destaque principal ocupa 2.
- 761–1100px: 2 colunas, destaque principal ocupa 2.
- ≤760px: 1 coluna e menu colapsável.
- ≤860px: hero simplificado sem ilustração, favorecendo acesso rápido aos projetos.
- ≤460px: ações empilhadas e tipografia ajustada.

## Acessibilidade e performance
- Contraste de texto, foco visível e botão de pular para o conteúdo.
- Respeitar `prefers-reduced-motion`.
- Conteúdo legível sem JavaScript; filtros são progressive enhancement.
- Preferir imagens reais com `alt` apropriado; painel decorativo usa `aria-hidden`.
- Metadados canonical/Open Graph/Twitter e sitemap.xml.
- Não incluir bibliotecas ou carrosséis sem necessidade real de experiência de uso.

## QA
- `npm install && npx playwright install chromium && npm run test:e2e`.
- GitHub Actions: `.github/workflows/portfolio-qa.yml`.
- Casos automatizados: layout 360/390/768/1024/1440, filtros, menu, metadados, ausência de JavaScript exceptions e overflow.
- Revisão visual e Lighthouse ainda exigem evidência de execução; **não assumir PASS sem logs**.
