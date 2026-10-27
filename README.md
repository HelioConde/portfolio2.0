<div align="center">
  <h1>🌐 Portfólio 2.0 — Hélio Conde</h1>
  <p><strong>Portfólio profissional com aplicações web, ferramentas, jogos e projetos de código aberto.</strong></p>
  <p><a href="https://helioconde.github.io/portfolio2.0/"><strong>Abrir portfólio</strong></a> · <a href="https://github.com/HelioConde"><strong>Meu GitHub</strong></a> · <a href="https://www.linkedin.com/in/helioconde/"><strong>LinkedIn</strong></a></p>
</div>

![Apresentação visual do portfólio](img/front.png)

## Sobre

O **Portfólio 2.0** é meu site pessoal para apresentar experiência, tecnologias e projetos. Esta versão prioriza **projetos reais**, navegação objetiva, identidade visual consistente, acessibilidade e responsividade. A seção de projetos tem filtros por categoria e informa claramente o estágio de cada trabalho.

O site é estático em HTML, CSS e JavaScript; **não exige npm para ser publicado**. O npm é usado apenas para executar os testes automatizados com Playwright.

## Alguns projetos do portfólio

| Projeto | O que demonstra |
| --- | --- |
| [**PlayWithEliteItem**](https://github.com/HelioConde/PlayWithEliteItem) | Mod C# publicado para a comunidade de Risk of Rain 2 |
| [**Base Studio Pizzas**](https://github.com/HelioConde/site-pizzaria) | Aplicação full-stack de delivery concluída para portfólio |
| [**Ofertamática**](https://github.com/HelioConde/ofertamatica) | Ferramenta de cartazes promocionais para o varejo |
| [**Baby On Screen**](https://github.com/HelioConde/babyOnScreen) | Mascote virtual com edições Windows e navegador |
| [**Slimekeepers: Lost Valley**](https://github.com/HelioConde/Slime-Harvest) | Jogo indie 2D com Godot **em desenvolvimento** |
| [**Re:Dream**](https://github.com/HelioConde/Re-Dream) | Protótipo de jogo multiplayer 2D **em desenvolvimento** |

Esses projetos possuem seus próprios READMEs e diferentes níveis de maturidade.

## Executar localmente

```bash
git clone https://github.com/HelioConde/portfolio2.0.git
cd portfolio2.0
python -m http.server 8000
```

Acesse `http://localhost:8000`. Também é possível inspecionar o HTML e CSS diretamente; o servidor é recomendado para testar recursos e links de forma semelhante à publicação.

## Previews autênticas dos projetos

As prévias da pizzaria, Ofertamática, Re:Dream e Baby On Screen são capturas reais das versões públicas obtidas via Playwright. Slimekeepers usa **arte do menu** (não gameplay), e PlayWithEliteItem mantém a identidade gráfica até existir uma captura verificável. Veja [origens, atualização e cuidados](docs/PREVIAS_PROJETOS.md).

## Testes de qualidade

```bash
npm install
npx playwright install chromium
npm run test:e2e
npm run screenshots
npm run screenshots:report
```

A suíte inicia um servidor local, valida cinco resoluções (360, 390, 768, 1024 e 1440 px), navegação mobile, filtros dos projetos, links, metadados e ausência de overflow horizontal. O workflow **Portfolio QA + capturas visuais** do GitHub Actions executa testes e cria um pacote de imagens em pushes e pull requests para `main`. Na auditoria de 27/10/2026, as 37 capturas reais em cinco resoluções passaram sem alertas de layout ou JavaScript. Toda segunda-feira, ele também pode registrar a versão publicada no GitHub Pages.

Após a execução, baixe o artefato **portfolio-capturas-visuais** em **Actions** e abra seu `index.html` para comparar as capturas. Veja o [guia das capturas](docs/CAPTURAS_VISUAIS.md) e o [roadmap](docs/ROADMAP.md) para acompanhar as validações.

## Estrutura

```text
index.html    Página de entrada e seções
css/          Estilos, layout e responsividade
js/           Interações
img/          Imagens e apresentações dos projetos
tests/        Testes e capturas automatizadas Playwright
scripts/      Gerador da galeria e métricas
docs/         Design system e roadmap
.github/      Workflow de QA
icon/         Ícones e favicon
```

## Evolução

- Priorizar leitura rápida dos projetos principais e resultados reais.
- Manter acesso fácil ao código, demonstração e contato.
- Revisar periodicamente informações desatualizadas de projetos.
- Validar links, imagens, responsividade, navegação por teclado e metadados sociais.

> O portfólio é uma apresentação de trabalhos próprios e projetos de estudo; exemplos de terceiros ou recursos usados como referência mantêm seus direitos e atribuições originais.

**[Conhecer o site](https://helioconde.github.io/portfolio2.0/)**

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
