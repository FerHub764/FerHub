import { md, mod, lesson, choice, predict, fill, bug } from '../_dsl.js';

export default [
  mod('intro', 'Primeiros passos', 'Compilação, estrutura de um programa e cout.', [
    lesson('O que é C++?', md`
      C++ é uma linguagem **compilada** e de **alto desempenho**, criada por Bjarne Stroustrup nos anos 80 como uma evolução do C. Ela dá controle fino sobre memória e hardware, por isso está em:

      - motores de jogos (Unreal Engine)
      - navegadores (Chrome, Firefox)
      - sistemas embarcados, carros, robótica
      - softwares financeiros de alta frequência

      ## Compilar e executar

      ~~~bash
      g++ -std=c++20 main.cpp -o programa
      ./programa
      ~~~

      O **compilador** traduz o código inteiro para linguagem de máquina **antes** de rodar. Resultado: programas muito rápidos, mas erros de tipo aparecem já na compilação.

      > ℹ️ Nesta trilha o código não roda no navegador. Você vai praticar lendo programas, prevendo saídas e encontrando bugs. Para rodar no seu computador, instale o **g++** (MinGW no Windows) ou use um compilador online.
    `, [
      choice('O que o compilador faz?', ['Executa o código linha a linha', 'Traduz o código-fonte para linguagem de máquina antes da execução', 'Formata o código', 'Baixa bibliotecas'], 1, 'C++ é compilado: gera um executável.'),
    ]),
    lesson('Hello, world e cout', md`
      ~~~cpp
      #include <iostream>

      int main() {
          std::cout << "Olá, mundo!" << std::endl;
          return 0;
      }
      ~~~

      | Trecho | Significado |
      |---|---|
      | \`#include <iostream>\` | inclui a biblioteca de entrada/saída |
      | \`int main()\` | ponto de entrada; devolve um inteiro ao sistema |
      | \`std::cout\` | a saída padrão (console) |
      | \`<<\` | "envia" valores para o cout |
      | \`std::endl\` ou \`"\n"\` | quebra de linha |
      | \`return 0;\` | 0 = terminou sem erros |

      ## using namespace std

      Para não escrever \`std::\` toda hora, muitos exemplos usam:

      ~~~cpp
      #include <iostream>
      using namespace std;

      int main() {
          cout << "Soma: " << 2 + 3 << "\n";
      }
      ~~~

      > 💡 Em projetos grandes, prefira escrever \`std::\` explicitamente para evitar conflitos de nomes. Nos exemplos curtos daqui usaremos \`using namespace std\`.
    `, [
      predict('Qual é a saída?', 'cout << "A" << 1 + 2 << "B";', 'A3B', 'Os valores são enviados em sequência; 1 + 2 = 3.'),
      bug('Qual linha impede a compilação?', md`
        #include <iostream>
        using namespace std;
        int main() {
            cout << "Oi" << endl
            return 0;
        }
      `, 4, 'Falta o `;` no final da linha 4.'),
    ]),
  ], [
    choice('Qual biblioteca é necessária para usar `cout`?', ['`<string>`', '`<iostream>`', '`<vector>`', '`<cmath>`'], 1, '`iostream` = input/output stream.'),
    fill('Complete o operador de saída:', 'cout ___ "Olá";', '<<', '`<<` envia para a saída.'),
    predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'cout << "um" << endl << "dois" << endl;', 'um dois', '`endl` quebra a linha.'),
    choice('O que `return 0;` em `main` indica?', ['Erro grave', 'Que o programa terminou com sucesso', 'Que o programa vai recomeçar', 'Nada'], 1, 'Por convenção, 0 = sucesso.'),
    choice('Qual comando compila `main.cpp` com g++?', ['`g++ main.cpp -o programa`', '`cpp run main`', '`python main.cpp`', '`gcc --run main`'], 0, 'O `-o` define o nome do executável.'),
  ]),

  mod('tipos', 'Variáveis e entrada', 'Tipos, auto, const, cin e conversões.', [
    lesson('Tipos e variáveis', md`
      ~~~cpp
      int idade = 30;
      double preco = 19.90;
      char letra = 'Z';
      bool ativo = true;
      std::string nome = "Ana";   // precisa de #include <string>
      ~~~

      | Tipo | Guarda |
      |---|---|
      | \`int\` | inteiros |
      | \`long long\` | inteiros enormes |
      | \`double\` | decimais |
      | \`char\` | um caractere |
      | \`bool\` | \`true\` / \`false\` |
      | \`std::string\` | texto |

      ## auto e const

      ~~~cpp
      auto x = 10;        // int
      auto y = 2.5;       // double
      const int MAX = 100; // constante
      ~~~

      ## Inicialização com chaves

      O C++ moderno recomenda \`int n{5};\`. Ela impede conversões perigosas: \`int n{2.7};\` não compila, enquanto \`int n = 2.7;\` compila e vira 2 silenciosamente.

      > ⚠️ Em C++, uma variável local **não inicializada** contém lixo de memória. Sempre dê um valor inicial.
    `, [
      predict('Qual é a saída?', 'int a = 7, b = 2;\ncout << a / b << " " << a % b;', '3 1', 'Divisão inteira e resto.'),
      predict('Qual é a saída?', 'double d = 7;\ncout << d / 2;', '3.5', '`d` é double, então a divisão é decimal.'),
    ]),
    lesson('Lendo com cin e convertendo', md`
      ~~~cpp
      #include <iostream>
      #include <string>
      using namespace std;

      int main() {
          string nome;
          int idade;
          cout << "Nome: ";
          cin >> nome;          // lê até o primeiro espaço
          cout << "Idade: ";
          cin >> idade;
          cout << nome << " tem " << idade << " anos\n";
      }
      ~~~

      Para ler uma linha inteira (com espaços): \`getline(cin, nome);\`

      ## Conversões

      ~~~cpp
      int n = stoi("42");          // string → int
      double x = stod("3.14");     // string → double
      string s = to_string(99);    // número → string
      int i = static_cast<int>(9.8); // 9
      ~~~
    `, [
      fill('Complete para ler um valor do teclado:', 'int n;\ncin ___ n;', '>>', '`>>` extrai da entrada.'),
      predict('Qual é a saída?', 'string s = to_string(10) + "5";\ncout << s;', '105', 'Concatenação de strings.'),
    ]),
  ], [
    choice('Qual o valor de uma variável `int` local não inicializada?', ['0', 'Indefinido (lixo de memória)', '-1', 'Erro de compilação sempre'], 1, 'Sempre inicialize suas variáveis.'),
    predict('Qual é a saída?', 'auto x = 5;\nauto y = x * 2.0;\ncout << y / 4;', '2.5', '`y` é double (10.0); 10 / 4 = 2.5.'),
    fill('Complete para converter texto em inteiro:', 'int n = ___("123");', 'stoi', '`stoi` = string to int.'),
    bug('Qual linha não compila?', md`
      const int LIMITE = 10;
      int atual = 3;
      atual = 5;
      LIMITE = 20;
    `, 4, 'Não é possível alterar uma `const`.'),
    predict('Qual é a saída?', 'int i = static_cast<int>(3.99);\ncout << i;', '3', 'A conversão para int descarta a parte decimal.'),
    choice('Para ler uma linha inteira com espaços, use:', ['`cin >> s`', '`getline(cin, s)`', '`read(s)`', '`cin.line(s)`'], 1, '`cin >>` para no primeiro espaço.'),
  ]),

  mod('controle', 'Controle de fluxo', 'if, switch e laços.', [
    lesson('if, else e switch', md`
      ~~~cpp
      int temp = 28;
      if (temp > 30) {
          cout << "Quente\n";
      } else if (temp >= 20) {
          cout << "Agradável\n";
      } else {
          cout << "Frio\n";
      }
      ~~~

      Operadores: \`== != < > <= >=\` e lógicos \`&& || !\`.

      ## switch

      ~~~cpp
      char op = '+';
      switch (op) {
          case '+': cout << "soma"; break;
          case '-': cout << "subtração"; break;
          default:  cout << "desconhecido";
      }
      ~~~

      O \`switch\` em C++ só funciona com tipos inteiros e \`char\` (não com \`string\`). Sem \`break\`, a execução continua no próximo \`case\`.

      > ⚠️ Cuidado com \`if (x = 5)\`: isso **atribui** 5 a \`x\` e a condição vira verdadeira. O certo é \`==\`.
    `, [
      predict('Qual é a saída?', 'int x = 0;\nif (x = 5) cout << "sim " << x;\nelse cout << "não";', 'sim 5', 'O `=` atribuiu 5 (verdadeiro). Um erro clássico!'),
    ]),
    lesson('Laços', md`
      ~~~cpp
      for (int i = 0; i < 3; i++) {
          cout << i << " ";
      }
      // 0 1 2

      int n = 1;
      while (n < 50) n *= 3;
      cout << n;  // 81

      int senha;
      do {
          cin >> senha;
      } while (senha != 1234);
      ~~~

      ## Range-based for

      Para percorrer todos os elementos de uma coleção:

      ~~~cpp
      int numeros[] = {4, 8, 15};
      for (int x : numeros) {
          cout << x << "\n";
      }
      ~~~

      \`break\` sai do laço; \`continue\` pula para a próxima volta.
    `, [
      predict('Qual é a saída?', 'int s = 0;\nfor (int i = 1; i <= 5; i += 2) s += i;\ncout << s;', '9', '1 + 3 + 5 = 9.'),
      predict('Qual é a saída?', 'for (int i = 0; i < 10; i++) {\n    if (i == 2) continue;\n    if (i == 5) break;\n    cout << i;\n}', '0134', 'Pula o 2 e para no 5.'),
    ]),
  ], [
    predict('Qual é a saída?', 'int a = 4;\ncout << (a % 2 == 0 ? "par" : "ímpar");', 'par', '4 é divisível por 2.'),
    choice('Com quais tipos o `switch` do C++ funciona?', ['Qualquer tipo', 'Inteiros, char e enums', 'Só string', 'Só double'], 1, 'Não funciona com string ou double.'),
    bug('O laço deveria imprimir 1 a 3. Qual linha tem o erro?', md`
      int i = 1;
      while (i <= 3); {
          cout << i;
          i++;
      }
    `, 2, 'O `;` logo após o `while (...)` cria um laço vazio infinito.'),
    predict('Qual é a saída?', 'int v[] = {2, 4, 6};\nint t = 0;\nfor (int x : v) t += x;\ncout << t;', '12', '2 + 4 + 6.'),
    fill('Complete para sair do laço:', 'while (true) {\n    if (fim) ___;\n}', 'break', '`break` encerra o laço.'),
  ]),

  mod('funcoes', 'Funções', 'Declaração, referências, valores padrão e sobrecarga.', [
    lesson('Criando funções', md`
      ~~~cpp
      #include <iostream>
      using namespace std;

      int quadrado(int x) {
          return x * x;
      }

      void saudar(string nome) {
          cout << "Olá, " << nome << "\n";
      }

      int main() {
          cout << quadrado(5) << "\n";
          saudar("Rui");
      }
      ~~~

      Funções precisam ser **declaradas antes** de serem usadas. Se quiser escrevê-las depois do \`main\`, coloque um **protótipo** antes:

      ~~~cpp
      int quadrado(int x);   // protótipo

      int main() { cout << quadrado(3); }

      int quadrado(int x) { return x * x; }
      ~~~

      ## Valores padrão e sobrecarga

      ~~~cpp
      double potencia(double b, int e = 2) { /* ... */ }
      int maior(int a, int b) { return a > b ? a : b; }
      double maior(double a, double b) { return a > b ? a : b; }
      ~~~
    `, [
      predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nint f(int a, int b = 10) { return a * b; }\nint main() {\n    cout << f(2) << " " << f(2, 3);\n}', '20 6', 'Sem o segundo argumento, b = 10.'),
    ]),
    lesson('Passagem por valor e por referência', md`
      Por padrão, a função recebe uma **cópia**:

      ~~~cpp
      void dobrar(int n) { n *= 2; }

      int x = 5;
      dobrar(x);
      cout << x; // 5 — o original não mudou
      ~~~

      Com \`&\`, o parâmetro vira uma **referência** (um apelido) para a variável original:

      ~~~cpp
      void dobrar(int& n) { n *= 2; }

      int x = 5;
      dobrar(x);
      cout << x; // 10
      ~~~

      ## const &: eficiente e seguro

      Copiar objetos grandes (como \`string\` ou \`vector\`) custa tempo. Passe por **referência constante**: sem cópia e sem risco de alterar:

      ~~~cpp
      void imprimir(const string& texto) {
          cout << texto << "\n";
      }
      ~~~

      > 💡 Regra prática: tipos pequenos (\`int\`, \`double\`) por valor; objetos grandes por \`const&\`; use \`&\` sem const só quando a função **deve** alterar o argumento.
    `, [
      predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nvoid troca(int& a, int& b) { int t = a; a = b; b = t; }\nint main() {\n    int x = 1, y = 2;\n    troca(x, y);\n    cout << x << y;\n}', '21', 'Com referências, a função troca os valores originais.'),
      fill('Complete para receber o parâmetro por referência:', 'void zerar(int___ n) { n = 0; }', '&', '`int& n` é uma referência.'),
    ]),
  ], [
    predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nvoid inc(int n) { n++; }\nint main() {\n    int a = 3;\n    inc(a);\n    cout << a;\n}', '3', 'Passagem por valor: a cópia foi incrementada, não `a`.'),
    choice('Por que passar uma `string` grande como `const string&`?', ['Para alterar a string', 'Para evitar cópia e impedir alteração', 'Porque é obrigatório', 'Para converter em número'], 1, 'Eficiente e seguro.'),
    bug('Qual linha não compila?', md`
      #include <iostream>
      int main() {
          std::cout << triplo(3);
      }
      int triplo(int x) { return x * 3; }
    `, 3, '`triplo` é usado antes de ser declarado. Falta um protótipo antes do `main`.'),
    predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nint maior(int a, int b) { return a > b ? a : b; }\ndouble maior(double a, double b) { return a > b ? a : b; }\nint main() {\n    cout << maior(3, 9) << " " << maior(2.5, 1.5);\n}', '9 2.5', 'Sobrecarga: o compilador escolhe pela assinatura.'),
    choice('O que é um protótipo de função?', ['Uma função vazia', 'A declaração da assinatura antes da definição', 'Uma função recursiva', 'Uma macro'], 1, 'Permite usar a função antes de defini-la.'),
  ]),
];
