import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'c',
  name: 'C',
  short: 'C',
  color: '#9fb3c8',
  level: 'extra',
  lang: 'c',
  category: 'Sistemas',
  tagline: 'A mãe das linguagens modernas. Entenda o computador por dentro.',
  description: 'printf, tipos, controle de fluxo, funções, arrays, strings, ponteiros, memória dinâmica e structs.',
}, [
  mod('intro', 'Primeiros passos', 'Compilação, main e printf.', [
    lesson('Por que aprender C?', md`
      C foi criada em 1972 para escrever o sistema operacional Unix. Até hoje, **Linux, Windows, bancos de dados, Python e Git** têm partes escritas em C. Aprender C mostra como o computador realmente funciona: memória, endereços, bytes.

      ~~~c
      #include <stdio.h>

      int main(void) {
          printf("Olá, mundo!\n");
          return 0;
      }
      ~~~

      - \`#include <stdio.h>\`: biblioteca de entrada/saída (*standard input/output*).
      - \`int main(void)\`: ponto de entrada do programa.
      - \`printf\`: imprime texto formatado. **Não** pula linha sozinho: use \`\n\`.
      - \`return 0\`: terminou com sucesso.

      ~~~bash
      gcc main.c -o programa
      ./programa
      ~~~

      > ℹ️ Nesta trilha você pratica lendo código e prevendo saídas. Para rodar no seu computador, instale o **gcc** (no Windows, via MinGW ou WSL).
    `, [
      predict('Qual é a saída?', 'printf("A");\nprintf("B\\n");\nprintf("C");', ['AB C'], '`printf` só quebra a linha onde houver `\\n`.'),
    ]),
    lesson('printf e formatos', md`
      \`printf\` usa **especificadores** para encaixar valores no texto:

      | Especificador | Tipo |
      |---|---|
      | \`%d\` | \`int\` |
      | \`%f\` | \`double\`/\`float\` |
      | \`%.2f\` | decimal com 2 casas |
      | \`%c\` | \`char\` |
      | \`%s\` | string (texto) |
      | \`%%\` | o próprio símbolo % |

      ~~~c
      int idade = 20;
      double altura = 1.756;
      printf("Idade: %d, altura: %.2f\n", idade, altura);
      // Idade: 20, altura: 1.76
      ~~~

      > ⚠️ O especificador precisa combinar com o tipo. \`printf("%d", 3.5)\` imprime lixo — o compilador costuma avisar, mas não impede.
    `, [
      predict('Qual é a saída?', 'printf("%d + %d = %d", 2, 3, 2 + 3);', '2 + 3 = 5', 'Cada `%d` recebe um argumento, na ordem.'),
      fill('Complete para imprimir um decimal com 1 casa:', 'printf("%___", 3.14159);', '.1f', '`%.1f` mostra 3.1.'),
    ]),
  ], [
    choice('Qual biblioteca contém `printf`?', ['`<stdlib.h>`', '`<stdio.h>`', '`<string.h>`', '`<math.h>`'], 1, 'stdio = standard input/output.'),
    predict('Qual é a saída?', 'printf("%.2f", 10.0 / 4);', '2.50', '10.0 / 4 = 2.5, mostrado com 2 casas.'),
    predict('Qual é a saída?', 'printf("%c%c", \'O\', \'K\');', 'OK', '`%c` imprime um caractere.'),
    choice('Qual comando compila `main.c` com gcc?', ['`gcc main.c -o programa`', '`c main.c`', '`run main.c`', '`gcc --exec main.c`'], 0, '`-o` define o nome do executável.'),
    bug('Qual linha não compila?', md`
      #include <stdio.h>
      int main(void) {
          printf("Oi\n")
          return 0;
      }
    `, 3, 'Falta `;` no fim da linha 3.'),
  ]),

  mod('tipos', 'Tipos e entrada', 'int, float, char, scanf e operadores.', [
    lesson('Tipos básicos', md`
      | Tipo | Tamanho típico | Exemplo |
      |---|---|---|
      | \`char\` | 1 byte | \`'a'\` |
      | \`int\` | 4 bytes | \`42\` |
      | \`long long\` | 8 bytes | \`9000000000LL\` |
      | \`float\` | 4 bytes | \`3.14f\` |
      | \`double\` | 8 bytes | \`3.14\` |

      \`sizeof\` mostra o tamanho em bytes: \`printf("%zu", sizeof(int));\`

      ## C não tem string nem bool "de verdade"

      - Texto é um **array de char** terminado em \`'\0'\`.
      - Booleanos: \`0\` é falso, qualquer outro número é verdadeiro. Com \`#include <stdbool.h>\` você ganha \`bool\`, \`true\` e \`false\`.

      ## Divisão inteira

      ~~~c
      printf("%d\n", 7 / 2);     // 3
      printf("%.1f\n", 7 / 2.0); // 3.5
      printf("%d\n", 7 % 2);     // 1
      ~~~
    `, [
      predict('Qual é a saída?', 'int a = 17, b = 5;\nprintf("%d %d", a / b, a % b);', '3 2', '17 = 5 × 3 + 2.'),
    ]),
    lesson('Lendo com scanf', md`
      ~~~c
      int idade;
      double peso;
      printf("Idade: ");
      scanf("%d", &idade);
      printf("Peso: ");
      scanf("%lf", &peso);
      printf("%d anos, %.1f kg\n", idade, peso);
      ~~~

      - O \`&\` antes da variável passa o **endereço** dela, para o \`scanf\` poder escrever lá. Esquecê-lo é um erro muito comum.
      - Para \`double\` no \`scanf\`, use \`%lf\`.

      ~~~c
      char nome[50];
      scanf("%49s", nome);   // arrays já são endereços: sem &
      ~~~

      > ⚠️ \`%s\` lê só até o primeiro espaço e, sem limite (\`%49s\`), pode estourar o array. Para linhas inteiras use \`fgets(nome, 50, stdin)\`.
    `, [
      bug('Qual linha tem o erro que faz o programa travar ou ler errado?', md`
        int n;
        printf("Digite: ");
        scanf("%d", n);
        printf("%d\n", n * 2);
      `, 3, 'Falta o `&`: `scanf("%d", &n);`.'),
    ]),
  ], [
    choice('Como o C representa texto?', ['Tipo `string`', 'Array de `char` terminado em `\'\\0\'`', 'Tipo `text`', 'Lista de inteiros'], 1, 'Strings em C são arrays de char com terminador nulo.'),
    fill('Complete o especificador do scanf para `double`:', 'scanf("%___", &peso);', 'lf', '`%lf` para double no scanf.'),
    predict('Qual é a saída?', 'printf("%d", 10 / 3 * 3);', '9', '10 / 3 = 3 (inteiro); 3 × 3 = 9.'),
    choice('Em C puro (sem stdbool.h), qual valor é considerado falso?', ['-1', '0', '1', '"false"'], 1, 'Apenas 0 é falso.'),
    predict('Qual é a saída?', 'char c = \'A\' + 2;\nprintf("%c", c);', 'C', 'Caracteres são números: A (65) + 2 = C (67).'),
  ]),

  mod('controle', 'Controle de fluxo', 'if, switch, for, while e do-while.', [
    lesson('Decisões', md`
      ~~~c
      int nota = 75;
      if (nota >= 90) {
          printf("A\n");
      } else if (nota >= 70) {
          printf("B\n");
      } else {
          printf("C\n");
      }
      ~~~

      ~~~c
      switch (opcao) {
          case 1: printf("Novo\n"); break;
          case 2: printf("Abrir\n"); break;
          default: printf("Inválido\n");
      }
      ~~~

      Operadores: \`== != < > <= >=\`, \`&&\` (e), \`||\` (ou), \`!\` (não).

      > ⚠️ \`if (x = 0)\` atribui 0 e nunca entra no if. Alguns programadores escrevem \`if (0 == x)\` para que o erro de digitação vire erro de compilação.
    `, [
      predict('Qual é a saída?', 'int x = 4;\nif (x > 2 && x < 4) printf("A");\nelse if (x == 4) printf("B");\nelse printf("C");', 'B', 'x < 4 é falso; x == 4 é verdadeiro.'),
    ]),
    lesson('Laços', md`
      ~~~c
      for (int i = 0; i < 5; i++) {
          printf("%d ", i);
      }
      // 0 1 2 3 4

      int n = 100;
      while (n > 1) {
          n /= 2;
      }

      int opcao;
      do {
          printf("1-Jogar 0-Sair: ");
          scanf("%d", &opcao);
      } while (opcao != 0);
      ~~~

      \`break\` sai do laço; \`continue\` vai para a próxima volta.
    `, [
      predict('Qual é a saída?', 'int n = 100, passos = 0;\nwhile (n > 1) {\n    n /= 2;\n    passos++;\n}\nprintf("%d", passos);', '6', '100 → 50 → 25 → 12 → 6 → 3 → 1: seis divisões.'),
    ]),
  ], [
    predict('Qual é a saída?', 'for (int i = 3; i > 0; i--) printf("%d", i);', '321', 'Contagem regressiva.'),
    predict('Qual é a saída?', 'int s = 0;\nfor (int i = 1; i <= 10; i++) {\n    if (i % 3 != 0) continue;\n    s += i;\n}\nprintf("%d", s);', '18', '3 + 6 + 9 = 18.'),
    choice('Qual laço sempre executa pelo menos uma vez?', ['`for`', '`while`', '`do-while`', 'Nenhum'], 2, 'A condição é testada no final.'),
    bug('Qual linha faz o bloco do if nunca executar?', md`
      int erros = 0;
      erros++;
      if (erros = 0) {
          printf("Sem erros\n");
      }
    `, 3, '`erros = 0` é atribuição (valor 0, falso). O certo é `erros == 0`.'),
    fill('Complete para sair do switch após o case:', 'case 1:\n    printf("um");\n    ___;', 'break', 'Sem `break`, cai no próximo case.'),
  ]),

  mod('funcoes-arrays', 'Funções, arrays e strings', 'Funções, arrays e manipulação de texto.', [
    lesson('Funções', md`
      ~~~c
      #include <stdio.h>

      int maior(int a, int b);   // protótipo

      int main(void) {
          printf("%d\n", maior(3, 9));
          return 0;
      }

      int maior(int a, int b) {
          return a > b ? a : b;
      }
      ~~~

      - Funções precisam ser **declaradas antes** do uso (por isso o protótipo).
      - \`void\` como retorno = não devolve nada.
      - Argumentos são passados **por valor** (cópia).

      ## Recursão

      ~~~c
      int fatorial(int n) {
          if (n <= 1) return 1;
          return n * fatorial(n - 1);
      }
      ~~~
    `, [
      predict('Qual é a saída?', '#include <stdio.h>\nint f(int n) {\n    if (n == 0) return 0;\n    return n + f(n - 1);\n}\nint main(void) {\n    printf("%d", f(4));\n    return 0;\n}', '10', '4 + 3 + 2 + 1 + 0.'),
    ]),
    lesson('Arrays e strings', md`
      ~~~c
      int notas[4] = {7, 8, 10, 6};
      int soma = 0;
      for (int i = 0; i < 4; i++) soma += notas[i];
      printf("Média: %.2f\n", soma / 4.0);
      ~~~

      > ⚠️ C **não verifica limites**: \`notas[10]\` compila e lê memória de outra coisa. Bugs assim viram falhas de segurança.

      ## Strings

      ~~~c
      #include <string.h>

      char nome[20] = "Ana";        // {'A','n','a','\0', ...}
      printf("%zu\n", strlen(nome)); // 3
      strcat(nome, " Lima");         // concatena
      char copia[20];
      strcpy(copia, nome);           // copia
      if (strcmp(nome, copia) == 0) printf("iguais\n");
      ~~~

      Strings não se comparam com \`==\` (isso compara endereços). Use \`strcmp\`, que devolve 0 quando são iguais.
    `, [
      predict('Qual é a saída?', 'char s[10] = "casa";\nprintf("%zu %c", strlen(s), s[3]);', '4 a', 'strlen = 4 e o índice 3 é "a".'),
      fill('Complete para comparar duas strings:', 'if (___(a, b) == 0) printf("iguais");', 'strcmp', '`strcmp` retorna 0 se iguais.'),
    ]),
  ], [
    choice('Por que usar protótipos de função?', ['Para deixar o código mais rápido', 'Para declarar a função antes de usá-la', 'Para criar variáveis globais', 'Não servem para nada'], 1, 'O compilador lê o arquivo de cima para baixo.'),
    predict('Qual é a saída?', 'int v[5] = {1, 2};\nprintf("%d", v[0] + v[1] + v[4]);', '3', 'Elementos não informados na inicialização valem 0.'),
    bug('Qual linha compara strings do jeito errado?', md`
      char a[10] = "oi";
      char b[10] = "oi";
      if (a == b) printf("iguais\n");
      if (strcmp(a, b) == 0) printf("iguais de verdade\n");
    `, 3, '`a == b` compara endereços. Use `strcmp`.'),
    predict('Qual é a saída?', 'char s[] = "abc";\nprintf("%zu", sizeof(s));', '4', 'Três letras + o terminador `\\0`.'),
    choice('O que acontece ao acessar um índice fora do array em C?', ['Erro de compilação', 'Exceção tratada automaticamente', 'Comportamento indefinido (lê/escreve memória alheia)', 'Retorna 0'], 2, 'C não verifica limites.'),
  ]),

  mod('ponteiros', 'Ponteiros', 'Endereços, desreferência e passagem por referência.', [
    lesson('Ponteiros', md`
      ~~~c
      int x = 10;
      int *p = &x;      // p guarda o endereço de x

      printf("%d\n", *p); // 10 — valor no endereço
      *p = 20;            // muda x
      printf("%d\n", x);  // 20
      ~~~

      | Expressão | Significado |
      |---|---|
      | \`&x\` | endereço de x |
      | \`int *p\` | p é um ponteiro para int |
      | \`*p\` | valor no endereço guardado em p |
      | \`NULL\` | ponteiro que não aponta para nada |

      ## Arrays e ponteiros

      O nome de um array funciona como ponteiro para o primeiro elemento:

      ~~~c
      int v[3] = {5, 6, 7};
      int *q = v;
      printf("%d\n", *(q + 1)); // 6
      ~~~
    `, [
      predict('Qual é a saída?', 'int a = 3;\nint *p = &a;\n*p = *p * 5;\nprintf("%d", a);', '15', 'Mudar `*p` muda `a`.'),
    ]),
    lesson('Passagem por referência', md`
      Como C passa argumentos por valor, para uma função alterar uma variável do chamador, você passa o **endereço**:

      ~~~c
      void trocar(int *a, int *b) {
          int tmp = *a;
          *a = *b;
          *b = tmp;
      }

      int main(void) {
          int x = 1, y = 2;
          trocar(&x, &y);
          printf("%d %d\n", x, y); // 2 1
      }
      ~~~

      É exatamente por isso que o \`scanf\` precisa do \`&\`: ele recebe o endereço para escrever o valor lido.
    `, [
      predict('Qual é a saída?', '#include <stdio.h>\nvoid dobra(int *n) { *n = *n * 2; }\nint main(void) {\n    int v = 21;\n    dobra(&v);\n    printf("%d", v);\n    return 0;\n}', '42', 'A função alterou `v` através do ponteiro.'),
    ]),
  ], [
    fill('Complete para declarar um ponteiro para int:', 'int ___p = &x;', '*', '`int *p`.'),
    predict('Qual é a saída?', 'int v[] = {10, 20, 30, 40};\nint *p = v + 2;\nprintf("%d %d", *p, p[1]);', '30 40', '`p` aponta para o índice 2; `p[1]` é o índice 3.'),
    choice('Para uma função alterar uma variável do chamador em C, você passa:', ['Uma cópia', 'O endereço da variável', 'O nome como string', 'Não é possível'], 1, 'Ponteiros permitem a alteração.'),
    bug('Qual linha provavelmente trava o programa?', md`
      int *p = NULL;
      int y = 5;
      p = NULL;
      printf("%d", *p);
    `, 4, 'Desreferenciar `NULL` causa falha de segmentação.'),
    predict('Qual é a saída?', 'int a = 1, b = 2;\nint *p = &a;\np = &b;\n*p = 9;\nprintf("%d%d", a, b);', '19', '`p` passou a apontar para `b`.'),
  ]),

  mod('memoria', 'Memória dinâmica e structs', 'malloc, free e tipos compostos.', [
    lesson('malloc e free', md`
      Quando o tamanho só é conhecido em tempo de execução, aloque no **heap**:

      ~~~c
      #include <stdlib.h>

      int n = 5;
      int *v = malloc(n * sizeof(int));
      if (v == NULL) {
          printf("Sem memória!\n");
          return 1;
      }
      for (int i = 0; i < n; i++) v[i] = i * i;
      free(v);       // devolve a memória
      v = NULL;      // evita usar por engano
      ~~~

      | Função | Faz |
      |---|---|
      | \`malloc(bytes)\` | aloca (conteúdo com lixo) |
      | \`calloc(n, tam)\` | aloca e zera |
      | \`realloc(p, bytes)\` | muda o tamanho |
      | \`free(p)\` | libera |

      > ⚠️ Toda alocação precisa de exatamente **um** \`free\`. Esquecer = vazamento; liberar duas vezes ou usar depois = bug grave.
    `, [
      choice('O que acontece se você nunca chamar `free` para memória alocada com `malloc`?', ['Nada', 'Vazamento de memória', 'Erro de compilação', 'A memória é zerada'], 1, 'A memória fica reservada até o programa terminar.'),
    ]),
    lesson('structs', md`
      \`struct\` agrupa campos de tipos diferentes:

      ~~~c
      typedef struct {
          char nome[30];
          int idade;
          double nota;
      } Aluno;

      Aluno a = {"Bia", 20, 9.5};
      printf("%s tem %d anos\n", a.nome, a.idade);

      Aluno *p = &a;
      p->nota = 10.0;          // -> acessa campo via ponteiro
      printf("%.1f\n", a.nota);
      ~~~

      - \`typedef\` cria um apelido, permitindo escrever \`Aluno\` em vez de \`struct Aluno\`.
      - Com variável: \`a.campo\`. Com ponteiro: \`p->campo\` (atalho para \`(*p).campo\`).

      🎉 Com isso você domina a base do C. Daqui, um ótimo passo é estudar **estruturas de dados** (listas ligadas, pilhas, árvores) — todas construídas com structs e ponteiros.
    `, [
      predict('Qual é a saída?', 'typedef struct { int x, y; } Ponto;\nPonto p = {3, 4};\nPonto *q = &p;\nq->x = 10;\nprintf("%d", p.x + p.y);', '14', '`q->x` alterou `p.x` para 10.'),
      fill('Complete para acessar um campo através de ponteiro:', 'aluno___idade = 21;', '->', 'Com ponteiros use `->`.'),
    ]),
  ], [
    fill('Complete para liberar a memória:', 'int *v = malloc(10 * sizeof(int));\n___(v);', 'free', '`free` devolve a memória ao sistema.'),
    choice('Qual função aloca e já zera a memória?', ['`malloc`', '`calloc`', '`realloc`', '`free`'], 1, '`calloc` inicializa com zeros.'),
    predict('Qual é a saída?', 'typedef struct { char nome[10]; int pts; } J;\nJ a = {"Rui", 7};\nJ b = a;\nb.pts = 99;\nprintf("%d", a.pts);', '7', 'Atribuir struct copia os campos; `a` não muda.'),
    bug('Qual linha usa memória já liberada?', md`
      int *p = malloc(sizeof(int));
      *p = 5;
      free(p);
      printf("%d", *p);
    `, 4, 'Usar `p` depois de `free` é comportamento indefinido (*use after free*).'),
    choice('Por que checar se `malloc` retornou `NULL`?', ['Porque sempre retorna NULL', 'Porque a alocação pode falhar por falta de memória', 'Para liberar mais rápido', 'Não é necessário'], 1, 'Programas robustos verificam a alocação.'),
  ]),
]);
