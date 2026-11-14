import { md, mod, lesson, choice, predict, fill, bug } from '../_dsl.js';

export default [
  mod('colecoes', 'Vetores e strings', 'std::vector, arrays e std::string.', [
    lesson('std::vector', md`
      \`vector\` é um array **dinâmico**: cresce e encolhe conforme a necessidade. É a coleção mais usada em C++.

      ~~~cpp
      #include <vector>

      vector<int> notas = {7, 9, 6};
      notas.push_back(10);            // adiciona no fim
      cout << notas.size() << "\n";   // 4
      cout << notas[0] << "\n";       // 7
      cout << notas.back() << "\n";   // 10
      notas.pop_back();               // remove o último

      for (int n : notas) cout << n << " ";
      ~~~

      > ⚠️ \`notas[10]\` num vetor de 4 elementos é **comportamento indefinido**: pode imprimir lixo ou travar. Use \`notas.at(10)\`, que verifica o limite e lança uma exceção.

      ## Arrays estilo C

      \`int v[5];\` tem tamanho fixo e não sabe o próprio tamanho. Em código moderno, prefira \`vector\` ou \`std::array\`.
    `, [
      predict('Qual é a saída?', 'vector<int> v = {1, 2, 3};\nv.push_back(4);\nv.pop_back();\nv.push_back(9);\ncout << v.size() << " " << v.back();', '4 9', '[1, 2, 3, 9].'),
    ]),
    lesson('std::string', md`
      ~~~cpp
      #include <string>

      string s = "Programar";
      cout << s.size() << "\n";           // 9
      cout << s[0] << "\n";               // P
      cout << s.substr(0, 3) << "\n";     // Pro
      s += " em C++";                     // concatena
      cout << s.find("C++") << "\n";      // 13
      if (s.find("Java") == string::npos) {
          cout << "não achou\n";
      }
      ~~~

      | Método | Faz |
      |---|---|
      | \`size()\` / \`length()\` | tamanho |
      | \`substr(pos, n)\` | pedaço com \`n\` caracteres |
      | \`find(x)\` | posição ou \`string::npos\` |
      | \`replace(pos, n, x)\` | troca trecho |
      | \`empty()\` | está vazia? |

      Strings em C++ são **mutáveis**: \`s[0] = 'p';\` altera a própria string.
    `, [
      predict('Qual é a saída?', 'string s = "computador";\ncout << s.substr(3, 4);', 'puta', 'A partir do índice 3, pega 4 caracteres.'),
      predict('Qual é a saída?', 'string s = "gato";\ns[0] = \'r\';\ncout << s;', 'rato', 'Strings em C++ são mutáveis.'),
    ]),
  ], [
    fill('Complete para adicionar ao final do vector:', 'v.___(42);', 'push_back', '`push_back` adiciona no fim.'),
    predict('Qual é a saída?', 'vector<string> n = {"a", "b", "c"};\ncout << n.size() + n[1].size();', '4', '3 elementos + tamanho de "b" (1).'),
    choice('O que `s.find("x")` devolve quando não encontra?', ['-1', '0', '`string::npos`', 'Lança exceção'], 2, 'Compare com `string::npos`.'),
    choice('Qual a vantagem de `v.at(i)` sobre `v[i]`?', ['É mais rápido', 'Verifica o limite e lança exceção', 'Aceita índices negativos', 'Não há diferença'], 1, '`at` faz verificação de limites.'),
    predict('Qual é a saída?', 'vector<int> v(3, 7);\nint t = 0;\nfor (int x : v) t += x;\ncout << t;', '21', '`vector<int> v(3, 7)` cria três 7s.'),
    bug('Qual linha tem comportamento indefinido?', md`
      vector<int> v = {10, 20, 30};
      cout << v[0];
      cout << v.at(2);
      cout << v[3];
    `, 4, 'O índice 3 está fora do vetor de 3 elementos.'),
  ]),

  mod('ponteiros', 'Ponteiros e memória', 'Endereços, ponteiros, heap e smart pointers.', [
    lesson('Endereços e ponteiros', md`
      Toda variável mora num **endereço** de memória. Um **ponteiro** é uma variável que guarda um endereço.

      ~~~cpp
      int idade = 30;
      int* p = &idade;     // p guarda o endereço de idade

      cout << p << "\n";    // algo como 0x7ffd5c3a (o endereço)
      cout << *p << "\n";   // 30 — o valor apontado
      *p = 31;              // altera idade através do ponteiro
      cout << idade;        // 31
      ~~~

      | Símbolo | Lê-se | Faz |
      |---|---|---|
      | \`&x\` | "endereço de x" | obtém o endereço |
      | \`int* p\` | "p é ponteiro para int" | declara |
      | \`*p\` | "o valor apontado por p" | desreferencia |

      ## nullptr

      Um ponteiro que não aponta para nada deve valer \`nullptr\`. **Desreferenciar \`nullptr\` derruba o programa.**

      ~~~cpp
      int* q = nullptr;
      if (q != nullptr) cout << *q;
      ~~~
    `, [
      predict('Qual é a saída?', 'int a = 5;\nint* p = &a;\n*p = *p + 10;\ncout << a;', '15', 'Alterar `*p` altera `a`.'),
      fill('Complete para obter o endereço de `x`:', 'int* p = ___x;', '&', '`&x` = endereço de x.'),
    ]),
    lesson('Heap, new/delete e smart pointers', md`
      Variáveis locais ficam na **pilha** (*stack*) e somem ao fim da função. Para dados que precisam viver mais, existe o **heap**:

      ~~~cpp
      int* p = new int(42);   // aloca no heap
      cout << *p;
      delete p;               // libera — obrigatório!
      ~~~

      Esquecer o \`delete\` causa **vazamento de memória** (*memory leak*). Usar o ponteiro depois do \`delete\` causa bugs graves.

      ## Smart pointers: o jeito moderno

      Eles liberam a memória **automaticamente** quando saem de escopo:

      ~~~cpp
      #include <memory>

      auto p = std::make_unique<int>(42);   // dono único
      cout << *p;
      // sem delete: liberado sozinho no fim do escopo

      auto s1 = std::make_shared<string>("oi");  // dono compartilhado
      auto s2 = s1;   // contagem de referências = 2
      ~~~

      > 💡 Em C++ moderno quase nunca se escreve \`new\`/\`delete\` diretamente. Use \`vector\`, \`string\` e smart pointers. Esse princípio se chama **RAII**: o recurso é liberado quando o objeto é destruído.
    `, [
      choice('O que acontece se você usa `new` e nunca chama `delete`?', ['Nada', 'Vazamento de memória', 'Erro de compilação', 'O programa fica mais rápido'], 1, 'A memória fica ocupada até o programa terminar.'),
      choice('Qual é a forma moderna de criar um objeto no heap com dono único?', ['`malloc`', '`new` + `delete`', '`std::make_unique`', '`static`'], 2, '`unique_ptr` libera automaticamente.'),
    ]),
  ], [
    predict('Qual é a saída?', 'int v = 8;\nint* p = &v;\nint** pp = &p;\n**pp = 3;\ncout << v;', '3', '`pp` aponta para `p`, que aponta para `v`.'),
    choice('O que `*p` significa quando `p` é um ponteiro?', ['O endereço de p', 'O valor guardado no endereço apontado', 'Multiplicação', 'Um ponteiro nulo'], 1, 'É a desreferência.'),
    bug('Qual linha provavelmente derruba o programa?', md`
      int* p = nullptr;
      int x = 10;
      cout << x;
      cout << *p;
    `, 4, 'Desreferenciar `nullptr` causa falha de segmentação.'),
    choice('Onde ficam variáveis locais de uma função?', ['No heap', 'Na pilha (stack)', 'No disco', 'Na GPU'], 1, 'Elas são destruídas quando a função termina.'),
    fill('Complete a liberação de memória alocada com `new`:', 'int* p = new int(5);\n___ p;', 'delete', '`delete` libera o que `new` alocou.'),
    predict('Qual é a saída?', 'int arr[] = {10, 20, 30};\nint* p = arr;\ncout << *(p + 2);', '30', 'Aritmética de ponteiros: p + 2 aponta para o terceiro elemento.'),
  ]),

  mod('classes', 'Classes', 'Classes, construtores, encapsulamento e destrutores.', [
    lesson('Classes e objetos', md`
      ~~~cpp
      class Conta {
      private:
          string titular;
          double saldo = 0;

      public:
          Conta(string t) : titular(t) {}   // construtor com lista de inicialização

          void depositar(double v) {
              if (v > 0) saldo += v;
          }

          double getSaldo() const { return saldo; }
      };

      int main() {
          Conta c("Rita");
          c.depositar(100);
          cout << c.getSaldo();   // 100
      }
      ~~~

      - Membros em \`private:\` só são acessíveis pela própria classe.
      - \`: titular(t)\` é a **lista de inicialização**: forma preferida de inicializar atributos.
      - \`const\` depois do método promete que ele **não altera** o objeto.
      - Repare no \`;\` depois da chave final da classe — esquecê-lo é um erro clássico.

      > ℹ️ \`struct\` é igual a \`class\`, mas com membros \`public\` por padrão. Costuma ser usada para dados simples.
    `, [
      predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nclass Contador {\n    int n = 0;\npublic:\n    void inc() { n++; }\n    int valor() const { return n; }\n};\nint main() {\n    Contador c;\n    c.inc(); c.inc(); c.inc();\n    cout << c.valor();\n}', '3', 'Três incrementos.'),
    ]),
    lesson('Construtores, destrutores e RAII', md`
      O **destrutor** (\`~NomeDaClasse\`) roda automaticamente quando o objeto deixa de existir:

      ~~~cpp
      class Arquivo {
      public:
          Arquivo()  { cout << "abriu\n"; }
          ~Arquivo() { cout << "fechou\n"; }
      };

      int main() {
          {
              Arquivo a;
              cout << "usando\n";
          }   // a é destruído aqui
          cout << "fim\n";
      }
      ~~~

      ~~~text
      abriu
      usando
      fechou
      fim
      ~~~

      Esse é o coração do **RAII**: amarrar um recurso (arquivo, memória, conexão) à vida de um objeto. Quando o objeto morre, o recurso é liberado — mesmo se houver uma exceção no meio.
    `, [
      predict('Qual é a saída? (escreva as linhas separadas por espaço)', '#include <iostream>\nusing namespace std;\nstruct T {\n    T() { cout << "A\\n"; }\n    ~T() { cout << "B\\n"; }\n};\nint main() {\n    T x;\n    cout << "C\\n";\n}', 'A C B', 'Construtor, corpo do main, destrutor no fim do escopo.'),
    ]),
  ], [
    choice('Qual a diferença padrão entre `struct` e `class`?', ['`struct` não tem métodos', 'Membros de `struct` são públicos por padrão; de `class`, privados', '`class` é mais rápida', 'Nenhuma'], 1, 'É a única diferença técnica.'),
    bug('Qual linha impede a compilação?', md`
      class Ponto {
      public:
          int x, y;
      }
      int main() { Ponto p; }
    `, 4, 'A definição da classe precisa terminar com `};`.'),
    fill('Complete o destrutor da classe `Log`:', 'class Log {\npublic:\n    ___Log() { }\n};', '~', 'Destrutores começam com `~`.'),
    choice('O que significa `const` em `int valor() const`?', ['Retorna uma constante', 'O método não altera o objeto', 'O método é estático', 'O método não pode ser chamado'], 1, 'Pode ser chamado em objetos `const`.'),
    bug('Qual linha não compila?', md`
      class Cofre {
          int segredo = 42;
      public:
          int dica() const { return segredo / 2; }
      };
      int main() {
          Cofre c;
          return c.segredo;
      }
    `, 8, '`segredo` é privado (padrão em `class`).'),
  ]),

  mod('heranca', 'Herança e polimorfismo', 'Classes derivadas, virtual e classes abstratas.', [
    lesson('Herança', md`
      ~~~cpp
      class Animal {
      protected:
          string nome;
      public:
          Animal(string n) : nome(n) {}
          void apresentar() const { cout << "Sou " << nome << "\n"; }
      };

      class Cachorro : public Animal {
      public:
          Cachorro(string n) : Animal(n) {}
          void latir() const { cout << nome << ": au au\n"; }
      };

      int main() {
          Cachorro d("Rex");
          d.apresentar();
          d.latir();
      }
      ~~~

      - \`: public Animal\` = herança pública.
      - \`protected\` = acessível pela classe e pelas derivadas.
      - O construtor da derivada chama o da base na lista de inicialização: \`: Animal(n)\`.
    `, [
      fill('Complete a herança pública:', 'class Gato : ___ Animal { };', 'public', '`class Derivada : public Base`.'),
    ]),
    lesson('virtual e polimorfismo', md`
      Para que o método da classe **real** seja chamado através de um ponteiro/referência para a base, ele precisa ser \`virtual\`:

      ~~~cpp
      class Forma {
      public:
          virtual double area() const = 0;   // função virtual pura
          virtual ~Forma() = default;        // destrutor virtual
      };

      class Quadrado : public Forma {
          double lado;
      public:
          Quadrado(double l) : lado(l) {}
          double area() const override { return lado * lado; }
      };

      class Circulo : public Forma {
          double r;
      public:
          Circulo(double r) : r(r) {}
          double area() const override { return 3.14159 * r * r; }
      };
      ~~~

      ~~~cpp
      vector<unique_ptr<Forma>> formas;
      formas.push_back(make_unique<Quadrado>(2));
      formas.push_back(make_unique<Circulo>(1));
      for (const auto& f : formas) cout << f->area() << "\n";
      ~~~

      - \`= 0\` torna a função **pura**: a classe vira **abstrata** e não pode ser instanciada.
      - \`override\` pede ao compilador para conferir que você está mesmo sobrescrevendo.
      - Classes base com métodos virtuais devem ter **destrutor virtual**.
    `, [
      predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nstruct A { virtual string f() { return "A"; } virtual ~A() = default; };\nstruct B : A { string f() override { return "B"; } };\nint main() {\n    A* p = new B();\n    cout << p->f();\n    delete p;\n}', 'B', 'Com `virtual`, chama-se o método do objeto real.'),
      predict('Qual é a saída?', '#include <iostream>\nusing namespace std;\nstruct A { string f() { return "A"; } };\nstruct B : A { string f() { return "B"; } };\nint main() {\n    B b;\n    A* p = &b;\n    cout << p->f();\n}', 'A', 'Sem `virtual`, o método é escolhido pelo tipo do ponteiro (A).'),
    ]),
  ], [
    choice('Para que serve a palavra `virtual`?', ['Deixar o método privado', 'Permitir que a chamada use a versão da classe real (polimorfismo)', 'Criar uma variável', 'Acelerar o código'], 1, 'Habilita o despacho dinâmico.'),
    choice('O que torna uma classe abstrata em C++?', ['A palavra `abstract`', 'Ter ao menos uma função virtual pura (`= 0`)', 'Não ter construtor', 'Ser `struct`'], 1, 'Classes com funções virtuais puras não podem ser instanciadas.'),
    fill('Complete para o compilador verificar a sobrescrita:', 'double area() const ___ { return 1; }', 'override', '`override` evita erros de assinatura.'),
    choice('Por que a classe base polimórfica precisa de destrutor virtual?', ['Para economizar memória', 'Para que o destrutor da derivada seja chamado ao deletar via ponteiro da base', 'Porque é sintaxe obrigatória', 'Para permitir cópias'], 1, 'Sem ele, a parte derivada pode não ser destruída.'),
    choice('Membros `protected` podem ser acessados por:', ['Qualquer código', 'A própria classe e suas derivadas', 'Apenas `main`', 'Ninguém'], 1, 'Meio-termo entre public e private.'),
  ]),

  mod('stl', 'Biblioteca padrão (STL)', 'map, set, algoritmos e lambdas.', [
    lesson('map e set', md`
      ## map: chave → valor (ordenado pela chave)

      ~~~cpp
      #include <map>

      map<string, int> idade;
      idade["Ana"] = 30;
      idade["Bia"] = 25;
      idade["Ana"] += 1;
      for (const auto& [nome, anos] : idade) {
          cout << nome << ": " << anos << "\n";
      }
      ~~~

      ~~~text
      Ana: 31
      Bia: 25
      ~~~

      \`unordered_map\` é parecido, mas sem ordem e geralmente mais rápido.

      ## set: valores únicos e ordenados

      ~~~cpp
      set<int> s = {5, 1, 5, 3};
      for (int x : s) cout << x << " ";  // 1 3 5
      cout << s.count(3);                // 1 (existe)
      ~~~
    `, [
      predict('Qual é a saída?', 'map<string, int> m;\nm["b"] = 2;\nm["a"] = 1;\nfor (auto& [k, v] : m) cout << k << v;', 'a1b2', '`map` ordena pelas chaves.'),
      predict('Qual é a saída?', 'set<int> s = {3, 1, 3, 2, 1};\ncout << s.size();', '3', 'Valores repetidos são ignorados: {1, 2, 3}.'),
    ]),
    lesson('Algoritmos e lambdas', md`
      O cabeçalho \`<algorithm>\` traz dezenas de algoritmos prontos:

      ~~~cpp
      #include <algorithm>
      #include <numeric>

      vector<int> v = {5, 2, 8, 1};
      sort(v.begin(), v.end());                          // 1 2 5 8
      reverse(v.begin(), v.end());                       // 8 5 2 1
      int total = accumulate(v.begin(), v.end(), 0);     // 16
      auto it = find(v.begin(), v.end(), 5);             // iterador para o 5
      int maior = *max_element(v.begin(), v.end());      // 8
      ~~~

      ## Lambdas

      Funções anônimas, perfeitas para passar a algoritmos:

      ~~~cpp
      sort(v.begin(), v.end(), [](int a, int b) { return a > b; }); // decrescente
      int pares = count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
      ~~~

      A sintaxe é \`[captura](parâmetros) { corpo }\`. A captura \`[&]\` permite usar variáveis de fora por referência.

      🎉 Parabéns! Você passou pelos pilares do C++ moderno. Próximos passos: estruturas de dados e algoritmos, ou desenvolvimento de jogos com **Unreal** ou **SFML**.
    `, [
      predict('Qual é a saída?', 'vector<int> v = {4, 1, 3};\nsort(v.begin(), v.end());\nfor (int x : v) cout << x;', '134', 'Ordem crescente.'),
      predict('Qual é a saída?', 'vector<int> v = {1, 2, 3, 4, 5};\ncout << count_if(v.begin(), v.end(), [](int x) { return x > 2; });', '3', '3, 4 e 5 passam.'),
    ]),
  ], [
    choice('Qual container guarda valores **únicos** e ordenados?', ['`vector`', '`set`', '`map`', '`string`'], 1, '`set` descarta duplicados.'),
    fill('Complete para ordenar o vetor:', '___(v.begin(), v.end());', 'sort', '`std::sort` de `<algorithm>`.'),
    predict('Qual é a saída?', 'vector<int> v = {2, 4, 6};\ncout << accumulate(v.begin(), v.end(), 10);', '22', '10 + 2 + 4 + 6.'),
    choice('O que é `[](int x) { return x * 2; }`?', ['Um array', 'Uma lambda (função anônima)', 'Um template', 'Uma macro'], 1, 'Lambdas são funções inline sem nome.'),
    predict('Qual é a saída?', 'map<char, int> c;\nfor (char ch : string("banana")) c[ch]++;\ncout << c[\'a\'] << c[\'n\'];', '32', '"banana" tem 3 letras a e 2 letras n.'),
    bug('Qual linha não compila sem o cabeçalho correto?', md`
      #include <iostream>
      #include <vector>
      using namespace std;
      int main() {
          vector<int> v = {3, 1, 2};
          sort(v.begin(), v.end());
      }
    `, 6, '`sort` precisa de `#include <algorithm>`. Alguns compiladores aceitam por acaso, mas não é garantido — sempre inclua o cabeçalho certo.'),
  ]),
];
