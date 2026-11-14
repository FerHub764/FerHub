import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

// Every "Qual é a saída?" here is a full script (CREATE + INSERT + SELECT)
// returning a single value, so it can be verified with SQLite.
const LOJA = `CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, categoria TEXT, preco REAL, estoque INTEGER);
INSERT INTO produtos VALUES (1, 'Caneta', 'Papelaria', 2.5, 100), (2, 'Caderno', 'Papelaria', 18, 40), (3, 'Mouse', 'Informática', 60, 15), (4, 'Teclado', 'Informática', 120, 0), (5, 'Mochila', 'Acessórios', 150, 8);`;

export default defineTrack({
  id: 'sql',
  name: 'SQL',
  short: 'SQL',
  color: '#35d0b5',
  level: 'extra',
  lang: 'sql',
  category: 'Dados',
  tagline: 'A língua dos bancos de dados. Consulte, filtre e analise informações.',
  description: 'SELECT, WHERE, ORDER BY, funções de agregação, GROUP BY, JOINs, INSERT/UPDATE/DELETE e modelagem de tabelas.',
}, [
  mod('select', 'Consultando dados', 'Bancos relacionais, SELECT, WHERE e ORDER BY.', [
    lesson('Bancos de dados e tabelas', md`
      Um **banco de dados relacional** guarda informações em **tabelas**, como planilhas: cada **linha** é um registro e cada **coluna** é um campo com um tipo definido.

      Tabela \`produtos\`, usada nesta trilha:

      | id | nome | categoria | preco | estoque |
      |---|---|---|---|---|
      | 1 | Caneta | Papelaria | 2.5 | 100 |
      | 2 | Caderno | Papelaria | 18 | 40 |
      | 3 | Mouse | Informática | 60 | 15 |
      | 4 | Teclado | Informática | 120 | 0 |
      | 5 | Mochila | Acessórios | 150 | 8 |

      **SQL** (*Structured Query Language*) é a linguagem para conversar com esses bancos. Ela funciona em PostgreSQL, MySQL, SQLite, SQL Server, Oracle... com pequenas diferenças entre eles.

      ## SELECT

      ~~~sql
      SELECT nome, preco FROM produtos;
      SELECT * FROM produtos;          -- todas as colunas
      ~~~

      > 💡 Palavras-chave em MAIÚSCULAS são convenção, não obrigação. O \`;\` encerra o comando.
    `, [
      choice('Em uma tabela, o que representa cada **linha**?', ['Um tipo de dado', 'Um registro (ex.: um produto)', 'Uma coluna', 'O banco inteiro'], 1, 'Cada linha é um registro.'),
      fill('Complete para buscar todas as colunas:', 'SELECT ___ FROM produtos;', '*', '`*` significa todas as colunas.'),
    ]),
    lesson('WHERE e ORDER BY', md`
      \`WHERE\` filtra as linhas:

      ~~~sql
      SELECT nome FROM produtos WHERE preco < 50;
      SELECT nome FROM produtos WHERE categoria = 'Informática' AND estoque > 0;
      SELECT nome FROM produtos WHERE preco BETWEEN 10 AND 100;
      SELECT nome FROM produtos WHERE categoria IN ('Papelaria', 'Acessórios');
      SELECT nome FROM produtos WHERE nome LIKE 'Ca%';   -- começa com "Ca"
      ~~~

      - Textos vão entre **aspas simples**.
      - \`%\` no \`LIKE\` significa "qualquer sequência de caracteres".
      - Para testar valores vazios use \`IS NULL\` (nunca \`= NULL\`).

      \`ORDER BY\` ordena; \`LIMIT\` limita a quantidade:

      ~~~sql
      SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 3;
      ~~~
    `, [
      predict('Qual é a saída?', `${LOJA}\nSELECT nome FROM produtos WHERE preco > 100 ORDER BY preco DESC LIMIT 1;`, 'Mochila', 'Acima de 100: Teclado (120) e Mochila (150). Em ordem decrescente, Mochila vem primeiro.'),
    ]),
  ], [
    predict('Qual é a saída?', `${LOJA}\nSELECT nome FROM produtos WHERE estoque = 0;`, 'Teclado', 'Só o Teclado está sem estoque.'),
    choice('Qual operador busca padrões de texto?', ['`=`', '`LIKE`', '`IN`', '`BETWEEN`'], 1, '`LIKE` com `%` e `_`.'),
    fill('Complete para ordenar do maior para o menor preço:', 'SELECT * FROM produtos ORDER BY preco ___;', 'DESC', '`DESC` = decrescente; `ASC` = crescente.'),
    bug('Qual linha tem o erro?', md`
      SELECT nome, preco
      FROM produtos
      WHERE categoria = "Papelaria" AND preco < 10
      ORDER BY preco;
    `, 3, 'No SQL padrão, textos usam aspas **simples**: `\'Papelaria\'`. Aspas duplas indicam nomes de colunas.'),
    choice('Como testar se uma coluna está vazia (nula)?', ['`= NULL`', '`IS NULL`', '`== NULL`', '`EMPTY`'], 1, '`NULL` não é igual a nada, nem a outro NULL.'),
  ]),

  mod('agregacao', 'Agregação e agrupamento', 'COUNT, SUM, AVG, GROUP BY e HAVING.', [
    lesson('Funções de agregação', md`
      Agregações resumem várias linhas em um valor:

      ~~~sql
      SELECT COUNT(*) FROM produtos;              -- 5
      SELECT SUM(estoque) FROM produtos;          -- 163
      SELECT AVG(preco) FROM produtos;            -- 70.1
      SELECT MIN(preco), MAX(preco) FROM produtos;
      ~~~

      ## Apelidos (AS)

      ~~~sql
      SELECT COUNT(*) AS total_produtos FROM produtos;
      SELECT nome, preco * estoque AS valor_em_estoque FROM produtos;
      ~~~

      ## DISTINCT

      ~~~sql
      SELECT DISTINCT categoria FROM produtos;  -- sem repetições
      ~~~
    `, [
      predict('Qual é a saída?', `${LOJA}\nSELECT COUNT(*) FROM produtos WHERE categoria = 'Papelaria';`, '2', 'Caneta e Caderno.'),
    ]),
    lesson('GROUP BY e HAVING', md`
      \`GROUP BY\` junta linhas com o mesmo valor e aplica a agregação **por grupo**:

      ~~~sql
      SELECT categoria, COUNT(*) AS qtd, AVG(preco) AS preco_medio
      FROM produtos
      GROUP BY categoria;
      ~~~

      | categoria | qtd | preco_medio |
      |---|---|---|
      | Acessórios | 1 | 150 |
      | Informática | 2 | 90 |
      | Papelaria | 2 | 10.25 |

      \`HAVING\` filtra **grupos** (depois da agregação); \`WHERE\` filtra **linhas** (antes):

      ~~~sql
      SELECT categoria, SUM(estoque) AS total
      FROM produtos
      WHERE preco > 1
      GROUP BY categoria
      HAVING SUM(estoque) > 20;
      ~~~

      Ordem de execução lógica: \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`.
    `, [
      predict('Qual é a saída?', `${LOJA}\nSELECT COUNT(*) FROM (SELECT categoria FROM produtos GROUP BY categoria HAVING COUNT(*) > 1);`, '2', 'Informática e Papelaria têm mais de um produto.'),
    ]),
  ], [
    predict('Qual é a saída?', `${LOJA}\nSELECT SUM(estoque) FROM produtos WHERE categoria = 'Informática';`, '15', '15 + 0.'),
    predict('Qual é a saída?', `${LOJA}\nSELECT MAX(preco) FROM produtos WHERE categoria = 'Papelaria';`, ['18.0', '18'], 'O caderno custa 18 (a coluna é REAL, então aparece 18.0).'),
    choice('Qual a diferença entre WHERE e HAVING?', ['Nenhuma', 'WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois', 'HAVING é mais rápido', 'WHERE só funciona com números'], 1, 'HAVING atua sobre resultados agregados.'),
    fill('Complete para remover repetições:', 'SELECT ___ categoria FROM produtos;', 'DISTINCT', '`DISTINCT` elimina duplicados.'),
    bug('Qual linha causa erro?', md`
      SELECT categoria, COUNT(*)
      FROM produtos
      WHERE COUNT(*) > 1
      GROUP BY categoria;
    `, 3, 'Agregações não podem ser usadas no WHERE. Use `HAVING COUNT(*) > 1` depois do GROUP BY.'),
  ]),

  mod('joins', 'Relacionamentos e JOIN', 'Chaves primárias e estrangeiras, INNER e LEFT JOIN.', [
    lesson('Chaves e relacionamentos', md`
      Em vez de repetir dados, separamos em tabelas e as **relacionamos**:

      ~~~sql
      CREATE TABLE clientes (
          id   INTEGER PRIMARY KEY,
          nome TEXT NOT NULL
      );

      CREATE TABLE pedidos (
          id         INTEGER PRIMARY KEY,
          cliente_id INTEGER REFERENCES clientes(id),
          total      REAL
      );
      ~~~

      - **Chave primária** (\`PRIMARY KEY\`): identifica cada linha de forma única.
      - **Chave estrangeira** (\`REFERENCES\`): aponta para a chave primária de outra tabela.

      Um cliente pode ter **vários** pedidos: é um relacionamento **1 para N**.
    `, [
      choice('O que uma chave estrangeira faz?', ['Criptografa a tabela', 'Referencia a chave primária de outra tabela', 'Apaga dados duplicados', 'Ordena a tabela'], 1, 'Ela liga as tabelas.'),
    ]),
    lesson('INNER JOIN e LEFT JOIN', md`
      ~~~sql
      SELECT c.nome, p.total
      FROM pedidos p
      INNER JOIN clientes c ON c.id = p.cliente_id;
      ~~~

      - \`INNER JOIN\`: só as linhas que têm correspondência nas **duas** tabelas.
      - \`LEFT JOIN\`: **todas** as linhas da tabela da esquerda, mesmo sem correspondência (as colunas da direita vêm \`NULL\`).

      ~~~sql
      -- clientes que nunca compraram
      SELECT c.nome
      FROM clientes c
      LEFT JOIN pedidos p ON p.cliente_id = c.id
      WHERE p.id IS NULL;
      ~~~

      \`p\` e \`c\` são **apelidos** de tabela, para escrever menos.
    `, [
      predict('Qual é a saída?', `CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);
INSERT INTO clientes VALUES (1, 'Ana'), (2, 'Bia'), (3, 'Caio');
INSERT INTO pedidos VALUES (1, 1, 50), (2, 1, 30), (3, 2, 80);
SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;`, 'Caio', 'Caio não tem pedidos.'),
    ]),
  ], [
    predict('Qual é a saída?', `CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);
INSERT INTO clientes VALUES (1, 'Ana'), (2, 'Bia'), (3, 'Caio');
INSERT INTO pedidos VALUES (1, 1, 50), (2, 1, 30), (3, 2, 80);
SELECT COUNT(*) FROM pedidos p INNER JOIN clientes c ON c.id = p.cliente_id;`, '3', 'Os 3 pedidos têm cliente correspondente.'),
    predict('Qual é a saída?', `CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);
INSERT INTO clientes VALUES (1, 'Ana'), (2, 'Bia'), (3, 'Caio');
INSERT INTO pedidos VALUES (1, 1, 50), (2, 1, 30), (3, 2, 80);
SELECT SUM(p.total) FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE c.nome = 'Ana';`, ['80.0', '80'], '50 + 30.'),
    choice('Qual JOIN mantém todas as linhas da tabela da esquerda?', ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN'], 1, 'Sem correspondência, as colunas da direita ficam NULL.'),
    fill('Complete a condição de junção:', 'SELECT * FROM pedidos p JOIN clientes c ___ c.id = p.cliente_id;', 'ON', '`ON` define como as tabelas se ligam.'),
    choice('Para que serve a PRIMARY KEY?', ['Ordenar resultados', 'Identificar cada linha de forma única', 'Criar senhas', 'Ligar ao servidor'], 1, 'Não pode repetir nem ser nula.'),
  ]),

  mod('modificar', 'Criando e modificando dados', 'CREATE TABLE, INSERT, UPDATE, DELETE e transações.', [
    lesson('CREATE, INSERT, UPDATE e DELETE', md`
      ~~~sql
      CREATE TABLE tarefas (
          id        INTEGER PRIMARY KEY,
          titulo    TEXT NOT NULL,
          feita     INTEGER DEFAULT 0,
          criada_em TEXT DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO tarefas (titulo) VALUES ('Estudar SQL'), ('Lavar louça');

      UPDATE tarefas SET feita = 1 WHERE id = 1;

      DELETE FROM tarefas WHERE feita = 1;
      ~~~

      Restrições úteis: \`NOT NULL\` (obrigatório), \`UNIQUE\` (sem repetição), \`DEFAULT\` (valor padrão), \`CHECK (preco > 0)\`.

      > ⚠️ **\`UPDATE\` ou \`DELETE\` sem \`WHERE\` afeta a tabela inteira.** Antes de rodar, faça um \`SELECT\` com o mesmo \`WHERE\` para conferir quais linhas serão atingidas.
    `, [
      predict('Qual é a saída?', `CREATE TABLE t (id INTEGER PRIMARY KEY, nome TEXT, feita INTEGER DEFAULT 0);
INSERT INTO t (nome) VALUES ('a'), ('b'), ('c');
UPDATE t SET feita = 1 WHERE id <= 2;
DELETE FROM t WHERE feita = 1;
SELECT COUNT(*) FROM t;`, '1', 'As tarefas 1 e 2 foram marcadas e apagadas; sobra 1.'),
    ]),
    lesson('Transações e boas práticas', md`
      Uma **transação** agrupa comandos que devem acontecer **todos ou nenhum**:

      ~~~sql
      BEGIN;
      UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
      UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
      COMMIT;     -- confirma (ou ROLLBACK para desfazer)
      ~~~

      Se der erro no meio, \`ROLLBACK\` garante que o dinheiro não suma.

      ## Índices

      ~~~sql
      CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
      ~~~

      Índices aceleram buscas e JOINs na coluna indexada, ao custo de escritas um pouco mais lentas.

      ## SQL Injection

      > ⚠️ Nunca monte SQL juntando texto digitado pelo usuário: \`"... WHERE nome = '" + entrada + "'"\`. Alguém pode digitar \`' OR '1'='1\` e ver todos os dados. Use sempre **consultas parametrizadas** da sua linguagem (\`?\` ou \`:nome\`).

      🎉 Parabéns! Próximos passos: praticar com PostgreSQL e combinar SQL com Python para análise de dados.
    `, [
      choice('O que `ROLLBACK` faz?', ['Confirma a transação', 'Desfaz as alterações da transação', 'Apaga o banco', 'Cria um índice'], 1, 'Volta ao estado anterior ao BEGIN.'),
    ]),
  ], [
    bug('Qual comando é perigoso porque afeta todas as linhas?', md`
      SELECT * FROM clientes WHERE id = 7;
      UPDATE clientes SET ativo = 0;
      DELETE FROM clientes WHERE id = 7;
    `, 2, '`UPDATE` sem `WHERE` altera a tabela inteira.'),
    fill('Complete para inserir dados:', '___ INTO clientes (nome) VALUES (\'Lia\');', 'INSERT', '`INSERT INTO tabela (colunas) VALUES (...)`.'),
    choice('Como evitar SQL Injection?', ['Usando letras maiúsculas', 'Com consultas parametrizadas', 'Removendo espaços', 'Usando LIMIT'], 1, 'Os parâmetros nunca são interpretados como SQL.'),
    predict('Qual é a saída?', `CREATE TABLE c (id INTEGER PRIMARY KEY, saldo INTEGER);
INSERT INTO c VALUES (1, 100), (2, 50);
UPDATE c SET saldo = saldo - 30 WHERE id = 1;
UPDATE c SET saldo = saldo + 30 WHERE id = 2;
SELECT saldo FROM c WHERE id = 2;`, '80', '50 + 30.'),
    choice('Qual restrição impede valores repetidos numa coluna?', ['`NOT NULL`', '`DEFAULT`', '`UNIQUE`', '`CHECK`'], 2, '`UNIQUE` garante unicidade.'),
  ]),

  mod('avancado', 'Consultas avançadas', 'Subconsultas, CASE e funções de janela.', [
    lesson('Subconsultas e CASE', md`
      Uma **subconsulta** é um SELECT dentro de outro:

      ~~~sql
      -- produtos mais caros que a média
      SELECT nome FROM produtos
      WHERE preco > (SELECT AVG(preco) FROM produtos);
      ~~~

      \`CASE\` cria valores condicionais, como um if:

      ~~~sql
      SELECT nome,
             CASE
                 WHEN estoque = 0 THEN 'esgotado'
                 WHEN estoque < 20 THEN 'baixo'
                 ELSE 'ok'
             END AS situacao
      FROM produtos;
      ~~~
    `, [
      predict('Qual é a saída?', `${LOJA}\nSELECT COUNT(*) FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos);`, '2', 'A média é 70.1; Teclado e Mochila estão acima.'),
    ]),
    lesson('CTEs e funções de janela', md`
      **CTE** (\`WITH\`) dá nome a uma consulta intermediária e deixa tudo mais legível:

      ~~~sql
      WITH por_categoria AS (
          SELECT categoria, SUM(estoque) AS total
          FROM produtos
          GROUP BY categoria
      )
      SELECT * FROM por_categoria WHERE total > 10;
      ~~~

      **Funções de janela** calculam sobre um conjunto de linhas **sem agrupar**:

      ~~~sql
      SELECT nome, categoria, preco,
             RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS posicao
      FROM produtos;
      ~~~

      Cada produto recebe sua posição de preço **dentro** da categoria. Funções úteis: \`ROW_NUMBER\`, \`RANK\`, \`SUM(...) OVER\` (total acumulado), \`LAG\`/\`LEAD\` (linha anterior/seguinte).
    `, [
      predict('Qual é a saída?', `${LOJA}\nSELECT nome FROM (SELECT nome, RANK() OVER (PARTITION BY categoria ORDER BY preco DESC) AS r FROM produtos WHERE categoria = 'Papelaria') WHERE r = 1;`, 'Caderno', 'Na Papelaria, o mais caro é o Caderno.'),
    ]),
  ], [
    predict('Qual é a saída?', `${LOJA}\nSELECT CASE WHEN estoque = 0 THEN 'esgotado' ELSE 'disponível' END FROM produtos WHERE id = 4;`, 'esgotado', 'O produto 4 (Teclado) tem estoque 0.'),
    fill('Complete para iniciar uma CTE:', '___ resumo AS (SELECT categoria FROM produtos)\nSELECT * FROM resumo;', 'WITH', '`WITH nome AS (...)`.'),
    choice('Qual a diferença entre GROUP BY e uma função de janela?', ['Nenhuma', 'Funções de janela calculam por grupo sem juntar as linhas', 'GROUP BY é mais novo', 'Janela só funciona com texto'], 1, 'Cada linha continua no resultado.'),
    predict('Qual é a saída?', `${LOJA}\nWITH t AS (SELECT categoria, SUM(estoque) AS s FROM produtos GROUP BY categoria) SELECT categoria FROM t ORDER BY s DESC LIMIT 1;`, 'Papelaria', 'Papelaria tem 140 itens em estoque.'),
    choice('Qual função numera as linhas sequencialmente?', ['`COUNT`', '`ROW_NUMBER`', '`SUM`', '`NUMBER`'], 1, '`ROW_NUMBER() OVER (...)`.'),
  ]),
]);
