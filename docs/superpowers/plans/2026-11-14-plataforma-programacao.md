# Plataforma de Programação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site estático em português que ensina 15 linguagens com módulos, quizzes, prova final, certificado e gamificação.

**Architecture:** Vanilla ES modules sem build. Um motor genérico (`site/js/engine/`) lê arquivos de dados por trilha (`site/js/tracks/*.js`). Lógica pura (progresso, XP, quiz, prova) é testada com `node --test`; telas ficam em `site/js/ui/`.

**Tech Stack:** HTML, CSS, JavaScript ES modules, localStorage, Pyodide (CDN, sob demanda), canvas (certificado), `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-14-plataforma-programacao-design.md`

## Global Constraints

- Tudo em `site/`; `README.md` da raiz não é tocado.
- Sem build, sem login, sem servidor; publicável no GitHub Pages.
- Idioma da interface e do conteúdo: português; tema escuro padrão com tema claro opcional.
- Progresso em `localStorage` chave `devtrilhas:v1`, com export/import JSON.
- Execução real: Python (Pyodide), JavaScript (iframe sandbox), HTML/CSS (preview ao vivo). Demais linguagens: prever saída, completar código, achar erro, múltipla escolha.
- Nota mínima de quiz e prova final: 70%; nova tentativa permitida.
- Trilhas principais (html-css, javascript, python, java, cpp): 8–10 módulos. Demais (c, csharp, sql, git, go, rust, php, kotlin, swift): 5–6 módulos.
- Certificado: PNG gerado em canvas com nome, trilha, nota e data.

## Review Focus

- localStorage indisponível ou corrompido: o site abre com progresso zerado e avisa, sem quebrar.
- Nome do aluno vazio ou muito longo no certificado: exige nome e ajusta o tamanho da fonte.
- Resposta de quiz em branco ou com espaços extras: conta como errada/normalizada, sem exceção.
- Código do aluno com loop infinito: execução é interrompida por timeout (5 s) e a página continua responsiva.
- Hash de rota inexistente (`#/trilha/xyz`): mostra tela "não encontrado" com link para o início.

## Estrutura de arquivos

```
site/index.html
site/css/{tokens,base,components,themes}.css
site/js/main.js                 bootstrap + roteador
site/js/engine/store.js         persistência e estado
site/js/engine/gamification.js  XP, níveis, streak, conquistas
site/js/engine/assess.js        correção de quiz/prova
site/js/engine/runner.js        execução (JS, Python, HTML/CSS)
site/js/engine/certificate.js   geração do PNG
site/js/engine/validate.js      validador de dados de trilha
site/js/ui/{home,track-map,lesson,quiz,exam,dashboard,certificate-view,components}.js
site/js/tracks/<id>.js          15 arquivos de conteúdo
tests/*.test.mjs
```

---

### Task 1: Esqueleto, tema e design system

**Files:** Create `site/index.html`, `site/css/*.css`, `site/js/main.js`, `site/js/ui/components.js`

**Interfaces:**
- Produces: `registerRoute(pattern: string, render: (params) => HTMLElement): void`, `navigate(hash: string): void`, componentes `h(tag, attrs, ...children): HTMLElement`, `toggleTheme(): void`.

- [ ] **Step 1:** Criar tokens de cor/tipografia/espaçamento (escuro padrão, claro via `data-theme="light"`), layout responsivo e barra superior com troca de tema.
- [ ] **Step 2:** Implementar roteador por hash em `main.js` com rota 404 ("não encontrado" + link ao início).
- [ ] **Step 3:** Abrir via servidor estático (`python3 -m http.server -d site`) e verificar com Playwright: tema alterna e persiste; hash inválido mostra 404.
- [ ] **Step 4:** Commit `feat: esqueleto do site, tema e roteador`.

### Task 2: Store e persistência

**Files:** Create `site/js/engine/store.js`; Test `tests/store.test.mjs`

**Interfaces:**
- Produces: `createStore(storage: Storage|null): { get(): State, update(fn: (s: State) => void): void, exportJSON(): string, importJSON(json: string): void }`; `State = { name: string, xp: number, streak: {count, lastDay}, lessons: Record<string,boolean>, quizzes: Record<string,number>, exams: Record<string,{score:number,date:string}>, achievements: string[], settings: {theme: 'dark'|'light'} }`.

- [ ] **Step 1:** Testes: estado inicial vazio; `update` persiste; `storage = null` e JSON corrompido retornam estado inicial sem lançar; `importJSON` rejeita formato inválido.
- [ ] **Step 2:** Rodar `node --test tests/store.test.mjs` e ver falhar.
- [ ] **Step 3:** Implementar `createStore` com versionamento de chave `devtrilhas:v1`.
- [ ] **Step 4:** Rodar testes e ver passar; commit `feat: store de progresso`.

### Task 3: Gamificação

**Files:** Create `site/js/engine/gamification.js`; Test `tests/gamification.test.mjs`

**Interfaces:**
- Consumes: `State` da Task 2.
- Produces: `levelForXp(xp: number): {level: number, current: number, next: number}`, `awardXp(state: State, amount: number): void`, `touchStreak(state: State, today: string): void` (datas `YYYY-MM-DD`), `evaluateAchievements(state: State, tracks: Track[]): string[]` (retorna ids novos).

- [ ] **Step 1:** Testes: nível 1 com 0 XP; sobe de nível em faixas crescentes (100·n²); streak incrementa em dia consecutivo, mantém no mesmo dia, zera após pular um dia; conquista "primeira lição" e "trilha concluída" disparam uma vez só.
- [ ] **Step 2:** Rodar e ver falhar; implementar; rodar e ver passar.
- [ ] **Step 3:** Commit `feat: xp, niveis, streak e conquistas`.

### Task 4: Modelo de trilha e correção de avaliações

**Files:** Create `site/js/engine/validate.js`, `site/js/engine/assess.js`; Test `tests/assess.test.mjs`, `tests/validate.test.mjs`

**Interfaces:**
- Produces tipos de dados: `Track = {id, name, icon, color, level: 'principal'|'extra', modules: Module[], exam: Question[], examConfig: {questions: number, minutes: number}}`; `Module = {id, title, lessons: Lesson[], quiz: Question[]}`; `Lesson = {id, title, content: string(HTML), exercises: Exercise[]}`; `Question = {id, type: 'choice'|'predict'|'fill'|'find-bug', prompt, options?, answer: string|number|string[], explanation}`.
- `gradeAnswer(q: Question, given: unknown): boolean` (normaliza espaços, caixa e resposta em branco = errada), `gradeQuiz(questions, answers): {score: number, passed: boolean}`, `buildExam(track: Track, seed: number): Question[]` (sorteio determinístico, sem repetir), `validateTrack(track: Track): string[]` (lista de erros: ids duplicados, módulo sem quiz, resposta fora das opções, contagem de módulos fora da faixa).

- [ ] **Step 1:** Testes: `gradeAnswer(fill, "  Print ")` normaliza; resposta vazia é falsa; 70% passa e 69% não; `buildExam` com mesma seed repete e nunca duplica; `validateTrack` aponta cada tipo de erro.
- [ ] **Step 2:** Falhar, implementar, passar; commit `feat: modelo de trilha, correcao e validador`.

### Task 5: Runner de código

**Files:** Create `site/js/engine/runner.js`; Test `tests/runner.test.mjs` (parte pura)

**Interfaces:**
- Produces: `runJavaScript(code: string, timeoutMs = 5000): Promise<{stdout: string, error?: string}>` (iframe sandbox + postMessage), `runPython(code: string, timeoutMs = 5000): Promise<{stdout: string, error?: string}>` (Pyodide em Worker, carregado na primeira chamada), `renderPreview(html: string, css: string): string` (srcdoc), `checkOutput(expected: string, actual: string): boolean` (ignora espaços finais).

- [ ] **Step 1:** Testes de `checkOutput` e `renderPreview`; Playwright para loop infinito em JS e Python encerrado por timeout com erro legível.
- [ ] **Step 2:** Implementar; verificar a página continua responsiva após timeout; commit `feat: execucao de codigo no navegador`.

### Task 6: Telas principais

**Files:** Create `site/js/ui/{home,track-map,lesson,quiz,exam,dashboard}.js`

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: rotas `#/`, `#/trilha/:id`, `#/trilha/:id/:modulo/:licao`, `#/trilha/:id/:modulo/quiz`, `#/trilha/:id/prova`, `#/painel`.

- [ ] **Step 1:** Home com grade de 15 trilhas e campo de nome; mapa da trilha com módulos bloqueados até o quiz anterior ≥70%.
- [ ] **Step 2:** Lição com conteúdo, editor (textarea com realce simples), botão executar e verificação de saída; concluir lição concede XP.
- [ ] **Step 3:** Quiz/prova com tempo na prova, resultado, revisão com explicações e nova tentativa; painel com XP, nível, streak, conquistas e % por trilha.
- [ ] **Step 4:** Playwright: fluxo completo (nome → trilha → lição → quiz aprovado → módulo seguinte liberado → XP aumentou); commit `feat: telas principais`.

### Task 7: Certificado

**Files:** Create `site/js/engine/certificate.js`, `site/js/ui/certificate-view.js`; Test `tests/certificate.test.mjs`

**Interfaces:**
- Produces: `fitFontSize(name: string, maxWidth: number, measure: (px:number)=>number): number`, `renderCertificate(canvas, {name, trackName, score, date}): void`, `downloadCertificate(canvas, filename): void`.

- [ ] **Step 1:** Testes de `fitFontSize` (nome longo reduz fonte, nunca abaixo de 18px); nome vazio é bloqueado na UI.
- [ ] **Step 2:** Implementar; ao passar na prova final mostrar certificado com botão baixar PNG; commit `feat: certificado em PNG`.

### Task 8: Conteúdo — trilhas principais

**Files:** Create `site/js/tracks/{html-css,javascript,python,java,cpp}.js`; Test `tests/tracks.test.mjs`

- [ ] **Step 1:** Teste que roda `validateTrack` em cada arquivo de trilha e falha com a lista de erros.
- [ ] **Step 2:** Escrever uma trilha por vez (8–10 módulos, lições, exercícios práticos, quiz de 5+ questões por módulo e banco de prova ≥30 questões), rodando o validador a cada trilha.
- [ ] **Step 3:** Em Python/JavaScript/HTML-CSS, cada exercício prático tem `expected` verificável pelo runner. Commit por trilha.

### Task 9: Conteúdo — trilhas extras

**Files:** Create `site/js/tracks/{c,csharp,sql,git,go,rust,php,kotlin,swift}.js`

- [ ] **Step 1:** Escrever cada trilha (5–6 módulos, quiz de 5+ questões, banco de prova ≥20 questões); validador passa em todas.
- [ ] **Step 2:** Commit por trilha ou em lotes de três.

### Task 10: Acabamento e publicação

**Files:** Modify `site/index.html`, CSS; Create `site/.nojekyll`, `site/404.html`

- [ ] **Step 1:** Revisar responsivo (360px e 1280px), contraste, foco por teclado; botões de exportar/importar progresso e de resetar.
- [ ] **Step 2:** `node --test tests/` passa inteiro e Playwright percorre ao menos uma trilha principal e uma extra até o certificado.
- [ ] **Step 3:** Commit `feat: acabamento e preparo para GitHub Pages`.

## Self-review

- Cobertura do design: trilhas, quiz/prova/certificado, XP/níveis/streak/conquistas/painel/mapa, execução real, tema, localStorage com backup, pasta `site/` — todos mapeados.
- Tipos consistentes entre tarefas (`State`, `Track`, `Question`).
- Review Focus coberto: store (T2), nome (T7), respostas em branco (T4), loop infinito (T5), rota inexistente (T1).
