import { h, icon, pageTitle } from './components.js';
import { inline } from '../engine/markdown.js';

export const GLOSSARY = [
  ['Algoritmo', 'Sequência finita de passos para resolver um problema, como uma receita de bolo.'],
  ['API', 'Conjunto de regras que permite que programas conversem entre si. Ex.: um app pedindo a previsão do tempo a um servidor.'],
  ['Argumento', 'Valor que você passa para uma função quando a chama. Em `soma(2, 3)`, 2 e 3 são argumentos.'],
  ['Array / Lista', 'Coleção ordenada de valores acessados por posição (índice), normalmente começando em 0.'],
  ['Back-end', 'Parte do sistema que roda no servidor: regras de negócio, banco de dados, autenticação.'],
  ['Biblioteca', 'Código pronto, escrito por outras pessoas, que você importa para não reinventar a roda.'],
  ['Booleano', 'Tipo com apenas dois valores: verdadeiro (`true`) ou falso (`false`).'],
  ['Bug', 'Erro no programa que faz ele se comportar de forma diferente da esperada.'],
  ['Classe', 'Molde para criar objetos, reunindo dados (atributos) e comportamentos (métodos).'],
  ['Commit', 'No Git, uma "foto" salva do projeto com uma mensagem descrevendo a mudança.'],
  ['Compilador', 'Programa que traduz o código-fonte inteiro para linguagem de máquina antes de executar (C, C++, Rust, Go).'],
  ['Concatenação', 'Juntar textos. Ex.: `"Olá, " + "Ana"` resulta em `"Olá, Ana"`.'],
  ['Condicional', 'Estrutura que executa código só se uma condição for verdadeira (`if`/`else`).'],
  ['Constante', 'Valor que não pode ser alterado depois de definido.'],
  ['CSS', 'Linguagem de estilos que define a aparência das páginas web: cores, tamanhos, layout.'],
  ['Debug / Depurar', 'Processo de encontrar e corrigir bugs, normalmente lendo mensagens de erro e testando hipóteses.'],
  ['Dicionário / Mapa', 'Estrutura que guarda pares chave → valor. Ex.: `{"nome": "Ana"}`.'],
  ['Escopo', 'Região do código onde uma variável existe e pode ser usada.'],
  ['Exceção', 'Erro que acontece durante a execução e pode ser tratado com `try`/`catch` (ou `try`/`except`).'],
  ['Framework', 'Estrutura pronta que organiza seu projeto e dita como o código deve ser escrito (ex.: React, Spring, Django).'],
  ['Front-end', 'Parte do sistema que o usuário vê e com a qual interage: HTML, CSS e JavaScript no navegador.'],
  ['Função', 'Bloco de código com nome que pode ser reutilizado. Recebe parâmetros e pode devolver um resultado.'],
  ['Git', 'Sistema de controle de versão que registra o histórico de mudanças do código.'],
  ['HTML', 'Linguagem de marcação que define a estrutura e o conteúdo das páginas web.'],
  ['IDE', 'Ambiente de desenvolvimento: editor com ferramentas para escrever, rodar e depurar código (ex.: VS Code, IntelliJ).'],
  ['Índice', 'Posição de um item dentro de uma lista ou texto. Na maioria das linguagens, o primeiro é o 0.'],
  ['Interpretador', 'Programa que lê e executa o código linha a linha, sem compilar antes (Python, JavaScript, PHP).'],
  ['Iteração', 'Cada repetição de um laço. Iterar é percorrer itens um a um.'],
  ['JSON', 'Formato de texto para trocar dados, baseado em pares chave/valor: `{"idade": 20}`.'],
  ['Laço / Loop', 'Estrutura que repete um bloco de código (`for`, `while`).'],
  ['Método', 'Função que pertence a um objeto ou classe. Ex.: `texto.upper()`.'],
  ['Objeto', 'Instância de uma classe; agrupa dados e comportamentos.'],
  ['Operador', 'Símbolo que faz uma operação: `+`, `-`, `==`, `&&`, `and`...'],
  ['Parâmetro', 'Nome da variável declarada na definição da função que receberá um argumento.'],
  ['Ponteiro', 'Variável que guarda um endereço de memória (comum em C e C++).'],
  ['Recursão', 'Quando uma função chama a si mesma para resolver um problema menor.'],
  ['Refatorar', 'Melhorar a estrutura do código sem mudar o que ele faz.'],
  ['Repositório', 'Pasta de projeto controlada pelo Git, com todo o histórico de versões.'],
  ['Retorno', 'Valor que uma função devolve com `return`.'],
  ['Sintaxe', 'As regras de escrita de uma linguagem. Erro de sintaxe = código "mal escrito".'],
  ['SQL', 'Linguagem para consultar e manipular dados em bancos de dados relacionais.'],
  ['String', 'Texto. Sequência de caracteres entre aspas: `"Olá"`.'],
  ['Terminal', 'Janela onde você digita comandos de texto para o computador.'],
  ['Tipagem estática', 'O tipo de cada variável é conhecido antes de rodar (Java, C#, Go). Erros de tipo aparecem cedo.'],
  ['Tipagem dinâmica', 'O tipo é descoberto durante a execução (Python, JavaScript). Mais flexível, menos verificações.'],
  ['Variável', 'Nome que guarda um valor na memória para ser usado depois.'],
];

export function renderGlossary() {
  pageTitle('Glossário');
  const list = h('dl', { class: 'glossary' });
  const input = h('input', { class: 'input', type: 'search', placeholder: 'Buscar termo…', 'aria-label': 'Buscar termo' });
  const empty = h('p', { class: 'empty', hidden: true }, 'Nenhum termo encontrado.');
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function paint() {
    const q = norm(input.value.trim());
    const items = GLOSSARY.filter(([t, d]) => !q || norm(t).includes(q) || norm(d).includes(q));
    list.replaceChildren(...items.map(([t, d]) => h('div', { class: 'gloss-item' }, h('dt', null, t), h('dd', { html: inline(d) }))));
    empty.hidden = items.length > 0;
  }
  input.addEventListener('input', paint);
  paint();

  return h('div', { class: 'glossary-page' },
    h('p', { class: 'eyebrow' }, icon('book'), 'Glossário'),
    h('h1', null, 'Termos de programação, sem complicação'),
    h('p', { class: 'hero-lead' }, 'Encontrou uma palavra estranha numa lição? Ela provavelmente está aqui.'),
    h('div', { class: 'search-box' }, icon('search'), input),
    list, empty);
}
