# Imagens reais dos projetos no portfólio

As imagens usadas em `index.html` vêm de projetos públicos próprios. **Não são mockups gerados por IA nem representações inventadas do gameplay.**

| Projeto | Arquivo | Tipo e origem |
| --- | --- | --- |
| Base Studio Pizzas | `img/projects/base-studio-pizzas.jpg` | Captura da home pública em GitHub Pages |
| Ofertamática | `img/projects/ofertamatica.jpg` | Captura do criador de cartazes em ofertamatica.com.br |
| Re:Dream | `img/projects/redream.jpg` | Captura da tela inicial web pré-alfa; não demonstra sessão multiplayer ativa |
| Baby On Screen | `img/projects/baby-on-screen.jpg` | Captura da versão web, não do app Windows |
| Slimekeepers: Lost Valley | `img/projects/slimekeepers-menu.png` | **Arte do menu do jogo Godot** proveniente do repositório Slime-Harvest; **não é screenshot de gameplay** |
| PlayWithEliteItem | `img/projects/playwitheliteitem.jpg` | Captura da **página pública do mod no Thunderstore**, não gameplay |

## Como são atualizadas

O GitHub Actions `capture-projects.yml` usa um navegador Chrome com Playwright para acessar as páginas públicas, sem login, em 1280×800, e salva as capturas JPEG verificadas no próprio repositório. Também gera capturas completas em `visual-reports/project-sites` como artefato de execução (14 dias).

O mesmo fluxo copia a arte do menu de Slimekeepers diretamente do repositório de origem, sem apresentá-la como gameplay. Antes de atualizar um JPEG, valida HTTP, título, conteúdo e redirecionamento. **Se uma captura falhar, a imagem anterior é mantida.** Sites externos podem ficar indisponíveis ou mostrar telas diferentes ao longo do tempo.

O fluxo roda quando o script/workflow é atualizado, pode ser iniciado em GitHub Actions e executa uma verificação semanal. O workflow `portfolio-qa.yml` testa responsividade, links e carregamento de imagens.

## Uso responsável

- Não realizar login para capturas públicas.
- Não incluir dados privados, painéis autenticados ou dados de clientes.
- Capturar apenas o estado público e identificar claramente versões de teste.
- Revisar periodicamente imagens de páginas de terceiros, direitos de uso e atribuições de arte.
- Se o jogo desktop não estiver sendo executado, não divulgar arte promocional como screenshot do gameplay.
