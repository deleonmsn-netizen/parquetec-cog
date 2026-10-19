# ParqueTEC · COG Ensino Integral

App para controlar retirada, devolução, agenda, manutenção e histórico dos notebooks e tablets da escola.
Funciona no navegador e pode ser **instalado** no celular e no computador, com ícone próprio,
igual a um aplicativo. Não tem nada para baixar de loja.

## O que ele faz

- **Painel**: disponíveis, em uso, parados e total no parque, separados por Notebooks e Tablets. Mostra quem está com cada equipamento agora.
- **Retirar**: escolhe a pessoa, a finalidade, a turma e os equipamentos (tocando nos códigos ou dizendo só a quantidade).
- **Devolver**: devolve tudo de uma vez ou só alguns códigos.
- **Agenda**: reserva equipamentos por dia e por aula (Ensino Médio e Fundamental), mostrando quantos ainda estão livres.
- **Recados**: mural para a equipe, com recados fixados.
- **Histórico**: busca por equipamento, pessoa ou turma, e baixa uma planilha que abre no Excel.
- **Gerenciar**: pessoas (uma a uma ou colando uma lista), acessos ao app, manutenção e baixa de equipamentos, quantidade de equipamentos, horários das aulas e WhatsApp da escola.
- **Impressão** (botão **Imprimir** no Painel, ou Gerenciar → Equipamentos → Inventário): lista de equipamentos com logo, data, modelo, patrimônio, local e situação (todos, ou só disponíveis, em uso, em manutenção ou baixados), com coluna para conferência e campo de assinatura; e etiquetas com o logo para colar nos aparelhos. Na janela de impressão dá para escolher “Salvar como PDF”.

## Tudo se faz pelo app

Depois da configuração inicial, ninguém precisa abrir o Firebase:

| O quê | Onde |
| --- | --- |
| Pessoas que pegam equipamento (professores, alunos) | App → Gerenciar → Cadastrar pessoa |
| Quem pode entrar no app (logins) | App → Gerenciar → Acessos ao app (só a coordenação) |
| Tirar o acesso de alguém | App → Gerenciar → Acessos ao app → remover |
| Esqueci a senha / mudar a senha | Tela de entrada → Esqueci a senha, ou Gerenciar → Mudar senha |

Os perfis de acesso são três:

- **Professor**: vê o Painel e a Agenda, agenda para si mesmo (com quantos de cada modelo), retira os equipamentos depois que a coordenação aprova, escreve recados e marca "Devolvi" no que levou.
- **Operador**: aprova e recusa agendamentos, registra retiradas, confere devoluções, agenda para qualquer pessoa e cadastra pessoas.
- **Coordenação**: tudo isso e também equipamentos, configurações e acessos.

### Como o professor entra

1. Na tela de entrada, ele toca em **Criar minha conta** e coloca nome, e-mail e senha.
2. A coordenação recebe o pedido em **Gerenciar → Acessos** (com aviso no app e por e-mail) e toca em **Aprovar**.
3. O app do professor abre sozinho.

### Agendamento, retirada e devolução

1. O professor agenda: dia, aula e quantos de cada modelo (ex.: 10 Multilaser + 5 Positivo). O agendamento fica **aguardando aprovação** e a coordenação recebe um aviso (no app, com número vermelho na aba Agenda, e por e-mail).
2. A coordenação toca em **Aprovar** (em **Painel → Agendados para hoje** ou na **Agenda**, no dia marcado). O professor recebe o aviso. Se não for liberar, toca em **Recusar**: os equipamentos voltam a ficar livres e o professor vê "recusado pela coordenação". Ao remover o acesso ou desativar uma pessoa, os agendamentos dela são recusados sozinhos.
3. Na hora da aula, **o próprio professor toca em Retirar** quando pegar os equipamentos. Os códigos já vêm separados e ele só consegue levar o que foi aprovado. Se ele estiver sem o app, a coordenação pode tocar em Retirar por ele.
4. Na devolução, o professor toca em **Devolvi** e marca os códigos. A coordenação recebe o aviso, confere em **Painel → Devoluções para conferir** e confirma. Só então eles voltam a contar como disponíveis.

Quando a coordenação ou o operador agenda para alguém, o agendamento já nasce aprovado.

### Aula dobrada

Ao agendar, escolha em **Quantas aulas** a opção "2ª aula e 3ª aula (aula dobrada)" (ou mais aulas seguidas). Funciona para o professor e para a coordenação. Os mesmos equipamentos ficam reservados em todas as aulas escolhidas, é uma retirada só, e o prazo de devolução é o fim da última aula mais 30 minutos.

### Trocar de pessoa no mesmo aparelho

Cada pessoa usa o próprio login. Para outra pessoa usar o mesmo celular ou computador, toque em **Sair**, no topo, e entre com o outro e-mail e senha. O nome de quem está logado é o que aparece como "aprovado por" e "autorizado por".

## Colocar no ar (feito uma vez só)

São duas partes: o **Firebase**, que guarda os dados e junta celular e computador, e a **hospedagem**, que dá o endereço do app.
Os dois são gratuitos para o uso de uma escola.

### Parte 1: Firebase (uns 10 minutos)

1. Entre em <https://console.firebase.google.com> com uma conta Google da escola e clique em **Criar um projeto**. Dê um nome (ex.: `parquetec-cog`). Pode desligar o Google Analytics.
2. No menu da esquerda, abra **Criação → Firestore Database → Criar banco de dados**. Escolha o local **southamerica-east1 (São Paulo)** e o **modo de produção**.
3. Ainda no Firestore, abra a aba **Regras**, apague o que estiver lá e cole o conteúdo do arquivo `firestore.rules`.
   Confira se o e-mail da coordenação está certo (em letras minúsculas) e clique em **Publicar**.
4. Abra **Criação → Authentication → Vamos começar**, escolha **E-mail/senha** e ative. Não precisa cadastrar ninguém aqui.
5. Clique na engrenagem ⚙️ → **Configurações do projeto**. Em **Seus apps**, clique no ícone **`</>`** (Web), dê um apelido e registre. Vai aparecer um bloco `firebaseConfig` com `apiKey`, `authDomain`, `projectId` etc.
6. Copie esses valores para o arquivo `config.js`, no lugar do `null`, e coloque o e-mail da coordenação no campo `dono` (há um exemplo no próprio arquivo). Pode também mandar o bloco e o e-mail para o Claude preencher.

Enquanto o `config.js` estiver com `null`, o app abre em **modo de teste** e guarda os dados só no aparelho.

### Parte 2: hospedagem

O jeito mais simples é o **GitHub Pages** num repositório **público** só com esta pasta:

1. Coloque os arquivos desta pasta na raiz de um repositório público (ex.: `parquetec`).
2. No repositório, vá em **Settings → Pages**, em **Build and deployment** escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em 1 ou 2 minutos o app fica no ar em `https://SEU-USUARIO.github.io/parquetec/`.

Também serve qualquer outra hospedagem de site estático (Netlify, Firebase Hosting, Cloudflare Pages). Basta enviar a pasta inteira.

## Primeiro uso

1. Abra o endereço do app e toque em **Primeiro acesso** (abaixo do botão Entrar). Crie a senha da coordenação.
2. Abra o e-mail da coordenação, toque no link de confirmação e volte ao app em **Já confirmei**.
3. Diga quantos notebooks e tablets a escola tem. Os códigos são criados sozinhos: `NB-001`, `NB-002`… e `TB-001`, `TB-002`…
4. Em **Gerenciar → Acessos ao app**, dê acesso a quem vai usar: nome, e-mail, uma senha inicial e o perfil. Passe o e-mail e a senha para a pessoa.
5. Em **Gerenciar → Cadastrar pessoa**, cadastre quem pega equipamento. Para cadastrar muitas, cole a lista (uma por linha, `Nome; cargo ou turma`).

## Atrasos, defeitos e relatório

- **Prazo de devolução**: com agendamento, é o fim da aula mais 30 minutos; sem agendamento, é o horário limite do dia (Gerenciar → Ajustes, padrão 18:00). Passou do prazo, a retirada aparece em vermelho em **Devoluções atrasadas**, a coordenação recebe aviso no app e por e-mail, e o professor também (uma vez por retirada). O e-mail sai mesmo com todos os aparelhos desligados: o script de e-mail confere os atrasos a cada hora (veja "Aviso de atraso com o app fechado").
- **Devolução com defeito**: ao marcar "Devolvi", o professor pode contar o problema. Na conferência, a coordenação toca em **Algum voltou com problema?**, marca os códigos e escreve o que aconteceu: eles entram como devolvidos e vão direto para manutenção.
- **Relatório de uso** (Histórico → Relatório de uso): por período (este mês, mês passado, últimos 30 dias, este ano), com retiradas, equipamentos, pessoas, atrasos, defeitos, quem mais usou, turmas, modelos, dias da semana e finalidade. Dá para imprimir e baixar a planilha.

## E-mails que o app manda

- Para a coordenação: pedido de acesso, novo agendamento de professor, devolução marcada pelo professor e devolução atrasada.
- Para o professor: acesso liberado ou recusado, agendamento aprovado ou recusado e devolução atrasada.
- Limites de segurança no script: no máximo 80 e-mails por dia e 6 para a mesma pessoa, sem links vindos de fora.

### Aviso de atraso com o app fechado (feito uma vez só)

1. No app, em **Gerenciar → Acessos → Dar acesso**, crie um login só para os avisos: nome "Avisos automáticos", e-mail `gomescomendadoroliveira+avisos@gmail.com`, uma senha forte e perfil **Professor**. Esse login não aparece na lista de pessoas.
2. No script (script.google.com), clique na engrenagem (**Configurações do projeto**) → **Propriedades do script** → **Adicionar propriedade**: `ROBO_EMAIL` com o e-mail acima e `ROBO_SENHA` com a senha. Salve.
3. Volte ao código (ícone `< >`), escolha a função **instalarVerificacao** no menu ao lado de "Depurar" e clique em **Executar**. Autorize.

Pronto: a cada hora o script confere as retiradas e manda os e-mails de atraso. O login dos avisos só consegue ler e marcar "atraso avisado", e só depois do prazo vencido.

## Avisos para a coordenação

- **No app**: números vermelhos nas abas (novos agendamentos, pedidos de acesso, devoluções para conferir) e avisos na tela. Para receber o aviso mesmo com o app minimizado, toque em **Gerenciar → Ajustes → Ativar avisos**.
- **Por e-mail** (opcional, gratuito, usa o próprio Gmail da coordenação):
  1. Logado no Gmail da coordenação, abra <https://script.google.com> e clique em **Novo projeto**.
  2. Apague o que estiver lá, cole todo o conteúdo do arquivo `aviso-email.gs` e clique em **Salvar**.
  3. Clique em **Implantar → Nova implantação**, na engrenagem escolha **App da Web**. Em "Executar como" deixe **Eu**, em "Quem pode acessar" escolha **Qualquer pessoa** e clique em **Implantar**. Autorize o acesso.
  4. Copie o **URL do app da Web** e coloque no campo `avisoEmail` do `config.js` (ou mande para o Claude colocar).

## Instalar nos aparelhos

Abra o endereço do app e:

- **Computador (Chrome ou Edge)**: clique no ícone de instalar no fim da barra de endereço, ou no menu ⋮ → **Instalar ParqueTEC**. Vira um atalho na área de trabalho e no menu Iniciar.
- **Android (Chrome)**: menu ⋮ → **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari)**: botão Compartilhar → **Adicionar à Tela de Início**.

O próprio app mostra um botão **Instalar** no Painel quando o aparelho permite.

## Segurança

- O site publicado tem só o código do app e o logo. Os dados (pessoas, retiradas, histórico, recados) ficam no Firebase.
- Só lê ou muda os dados quem a coordenação liberou em **Acessos ao app**. Se alguém criar uma conta por fora, ela entra mas não vê nada: aparece "Sem acesso ainda".
- A conta da coordenação só vale depois de confirmar o e-mail, então ninguém consegue se passar por ela.
- As regras do Firebase também impedem que um operador mude equipamentos, configurações ou acessos, mesmo tentando por fora do app. E o professor não consegue agendar em data passada, se aprovar sozinho nem retirar mais do que foi aprovado.
- A `apiKey` que vai no `config.js` não é senha: o Google faz ela para ficar visível no site. O que protege os dados são as regras e os logins.
- O app não tem acesso a nenhum outro sistema, computador ou e-mail da escola.
- Use um login para cada pessoa, com senha forte, e remova o acesso de quem sair da escola.
- Cadastre só nome e cargo ou turma. Não coloque CPF, telefone ou outros dados pessoais dos alunos.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O app inteiro |
| `config.js` | Configuração do Firebase e e-mail da coordenação |
| `manifest.webmanifest` | Nome, cores e ícones usados na instalação |
| `sw.js` | Guarda o app no aparelho para abrir rápido e funcionar com internet fraca |
| `icons/` | Ícones do app |
| `icons/cog-logo.svg` | Logo do COG em vetor (lâmpada e texto), para impressão e materiais |
| `icons/cog-lampada.svg` | Só a lâmpada, em vetor |
| `firestore.rules` | Regras de segurança para colar no Firebase |

Ao mudar o `index.html` depois de publicado, troque o número em `CACHE = "parquetec-v…"` dentro do `sw.js` e o `VERSAO` no `index.html`. Os aparelhos se atualizam sozinhos: na hora, se o app estiver parado, ou assim que a pessoa fechar a janela em que está mexendo. A versão aparece em Gerenciar, no fim da página.

Ao mudar o `firestore.rules`, troque também o nome no bloco `versao` (ex.: `regras-6`) e o `REGRAS` no `index.html`. Assim, se a coordenação esquecer de colar as regras novas no Firebase, o app mostra um aviso vermelho no Painel dela.
