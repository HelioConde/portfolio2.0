# Design System — Portfólio 2.0

## Princípios
- Apresentar projetos reais antes de elementos decorativos.
- Diferenciar projetos concluídos, protótipos e projetos em desenvolvimento.
- Manter hierarquia clara entre título, resumo, tecnologias e ação.
- Priorizar navegação por teclado, contraste, desempenho e mobile.

## Tokens
Tokens CSS definidos em `css/style.css`: `--space-1` a `--space-12`, `--focus-ring`, `--radius`, `--radius-sm`, `--shadow`, `--primary`, `--primary-2`, `--text`, `--muted`.

## Componentes
- Hero: mensagem profissional e CTA principal `Ver projetos`.
- Projeto: etiqueta de status, título, resumo, tecnologias e links verificáveis.
- Grid: três colunas no desktop, duas no tablet, uma no celular; primeiro projeto ocupa duas colunas no desktop.
- Menu mobile: acessível por botão, fecha com Escape, clique externo ou seleção do link.
- Links externos: usar `rel="noopener noreferrer"`.

## Acessibilidade
- Link para pular ao conteúdo.
- Contorno de foco visível.
- Scroll offset para navegação âncora.
- Respeitar `prefers-reduced-motion`.
- Imagens informativas com texto alternativo; decorativas com `alt=""`.
- Verificar navegação apenas com teclado e leitores de tela após cada atualização.

## QA pendente
- Executar Playwright nas larguras 360, 390, 768, 1024 e 1440 pixels.
- Checar console, links, overflow horizontal, tabulação, Escape, menu aberto, contraste e Lighthouse.
- Fazer revisão visual comparando capturas antes/depois.
- Validar deploy do GitHub Pages.
