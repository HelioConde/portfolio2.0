# Imagens reais dos projetos no portfólio

As imagens usadas em `index.html` vêm de projetos públicos próprios. **Não são mockups gerados por IA nem representações inventadas do gameplay.**

| Projeto | Arquivo | Tipo e origem |
| --- | --- | --- |
| Base Studio Pizzas | `img/projects/base-studio-pizzas.jpg` | Captura da home pública em GitHub Pages |
| Ofertamática | `img/projects/ofertamatica.jpg` | Captura do criador de cartazes em ofertamatica.com.br |
| Re:Dream | `img/projects/redream.jpg` | Captura da tela inicial web pré-alfa; não demonstra sessão multiplayer ativa |
| Baby On Screen | `img/projects/baby-on-screen.jpg` | Captura da versão web, não do app Windows |
| Slimekeepers: Lost Valley | `img/projects/slimekeepers-forest.png` e `img/projects/slimekeepers-valley.png` | **Capturas reais de gameplay** da Clareira do Despertar e do Vale das Nascentes; copiadas do repositório `HelioConde/Slimekeepers-Lost-Valley` |
| PlayWithEliteItem | `img/projects/playwitheliteitem.jpg` | Captura da **página pública do mod no Thunderstore**, não gameplay |

## Como são atualizadas

O GitHub Actions `capture-projects.yml` usa um navegador Chrome com Playwright para acessar as páginas públicas, sem login, em 1280×800, e salva as capturas JPEG verificadas no próprio repositório. Também gera capturas completas em `visual-reports/project-sites` como artefato de execução (14 dias).

O mesmo fluxo sincroniza duas capturas reais de gameplay de Slimekeepers, diretamente do repositório oficial do jogo. Valida a assinatura PNG e preserva a imagem anterior se a nova captura não estiver disponível. Antes de atualizar um JPEG, valida HTTP, título, conteúdo e redirecionamento. **Se uma captura falhar, a imagem anterior é mantida.** Sites externos podem ficar indisponíveis ou mostrar telas diferentes ao longo do tempo.

O fluxo roda quando o script/workflow é atualizado, pode ser iniciado em GitHub Actions e executa uma verificação semanal. O workflow `portfolio-qa.yml` testa responsividade, links e carregamento de imagens.

## Uso responsável

- Não realizar login para capturas públicas.
- Não incluir dados privados, painéis autenticados ou dados de clientes.
- Capturar apenas o estado público e identificar claramente versões de teste.
- Revisar periodicamente imagens de páginas de terceiros, direitos de uso e atribuições de arte.
- As duas imagens de Slimekeepers são capturas reais de versões do jogo Godot, não mockups. Não substituir por arte promocional identificada como gameplay.
