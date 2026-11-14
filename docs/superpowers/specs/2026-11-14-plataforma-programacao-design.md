# Plataforma de ensino de programação — Design

## Intenção
Site completo, bonito e em português que ensina programação do zero ao avançado, com módulos, progressão, provas e certificado. Público: iniciante absoluto. O aluno escolhe a trilha que quer seguir.

## Objetivos
- 15 trilhas: HTML/CSS, JavaScript, Python, Java, C, C++, C#, SQL, Git, Go, Rust, PHP, Kotlin, Swift.
- Lições com teoria, exemplos e exercícios; quiz por módulo; prova final com certificado.
- Progressão: XP, níveis, módulos bloqueados até passar no quiz, streak diário, conquistas, painel de progresso, mapa da trilha.
- Editor com execução real onde possível.

## Não-objetivos
- Sem login, servidor ou ranking entre usuários.
- Sem compilação real de Java/C/C++/C#/Go/Rust/Kotlin/Swift/PHP.
- Sem tradução para outros idiomas.

## Anti-objetivos (seria fracasso mesmo funcionando)
- Visual genérico ou template pronto.
- Trilhas inconsistentes entre si.
- Conteúdo raso, com lições vazias ou perguntas triviais.

## Restrições
- Site estático (HTML/CSS/JS puro, ES modules, sem build), publicável no GitHub Pages.
- Progresso salvo em localStorage (com export/import de backup, minha escolha).
- Vive em `site/`; o `README.md` atual (script Roblox sem relação) não é tocado.

## Abordagens consideradas
- **A. Vanilla simples:** sem build, mas interface repetida por trilha. Descartada: duplicação.
- **B. React + Vite + Markdown:** conteúdo confortável, mas exige build e dependências. Descartada: complica uso e publicação.
- **C. Vanilla + motor genérico (escolhida):** um motor lê qualquer trilha a partir de um arquivo de dados; criar linguagem nova = um arquivo.

## Decisões do usuário
- Tema escuro estilo dev, com opção de tema claro; idioma português.
- Execução real: Python (Pyodide, carregado sob demanda), JavaScript (sandbox em iframe/worker), HTML/CSS (preview ao vivo). Demais linguagens: prever a saída, completar código, achar o erro, múltipla escolha.
- Profundidade: HTML/CSS, JS, Python, Java e C++ com 8–10 módulos; as demais 5–6 módulos.
- Certificado: imagem PNG gerada em canvas, com nome digitado pelo aluno, trilha, nota e data.
- Provas: quiz por módulo com nota mínima para liberar o próximo; prova final com tempo limite e questões sorteadas de um banco.

## Arquitetura (meu plano, ajustável pelo construtor)
```
site/
  index.html, css/ (tokens, tema escuro/claro, componentes)
  js/ engine/ (roteador, store/progresso, XP e níveis, streak,
               conquistas, quiz/prova, editor, certificado)
      tracks/ <trilha>.js  (módulos → lições → exercícios/quiz/prova)
```
Telas: início/escolha de trilha, mapa da trilha, lição com editor, quiz, prova, certificado, painel de progresso e conquistas, glossário simples.

## Cálculos que fiz por conta própria (marcados como minha decisão)
- XP por lição/exercício/quiz; níveis por faixas de XP.
- Nota mínima do quiz: 70%; da prova final: 70%, com nova tentativa permitida.
- Acessibilidade (teclado, contraste) e layout responsivo.
- Conteúdo escrito do zero e revisado quanto à correção técnica.

## Deixado ao construtor
Nomes dos módulos, ordem exata das lições, quantidade de questões por banco, paleta específica, ícones e microinterações.
