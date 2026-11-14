import { md, mod, lesson, choice, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'git',
  name: 'Git',
  short: 'Git',
  color: '#8fd14f',
  level: 'extra',
  lang: 'bash',
  category: 'Ferramentas',
  tagline: 'Controle de versões: nunca mais perca código e trabalhe em equipe.',
  description: 'Repositórios, commits, histórico, branches, merge, conflitos, GitHub, pull requests e como desfazer erros.',
}, [
  mod('basico', 'Primeiros passos', 'O que é controle de versão, init, add e commit.', [
    lesson('Por que usar Git?', md`
      Sem controle de versão, projetos viram uma bagunça de arquivos como \`site_final_v2_AGORA_VAI.zip\`. O **Git** registra cada mudança do seu código, com autor, data e mensagem. Com ele você pode:

      - voltar a qualquer versão anterior;
      - ver **quem** mudou **o quê** e **por quê**;
      - trabalhar em várias funcionalidades ao mesmo tempo (branches);
      - colaborar com outras pessoas sem sobrescrever o trabalho delas.

      Git roda no seu computador. **GitHub**, **GitLab** e **Bitbucket** são serviços que hospedam repositórios Git na nuvem.

      ## Configuração inicial (uma vez por computador)

      ~~~bash
      git config --global user.name "Seu Nome"
      git config --global user.email "voce@exemplo.com"
      ~~~

      > ℹ️ Nesta trilha você pratica com questões sobre comandos. Para treinar de verdade, instale o Git (git-scm.com) e repita os comandos num terminal.
    `, [
      choice('Qual a diferença entre Git e GitHub?', ['São a mesma coisa', 'Git é a ferramenta de versionamento; GitHub hospeda repositórios Git online', 'GitHub é mais antigo', 'Git só funciona com GitHub'], 1, 'Você pode usar Git sem nunca usar GitHub.'),
    ]),
    lesson('init, status, add e commit', md`
      ~~~bash
      mkdir meu-projeto && cd meu-projeto
      git init                  # cria o repositório (pasta oculta .git)
      echo "# Projeto" > README.md
      git status                # mostra o que mudou
      git add README.md         # coloca o arquivo na "área de preparação"
      git commit -m "Adiciona README"
      ~~~

      ## As três áreas

      | Área | O que é |
      |---|---|
      | **Diretório de trabalho** | seus arquivos, como estão agora |
      | **Staging area** (índice) | o que vai entrar no próximo commit |
      | **Repositório** | o histórico de commits |

      O fluxo é sempre: **editar → \`git add\` → \`git commit\`**.

      - \`git add .\` adiciona todas as mudanças da pasta atual.
      - Um **commit** é uma "foto" do projeto com uma mensagem. Escreva mensagens no imperativo e claras: "Corrige cálculo de frete", não "mudanças".

      ## .gitignore

      Arquivos que nunca devem ir para o repositório (senhas, dependências, arquivos gerados) são listados no \`.gitignore\`:

      ~~~text
      node_modules/
      .env
      *.log
      ~~~
    `, [
      fill('Complete para criar um commit com mensagem:', 'git commit ___ "Corrige botão de login"', '-m', '`-m` define a mensagem.'),
      choice('Qual comando coloca mudanças na staging area?', ['`git commit`', '`git add`', '`git push`', '`git init`'], 1, '`git add` prepara o próximo commit.'),
    ]),
  ], [
    choice('O que `git init` faz?', ['Baixa um projeto', 'Cria um novo repositório na pasta atual', 'Envia para o GitHub', 'Apaga o histórico'], 1, 'Cria a pasta oculta `.git`.'),
    choice('Qual comando mostra arquivos modificados e o que está preparado para commit?', ['`git log`', '`git status`', '`git show`', '`git diff --stat`'], 1, '`git status` é o comando mais usado do dia a dia.'),
    choice('Qual arquivo lista o que o Git deve ignorar?', ['`.gitconfig`', '`.ignore`', '`.gitignore`', '`git.ignore`'], 2, 'Ex.: `node_modules/`, `.env`.'),
    bug('Qual linha da sequência está fora de ordem para gravar a mudança?', md`
      echo "olá" > nota.txt
      git commit -m "Adiciona nota"
      git add nota.txt
    `, 2, 'Primeiro `git add`, depois `git commit`. Do jeito que está, o commit não inclui o arquivo.'),
    choice('Qual mensagem de commit é melhor?', ['"ajustes"', '"asdf"', '"Corrige validação do e-mail no cadastro"', '"commit 3"'], 2, 'Mensagens claras ajudam todo mundo a entender o histórico.'),
  ]),

  mod('historico', 'Histórico e diferenças', 'log, diff e show.', [
    lesson('Explorando o histórico', md`
      ~~~bash
      git log                   # histórico completo
      git log --oneline         # um commit por linha
      git log --oneline --graph --all  # com desenho das branches
      git show a1b2c3d          # detalhes de um commit
      ~~~

      Cada commit tem um identificador único, o **hash** (ex.: \`a1b2c3d4...\`). Basta usar os primeiros 7 caracteres.

      ## Vendo diferenças

      ~~~bash
      git diff                  # mudanças ainda NÃO adicionadas
      git diff --staged         # mudanças já adicionadas (no staging)
      git diff main..feature    # diferença entre duas branches
      ~~~

      Linhas começando com \`+\` foram adicionadas; com \`-\`, removidas.

      ## Quem escreveu esta linha?

      ~~~bash
      git blame app.js
      ~~~
    `, [
      choice('Qual comando mostra o histórico resumido, um commit por linha?', ['`git log --oneline`', '`git status -s`', '`git history`', '`git show --short`'], 0, '`--oneline` compacta a saída.'),
      fill('Complete para ver as diferenças já preparadas para commit:', 'git diff ___', '--staged', 'Também funciona `--cached`.'),
    ]),
  ], [
    choice('O que é o hash de um commit?', ['A senha do repositório', 'Um identificador único do commit', 'O nome da branch', 'O tamanho do arquivo'], 1, 'Ex.: `3f9a2c1`.'),
    choice('`git diff` sem argumentos mostra:', ['O histórico', 'Mudanças ainda não adicionadas ao staging', 'Arquivos ignorados', 'Branches remotas'], 1, 'Para o staging use `--staged`.'),
    choice('Qual comando mostra quem alterou cada linha de um arquivo?', ['`git who`', '`git blame`', '`git author`', '`git log -p`'], 1, '`git blame arquivo`.'),
    fill('Complete para ver detalhes de um commit específico:', 'git ___ 3f9a2c1', 'show', '`git show <hash>`.'),
    choice('No `git diff`, o que indica uma linha começando com `+`?', ['Linha removida', 'Linha adicionada', 'Conflito', 'Comentário'], 1, '`-` = removida.'),
  ]),

  mod('branches', 'Branches e merge', 'Ramificar, juntar e resolver conflitos.', [
    lesson('Branches', md`
      Uma **branch** (ramo) é uma linha independente de desenvolvimento. Você cria uma para cada funcionalidade, sem mexer na versão estável:

      ~~~bash
      git branch                  # lista as branches
      git switch -c login         # cria e entra na branch "login"
      # ... edita, add, commit ...
      git switch main             # volta para a main
      ~~~

      > ℹ️ Em tutoriais antigos você verá \`git checkout -b login\`. Faz o mesmo que \`git switch -c\`.

      ## Merge

      Quando a funcionalidade está pronta, junte-a à \`main\`:

      ~~~bash
      git switch main
      git merge login
      git branch -d login         # apaga a branch já mesclada
      ~~~
    `, [
      fill('Complete para criar uma branch e já entrar nela:', 'git switch ___ nova-tela', '-c', '`-c` = create.'),
    ]),
    lesson('Resolvendo conflitos', md`
      Um **conflito** acontece quando duas branches alteram **a mesma linha** de formas diferentes. O Git não sabe qual escolher e marca o arquivo:

      ~~~text
      <<<<<<< HEAD
      const cor = "azul";
      =======
      const cor = "verde";
      >>>>>>> tema-novo
      ~~~

      - Entre \`<<<<<<< HEAD\` e \`=======\`: a versão da sua branch atual.
      - Entre \`=======\` e \`>>>>>>>\`: a versão da branch que está chegando.

      Para resolver:

      1. Edite o arquivo deixando o conteúdo certo (e apague os marcadores).
      2. \`git add arquivo\`
      3. \`git commit\` para concluir o merge.

      > 💡 Conflitos não são erros, são perguntas. Commits pequenos e frequentes e branches de vida curta diminuem muito a chance de conflitos.
    `, [
      choice('O que fazer depois de editar um arquivo em conflito?', ['`git reset`', '`git add` no arquivo e depois `git commit`', '`git push --force`', 'Apagar o repositório'], 1, 'Isso marca o conflito como resolvido.'),
    ]),
  ], [
    choice('Para que servem branches?', ['Apagar commits', 'Desenvolver funcionalidades isoladamente', 'Hospedar o site', 'Comprimir arquivos'], 1, 'Cada branch é uma linha independente.'),
    fill('Complete para juntar a branch `pagamento` na branch atual:', 'git ___ pagamento', 'merge', '`git merge <branch>`.'),
    choice('Quando ocorre um conflito de merge?', ['Sempre que se faz merge', 'Quando duas branches alteram as mesmas linhas de formas diferentes', 'Quando o arquivo é grande', 'Quando não há internet'], 1, 'O Git precisa da sua decisão.'),
    bug('Qual linha precisa ser removida para concluir a resolução do conflito?', md`
      function total() {
      <<<<<<< HEAD
        return preco * qtd;
      }
    `, 2, 'Marcadores como `<<<<<<< HEAD`, `=======` e `>>>>>>>` devem ser apagados.'),
    choice('Qual comando apaga uma branch já mesclada?', ['`git branch -d nome`', '`git delete nome`', '`git rm nome`', '`git merge -d nome`'], 0, '`-D` força, mesmo sem merge.'),
  ]),

  mod('remoto', 'GitHub e colaboração', 'remote, push, pull, clone e pull requests.', [
    lesson('Repositórios remotos', md`
      ~~~bash
      git clone https://github.com/usuario/projeto.git   # baixa um repositório
      git remote -v                                      # lista os remotos
      git remote add origin https://github.com/eu/app.git
      git push -u origin main     # envia a main e liga a branch local à remota
      git pull                    # baixa e integra as novidades
      git fetch                   # só baixa, sem integrar
      ~~~

      - \`origin\` é o nome padrão do repositório remoto principal.
      - \`push\` envia seus commits; \`pull\` = \`fetch\` + \`merge\`.

      > ⚠️ Faça \`git pull\` antes de começar a trabalhar e antes de dar \`push\`, para evitar divergências.
    `, [
      choice('Qual comando baixa um repositório existente pela primeira vez?', ['`git pull`', '`git clone`', '`git fetch`', '`git init`'], 1, '`git clone <url>`.'),
    ]),
    lesson('Pull requests e fluxo de trabalho', md`
      Em equipe, ninguém faz \`push\` direto na \`main\`. O fluxo comum é:

      1. \`git switch -c feature/carrinho\`
      2. Commits pequenos e frequentes.
      3. \`git push -u origin feature/carrinho\`
      4. No GitHub, abra um **Pull Request** (PR): um pedido para mesclar sua branch.
      5. Colegas revisam (*code review*), comentam, você ajusta.
      6. Testes automáticos (CI) rodam.
      7. Aprovado, o PR é mesclado na \`main\`.

      ## Contribuindo com projetos de outras pessoas

      Sem permissão de escrita, você faz um **fork** (uma cópia do repositório na sua conta), trabalha nela e abre um PR para o original. É assim que funciona o código aberto.
    `, [
      choice('O que é um Pull Request?', ['Um comando do Git', 'Um pedido para mesclar uma branch, com revisão', 'Um download', 'Um tipo de commit'], 1, 'É um recurso de plataformas como o GitHub.'),
    ]),
  ], [
    fill('Complete para enviar seus commits:', 'git ___ origin main', 'push', '`push` envia; `pull` recebe.'),
    choice('Qual a diferença entre `fetch` e `pull`?', ['Nenhuma', '`fetch` só baixa; `pull` baixa e integra', '`pull` só baixa', '`fetch` envia'], 1, '`pull` = `fetch` + `merge`.'),
    choice('O que é um fork?', ['Uma branch local', 'Uma cópia de um repositório na sua conta', 'Um conflito', 'Um commit vazio'], 1, 'Usado para contribuir sem permissão de escrita.'),
    choice('Qual o nome padrão do remoto principal?', ['`main`', '`master`', '`origin`', '`remote`'], 2, '`origin` é criado no `clone`.'),
    choice('Qual boa prática evita a maioria dos problemas ao colaborar?', ['Fazer push direto na main', 'Branches curtas, commits pequenos e pull antes de push', 'Nunca dar pull', 'Um commit por mês'], 1, 'Integrações frequentes reduzem conflitos.'),
  ]),

  mod('desfazer', 'Desfazendo coisas', 'restore, reset, revert, stash e amend.', [
    lesson('Desfazendo com segurança', md`
      | Situação | Comando |
      |---|---|
      | Descartar mudanças não salvas num arquivo | \`git restore arquivo\` |
      | Tirar um arquivo do staging | \`git restore --staged arquivo\` |
      | Corrigir a mensagem do último commit (ainda não enviado) | \`git commit --amend\` |
      | Desfazer um commit **já enviado** | \`git revert <hash>\` |
      | Guardar mudanças temporariamente | \`git stash\` / \`git stash pop\` |

      ## revert x reset

      - \`git revert <hash>\` cria um **novo commit** que desfaz o anterior. O histórico fica intacto: **seguro** para branches compartilhadas.
      - \`git reset --hard <hash>\` move a branch para trás e **apaga** commits e mudanças locais. Perigoso.

      > ⚠️ Nunca reescreva (\`reset\`, \`--amend\`, \`push --force\`) commits que outras pessoas já baixaram. Você vai bagunçar o histórico delas.

      ## Recuperando o "perdido"

      \`git reflog\` lista tudo por onde o \`HEAD\` passou. Mesmo após um reset errado, geralmente dá para achar o hash e voltar.

      🎉 Parabéns! Agora você usa Git como profissional. Crie uma conta no GitHub e publique seus projetos desta plataforma lá.
    `, [
      choice('Qual comando desfaz um commit já enviado sem reescrever o histórico?', ['`git reset --hard`', '`git revert`', '`git commit --amend`', '`git rm`'], 1, '`revert` cria um commit inverso.'),
      fill('Complete para guardar as mudanças temporariamente:', 'git ___', 'stash', '`git stash pop` traz de volta.'),
    ]),
  ], [
    choice('Qual comando descarta as mudanças não commitadas de um arquivo?', ['`git restore arquivo`', '`git revert arquivo`', '`git clean arquivo`', '`git undo arquivo`'], 0, 'Cuidado: as mudanças são perdidas.'),
    choice('Por que `git reset --hard` é perigoso?', ['É lento', 'Apaga commits e mudanças locais', 'Envia para o GitHub', 'Cria conflitos sempre'], 1, 'Use com muito cuidado.'),
    choice('Como corrigir a mensagem do último commit que ainda não foi enviado?', ['`git commit --amend`', '`git revert HEAD`', '`git log --edit`', '`git rename`'], 0, '`--amend` reescreve o último commit.'),
    choice('Qual comando ajuda a recuperar commits "perdidos" após um reset?', ['`git reflog`', '`git status`', '`git fetch`', '`git blame`'], 0, '`reflog` registra os movimentos do HEAD.'),
    bug('Qual comando é inadequado numa branch que a equipe inteira usa?', md`
      git pull
      git revert 4d2e1f0
      git push --force
    `, 3, '`push --force` sobrescreve o histórico remoto e pode apagar o trabalho dos colegas.'),
  ]),
]);
