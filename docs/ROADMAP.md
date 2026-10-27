# Roadmap de melhoria — Portfólio 2.0

Atualização: 2026-10-27. Etapas são sequenciais; alterações já aplicadas estão marcadas, mas execução automatizada externa requer conferência dos resultados.

| Etapa | Ação | Situação |
| --- | --- | --- |
| 01 | Auditar HTML, CSS, JS e links | ✅ Análise estática executada |
| 02 | Priorizar projetos no fluxo da página | ✅ Aplicado |
| 03 | Melhorar textos e etapas reais dos projetos | ✅ Aplicado |
| 04 | Sinalizar Slimekeepers e Re:Dream como em desenvolvimento | ✅ Aplicado |
| 05 | Refatorar CSS em tokens e componentes | ✅ Aplicado |
| 06 | Criar filtros acessíveis de projetos | ✅ Aplicado |
| 07 | Refinar mobile, tablet e navegação por teclado | ✅ Código aplicado |
| 08 | SEO: canonical, OG/Twitter, JSON-LD e sitemap | ✅ Aplicado |
| 09 | Criar testes Playwright com cinco larguras | ✅ Suíte criada |
| 10 | Criar workflow de GitHub Actions | ✅ Arquivo criado |
| 11 | Executar Playwright e corrigir eventuais falhas | ⏳ Pendente de confirmação no Actions |
| 12 | Auditar imagens e obter capturas reais | ⏳ Pendente de execução visual |
| 13 | Validar Lighthouse e WCAG manualmente | ⏳ Pendente |
| 14 | Verificar o GitHub Pages publicado após deploy | ⏳ Pendente |

## Critérios de aceite da próxima auditoria

- Sem links internos quebrados, IDs duplicados ou erros de console.
- Filtros exibem a contagem correta e deixam os status intactos.
- Menu mobile acessível com clique, teclado e Escape.
- Sem barra horizontal em 360, 390, 768, 1024 e 1440px.
- Ações importantes estão acessíveis por teclado.
- Slimekeepers aparece explicitamente **Em desenvolvimento**.
- Capturas e métricas sustentam avaliações de aparência e desempenho.

## Orientações de publicação

O site continua estático e pode ser publicado no GitHub Pages. O arquivo `sitemap.xml` é referente à URL do projeto em `/portfolio2.0/`. Um `robots.txt` dentro de um repositório de GitHub Project Pages não controla o domínio raiz `helioconde.github.io`; não tratá-lo como solução de indexação. Para conferir testes use a aba **Actions > Portfolio QA** do repositório.
