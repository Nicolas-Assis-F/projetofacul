<div align="center">

# 🧪 CampusLab

**Equipamentos, pessoas e ideias em movimento.**

Sistema de gestão de empréstimos para laboratórios universitários.

React · TypeScript · shadcn/ui · Express · TypeORM · PostgreSQL

[Como executar](#como-executar) · [Guia do professor](docs/GUIA_DO_PROFESSOR.md) · [Documentação da API](docs/API.md) · [Prévia mobile](docs/preview-mobile.png)

</div>

![Visão geral do CampusLab](docs/preview-desktop.png)

## O projeto

O CampusLab resolve uma situação comum na faculdade: controlar quem está com um
notebook, câmera, kit Arduino ou outro equipamento, quando deve devolver e o que
está disponível no laboratório.

Partimos da API de usuários e produtos já existente e a transformamos em um
sistema completo, com interface em português e fluxo de empréstimos. As rotas
originais `/users` e `/products` foram preservadas. Na interface, representam
**pessoas** e **equipamentos**.

### O que funciona

- **Visão geral:** indicadores calculados a partir do banco, gráfico dos últimos
  sete dias, disponibilidade do acervo e devoluções pendentes.
- **Equipamentos:** cadastrar, editar, excluir quando não há histórico, buscar
  por nome/patrimônio e filtrar por categoria e situação.
- **Pessoas:** cadastrar, editar, buscar e controlar a situação dos participantes.
- **Empréstimos:** registrar retirada, definir prazo, anotar observações,
  consultar detalhes, acompanhar atrasos e confirmar devoluções.
- **Regras reais:** impede dois empréstimos simultâneos do mesmo equipamento,
  aceita apenas pessoas ativas e equipamentos disponíveis, preserva o histórico.
- **Exportação:** CSV com os resultados filtrados de equipamentos, pessoas e empréstimos.
- **Interface responsiva:** funciona em desktop e celular, com menu móvel,
  navegação por teclado e mensagens de erro, carregamento e lista vazia.
- **Guia dentro do sistema:** roteiro para apresentar e avaliar o trabalho.

> Projeto acadêmico, sem autenticação. Não há tela de login nem senha para entrar.
> Os dados de demonstração são fictícios. Não use dados pessoais reais em uma
> instância pública deste projeto.

## Como executar

Escolha **uma** das opções abaixo. A opção Docker prepara aplicação e banco juntos.
A opção manual é adequada para quem já tem Node.js e PostgreSQL.

### 1. Clonar a versão completa

Pré-requisito: [Git](https://git-scm.com/downloads) instalado.

```bash
git clone --branch Nicolas-Assis-F/terminar --single-branch https://github.com/Nicolas-Assis-F/projetofacul.git
cd projetofacul
```

**Importante:** a versão CampusLab está na branch `Nicolas-Assis-F/terminar`.
O comando acima já seleciona a branch correta; não é necessário fazer checkout depois.

Se já clonou o repositório:

```bash
git fetch origin
git switch Nicolas-Assis-F/terminar
git pull --ff-only
```

### 2A. Executar com Docker — caminho mais simples

Pré-requisito: Docker com Docker Compose v2. No Windows/macOS, abra o Docker
Desktop e aguarde ficar em execução. Não precisa instalar Node.js ou PostgreSQL.

Copie a configuração de exemplo:

**Linux/macOS/Git Bash:**

```bash
cp .env.example .env
```

**PowerShell no Windows:**

```powershell
Copy-Item .env.example .env
```

O `.env.example` já tem uma senha de **desenvolvimento local** para funcionar de
imediato. Depois execute:

```bash
docker compose up --build -d
docker compose logs -f api
```

A primeira execução baixa as imagens, instala dependências, compila a interface,
cria as tabelas e insere os dados fictícios. Aguarde a mensagem
**“Server running on http://localhost:3000”**.

Abra **[http://localhost:3000](http://localhost:3000)**.

Você deve ver **20 equipamentos, 12 pessoas, 18 empréstimos no histórico e 6
empréstimos ativos** em um banco novo. Os atrasos mudam com a passagem dos dias.

`Ctrl+C` interrompe apenas a visualização dos logs. Para parar o sistema:

```bash
docker compose down
```

Para iniciar novamente, preservando os cadastros:

```bash
docker compose up -d
```

O PostgreSQL usa um volume persistente. **Não use `docker compose down -v`**
se quiser manter os dados. O banco não publica uma porta externa nesta configuração.

### 2B. Executar sem Docker

Pré-requisitos:

- **Node.js 22 ou superior** e npm;
- **PostgreSQL 16 ou superior** em execução;
- Git.

Confira as versões:

```bash
node --version
npm --version
psql --version
```

**a. Instale as dependências:**

```bash
npm ci
```

Esse comando também instala automaticamente as dependências de `web/`.

**b. Crie o banco:** entre no PostgreSQL como administrador, pelo terminal ou
pelo Query Tool do pgAdmin conectado ao banco `postgres`, e execute cada comando
separadamente:

```sql
CREATE USER baiao WITH PASSWORD 'campuslab_local_demo';
CREATE DATABASE baiao_db OWNER baiao;
```

Pelo terminal, normalmente é possível entrar com `psql -U postgres`.
Se já existir usuário/banco, reutilize-os e configure os dados no próximo passo.

**c. Copie `.env.example` para `.env`**, usando o comando adequado ao seu sistema
mostrado na opção Docker. O conteúdo básico deve corresponder ao banco criado:

```dotenv
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=baiao
DB_PASS=campuslab_local_demo
DB_NAME=baiao_db
DB_SSL=false
CORS_ORIGIN=
```

**d. Prepare os dados e execute:**

```bash
npm run setup
npm run dev
```

`setup` aplica migrações, cria categorias/situações e carrega a demonstração.
`dev` inicia a API e a interface no mesmo terminal.

Abra **[http://localhost:5173](http://localhost:5173)**. A interface encaminha
as chamadas à API em `localhost:3000`; não é necessário alterar CORS.

### Executar a versão compilada

Com as dependências instaladas e `.env` configurado:

```bash
npm run build
npm run start:demo
```

Abra **http://localhost:3000**. Nesse modo, o Express serve a interface e a API.
Não há necessidade de iniciar o Vite.

Para iniciar somente com tabelas de domínio, sem inserir exemplos:

```bash
npm run build
npm run start:deploy
```

Os seeds não apagam cadastros existentes. Repetir a preparação não duplica os
registros de demonstração já presentes. O seed demonstrativo é destinado a
bancos locais novos; não é um mecanismo de restauração de dados apagados.

## Passo a passo do sistema

1. **Visão geral:** observe os indicadores e os prazos na seção “No radar”.
2. **Pessoas → Nova pessoa:** cadastre nome e e-mail; mantenha a situação “Ativo”.
3. **Equipamentos → Novo equipamento:** escolha nome, categoria e situação “Disponível”.
4. **Empréstimos → Novo empréstimo:** selecione a pessoa, o equipamento e o prazo.
5. Volte a **Equipamentos**: o item aparece como “Emprestado” e não pode sair novamente.
6. Em **Empréstimos**, abra o ícone de detalhes para consultar observações e datas.
7. Clique em **Devolver → Confirmar devolução** após receber o item. Ele volta a
   ficar disponível, desde que seu cadastro continue com situação “Disponível”.
8. Use **Exportar** para baixar um CSV dos registros que correspondem à busca e aos filtros.

O prazo termina às **23h59 do dia selecionado**, no fuso do navegador que registrou
o empréstimo. As datas são armazenadas com fuso horário. Um empréstimo não devolvido
com prazo vencido aparece automaticamente em atraso.

O roteiro de avaliação, com resultados esperados, está no
[Guia do professor](docs/GUIA_DO_PROFESSOR.md).

## Organização do código

```text
projetofacul/
├── web/                    # Interface React + Vite + Tailwind
│   ├── src/App.tsx          # Navegação, listas, filtros e ações
│   ├── src/components/     # Dashboard, formulários e componentes shadcn
│   ├── src/lib/api.ts      # Tipos, cliente HTTP, datas e exportação CSV
│   └── src/index.css       # Identidade visual e responsividade
├── src/                    # API Express + TypeScript
│   ├── entities/           # Mapeamento das tabelas TypeORM
│   ├── migrations/         # Criação versionada das tabelas
│   ├── routes/             # Endpoints HTTP
│   ├── controllers/        # Entrada/saída dos cadastros originais
│   ├── services/           # Regras de negócio e transações
│   ├── middlewares/        # Validações e tratamento de erros
│   └── seeds/              # Categorias, situações e demonstração
├── tests/                  # Testes HTTP, PostgreSQL e navegador
├── docs/                   # Guia, API e imagens da interface
├── scripts/                # Preparação e captura de prévias
├── compose.yaml            # Aplicação + PostgreSQL local
└── .github/workflows/      # Verificações automáticas no GitHub
```

### Modelo de dados

| Entidade             | Finalidade                               | Relacionamentos                                               |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| `users`              | Pessoas do laboratório                   | Pertence a uma situação; pode ter vários empréstimos          |
| `products`           | Equipamentos                             | Pertence a categoria e situação; tem histórico de empréstimos |
| `loans`              | Retirada, prazo, devolução e observações | Liga uma pessoa a um equipamento                              |
| `situations`         | Ativo, inativo e pendente                | Referenciada por pessoas                                      |
| `product_categories` | Informática, audiovisual etc.            | Referenciada por equipamentos                                 |
| `product_situations` | Disponível, manutenção e inativo         | Referenciada por equipamentos                                 |

Um índice único parcial em `loans` impede mais de um empréstimo ativo por equipamento.
A criação usa transação e bloqueio de linha. Chaves estrangeiras impedem excluir
pessoas/equipamentos com histórico. Use **Editar → Inativo** para desativá-los.

## Comandos úteis

| Comando                    | O que faz                                                 |
| -------------------------- | --------------------------------------------------------- |
| `npm ci`                   | Instala backend e frontend conforme os arquivos de lock   |
| `npm run setup`            | Migrações + categorias/situações + dados fictícios        |
| `npm run dev`              | API e interface com atualização durante o desenvolvimento |
| `npm run build`            | Compila backend e frontend                                |
| `npm start`                | Inicia a versão compilada, sem preparar o banco           |
| `npm run start:demo`       | Prepara demonstração e inicia versão compilada            |
| `npm run migration:run`    | Aplica migrações TypeScript                               |
| `npm run seed`             | Insere somente categorias e situações                     |
| `npm run seed:demo`        | Insere exemplos acadêmicos, sem apagar dados              |
| `npm test`                 | Testa validações e respostas HTTP sem banco               |
| `npm run test:integration` | Testa CRUD e empréstimos em banco isolado                 |
| `npm run test:e2e`         | Testa interface real em Chromium                          |

## Testes completos

Crie um **banco separado**, por exemplo `baiao_test`, pertencente ao usuário `baiao`.
Não use o banco da demonstração nem um banco com informações importantes.

Linux/macOS/Git Bash:

```bash
export DATABASE_URL=postgresql://baiao:campuslab_local_demo@localhost:5432/baiao_test
export TEST_DATABASE=true
```

PowerShell:

```powershell
$env:DATABASE_URL="postgresql://baiao:campuslab_local_demo@localhost:5432/baiao_test"
$env:TEST_DATABASE="true"
```

Depois, em qualquer um desses terminais:

```bash
npm run build
npm test
npm run migration:run:prod
npm run seed:prod
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

No Linux, se faltarem bibliotecas de sistema para Chromium, use
`npx playwright install --with-deps chromium`.

Os testes de navegador iniciam um servidor temporário na porta **3101**, inserem
dados fictícios e simulam cadastro, empréstimo, devolução, edição, CSV, uso móvel,
busca vazia e falha de conexão. Os registros E2E ficam somente no banco de testes.
Feche esse terminal após terminar para não reutilizar suas variáveis no sistema normal.

O workflow do GitHub executa build, testes HTTP, integração PostgreSQL e navegador.

## Solução de problemas

| Problema                                      | Como resolver                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Cannot connect to the Docker daemon`         | Abra/inicie o Docker Desktop ou o serviço Docker antes do comando Compose.                                           |
| `npm` não reconhecido / erro de versão        | Instale Node.js 22+ e reabra o terminal.                                                                             |
| `ECONNREFUSED` ao conectar ao banco           | Confira se PostgreSQL está rodando e revise host/porta no `.env`.                                                    |
| `password authentication failed`              | Confira usuário/senha; no modo manual precisam ser iguais aos criados no PostgreSQL.                                 |
| `database ... does not exist`                 | Crie o banco conforme o passo 2B.                                                                                    |
| `relation ... does not exist`                 | Execute `npm run setup` com o banco correto.                                                                         |
| Porta 3000 ocupada no Docker                  | Altere `PORT` no `.env`, execute `docker compose up -d` e abra a nova porta.                                         |
| Porta 3000 ocupada no modo manual             | Encerre o processo anterior; o proxy do Vite aponta para a API em 3000.                                              |
| Interface indisponível em 3000                | Em desenvolvimento use 5173. Em produção execute `npm run build` antes de iniciar.                                   |
| Interface mostra erro de sincronização        | Verifique logs da API e se o banco está acessível; clique em “Tentar novamente”.                                     |
| E-mail já cadastrado                          | Use outro e-mail ou edite a pessoa existente.                                                                        |
| Não consigo excluir um cadastro               | Há empréstimos no histórico. Inative o cadastro para preservar os registros.                                         |
| Alterei a senha do Docker e parou de conectar | O volume mantém a senha anterior do banco. Restaure a configuração anterior ou altere a senha no próprio PostgreSQL. |

## Interface e referências

A interface usa os componentes oficiais **shadcn/ui (Radix Nova)**, ícones Lucide,
gráficos Recharts e fontes locais DM Sans/Manrope. Os componentes foram adicionados
como código-fonte em `web/src/components/ui`, para facilitar o estudo e a personalização.

As skills oficiais de shadcn/ui e 21st.dev orientaram a composição. Referência pública:
[App Dashboard Layout na 21st.dev](https://21st.dev/%40hello_a52e1bda/components/app-1).
A busca autenticada da 21st.dev não estava disponível; não foi instalado conteúdo
premium nem há chave de API necessária para usar o sistema.

[Prévia desktop](docs/preview-desktop.png) · [Prévia mobile](docs/preview-mobile.png)

## Limites e evolução

O escopo é acadêmico: não há login, permissões, reservas, multas ou notificações por
e-mail. As listas carregam o conjunto de registros em páginas da API e fazem
busca/filtro localmente, adequado para a demonstração; um acervo grande exigiria
busca e agregações diretamente no servidor. O patrimônio `CL-0001` é uma identificação
visual derivada do ID, não um número de série cadastrado.

Evoluções possíveis: autenticação de alunos/técnicos, reservas futuras, QR Code nos
equipamentos, registro de avarias e alertas de prazo. O foco desta versão é entregar
um fluxo completo, testável e fácil de apresentar.
