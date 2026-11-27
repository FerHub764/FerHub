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

- **Modo Fuga da Escuridão:** corrida infinita montada com trechos sorteados (`site/jogo/js/endless.js`). A escuridão avança pela esquerda e acelera; você tem 3 vidas (+1 a cada 500 m) e o recorde fica marcado com uma bandeira. Libera depois da fase 1-1.
- **Sempre deitado:** o jogo abre numa tela "Toque para começar" e roda sempre na horizontal. No Android ele entra em tela cheia e trava a orientação; no iPhone (que não permite travar), com o celular em pé a tela inteira gira 90°. Dá para desligar em **Ajustes → Sempre deitado** e voltar ao console portátil em pé.
- **Troféus:** 18 conquistas e estatísticas em `site/jogo/js/achievements.js`.
- **Controles no celular:** em pé vira um console portátil (tela em cima, botões embaixo, pílula de pausa); deitado, os botões ficam por cima da tela. O anel do botão de dash e a própria Faísca apagam quando o dash foi gasto no ar. Há opção para canhotos e para desligar tremor e clarões. Teclado: ← → andam, Espaço pula, X dá dash, Esc pausa. Controles de videogame também funcionam.
- **Instalar:** no celular, abra `/jogo/` e use "Adicionar à tela inicial". Depois da primeira visita ele funciona sem internet.
- **Fases:** cada fase é um mapa em texto em `site/jogo/js/levels/` (legenda no topo de `site/jogo/js/level.js`).
- **Verificador:** `npm run jogo:verificar` procura, com a física real do jogo, um caminho até a saída e até cada gema de todas as fases. Os testes também passam cada trecho do Modo Fuga pelo verificador. Rode depois de editar um mapa. `node tools/jogo/solver.mjs 2-3 --mapa` mostra onde a busca chegou.
- **Testes:** `node --test tests/jogo.test.mjs` (física, progresso e fases) e `node --test tests/e2e/jogo.e2e.mjs` (navegador).
- **Página única:** `npm run jogo:pagina` gera `faisca.html` com o jogo inteiro embutido num só arquivo.

### Instalar a Faísca no celular

1. Publique: faça merge da branch na `main` e confirme que o workflow **Publicar site (GitHub Pages)** ficou verde.
2. Android (Chrome): abra o endereço do jogo, toque em ⋮ e depois em **Instalar app**. Ou abra **Ajustes → Instalar no celular → Instalar**.
3. iPhone (Safari, não funciona no Chrome): abra o endereço, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.
4. Depois de instalada, o jogo abre em tela cheia e funciona sem internet.
