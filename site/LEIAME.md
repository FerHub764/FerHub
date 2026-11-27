# DevTrilhas

Plataforma estática para aprender programação do zero: 14 trilhas (Python, HTML & CSS, JavaScript, Java, C++, C, C#, SQL, Git, Go, Rust, PHP, Kotlin, Swift), quizzes que liberam módulos, prova final com certificado em PNG, XP, níveis, sequência diária e conquistas. O progresso fica salvo no navegador (com backup em JSON no Painel).

## Rodar localmente

```bash
python3 -m http.server 8080 -d site
# abra http://localhost:8080
```

É preciso um servidor (não abra o `index.html` direto do disco: módulos ES não carregam via `file://`).

## Publicar no GitHub Pages

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Faça merge na branch `main`. O workflow `.github/workflows/pages.yml` roda os testes e publica a pasta `site/`.

## Testes

```bash
node --test tests/*.test.mjs        # unidade + verificação do conteúdo (usa compiladores locais se houver)
node --test tests/e2e/*.e2e.mjs     # navegador (Playwright)
```

## Adicionar ou editar conteúdo

Cada trilha é um arquivo em `site/js/tracks/`. Use os helpers de `_dsl.js` (`mod`, `lesson`, `choice`, `predict`, `fill`, `bug`, `run`, `web`) e registre a trilha em `tracks/index.js`. O teste `tests/content.test.mjs` valida a estrutura e executa as respostas de "Qual é a saída?" com o compilador da linguagem.

## Jogo: Faísca (`site/jogo/`)

Jogo de plataforma 2D para celular, publicado junto com o site em `/jogo/`. Você controla uma brasa viva que atravessa cavernas escuras: a luz vem dela e dos objetos acesos. Tem 12 fases em 3 mundos (Grutas de Âmbar, Minas de Cristal, Poço das Marés), dash que derruba inimigos e encadeia combos, pulo na parede, 3 gemas escondidas por fase, loja de chamas (skins) e música e efeitos sintetizados no navegador.

- **Controles no celular:** em pé vira um console portátil (tela em cima, botões embaixo); deitado, os botões ficam por cima da tela. Teclado: ← → andam, Espaço pula, X dá dash, Esc pausa. Controles de videogame também funcionam.
- **Instalar:** no celular, abra `/jogo/` e use "Adicionar à tela inicial". Depois da primeira visita ele funciona sem internet.
- **Fases:** cada fase é um mapa em texto em `site/jogo/js/levels/` (legenda no topo de `site/jogo/js/level.js`).
- **Verificador:** `npm run jogo:verificar` procura, com a física real do jogo, um caminho até a saída e até cada gema de todas as fases. Rode depois de editar um mapa. `node tools/jogo/solver.mjs 2-3 --mapa` mostra onde a busca chegou.
- **Testes:** `node --test tests/jogo.test.mjs` (física, progresso e fases) e `node --test tests/e2e/jogo.e2e.mjs` (navegador).
- **Página única:** `npm run jogo:pagina` gera `faisca.html` com o jogo inteiro embutido num só arquivo.
