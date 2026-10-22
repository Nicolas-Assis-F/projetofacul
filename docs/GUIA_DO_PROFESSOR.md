# Guia de avaliação — CampusLab

## Antes de começar

Siga o [README](../README.md#como-executar) para clonar e iniciar. Com Docker ou
versão compilada, abra **http://localhost:3000**. Com `npm run dev`, abra
**http://localhost:5173**. Não é necessário fazer login.

Em um banco novo, a demonstração inclui 20 equipamentos, 12 pessoas e 18 empréstimos
(12 devolvidos e 6 ativos). Os e-mails terminam em `campuslab.example` e são fictícios.
Os prazos são relativos à primeira execução do seed. Não são recalculados em cada início.

## Roteiro de apresentação — 5 a 8 minutos

### 1. Entender o problema

O laboratório empresta recursos para atividades acadêmicas. O sistema precisa saber
quem retirou cada equipamento, quando deve devolvê-lo e quais recursos estão livres.
A página inicial resume essas informações a partir dos dados persistidos.

### 2. Cadastrar uma pessoa

Abra **Pessoas → Nova pessoa** e preencha:

- Nome: `Aluno de Avaliação`.
- E-mail: `avaliacao@exemplo.com` (use outro se já existir).
- Situação: `Ativo`.

Resultado esperado: mensagem de sucesso. Busque o nome para localizar o cadastro.
Um segundo cadastro com o mesmo e-mail deve ser rejeitado.

### 3. Cadastrar um equipamento

Abra **Equipamentos → Novo equipamento**:

- Nome: `Notebook da apresentação`.
- Categoria: `Informática`.
- Situação: `Disponível`.

Resultado esperado: equipamento listado com identificação `CL-xxxx`. O código é
formado automaticamente a partir do ID. Use a busca para encontrá-lo.

### 4. Registrar um empréstimo

Na linha do equipamento, clique em **Emprestar**. Selecione a pessoa criada,
defina uma data futura e escreva uma observação, como `Apresentação de projeto`.
Confirme o empréstimo.

Resultados esperados:

- O equipamento passa a aparecer como `Emprestado`.
- O botão para emprestá-lo novamente fica indisponível.
- Em **Empréstimos**, a retirada aparece com pessoa, prazo e situação.
- O ícone de detalhes permite consultar a observação e as datas.
- A visão geral reflete a movimentação.

A proteção também existe no servidor e no banco, não apenas no botão da interface.
Duas requisições simultâneas para o mesmo equipamento resultam em uma criação e um conflito.

### 5. Registrar a devolução

Em **Empréstimos**, busque o equipamento, clique em **Devolver** e confirme.

Resultados esperados:

- Situação `Devolvido` e data efetiva da devolução.
- Equipamento disponível novamente, se seu cadastro continuar disponível.
- Histórico preservado. Não é possível confirmar a mesma devolução duas vezes.

### 6. Conferir busca, filtros e CSV

Filtre equipamentos por categoria e situação. Busque um nome inexistente para ver
o estado vazio. Use **Exportar**: o arquivo CSV contém todos os resultados filtrados,
não apenas a página visível. Abra-o no Excel ou LibreOffice com separador ponto e vírgula.

### 7. Conferir histórico e persistência

Tente excluir o equipamento usado no empréstimo. O servidor recusa a exclusão
porque há histórico. Para desativá-lo, use **Editar → Inativo**.

Atualize a página: os dados continuam salvos no PostgreSQL. Reiniciar a aplicação
não remove os registros. No Docker, o volume também preserva os dados entre reinícios.

### 8. Conferir o celular

Reduza a janela ou abra as ferramentas do navegador em modo de dispositivo móvel.
O menu lateral vira um botão. Tabelas largas rolam dentro do painel, sem alargar a página.

## Pontos técnicos demonstrados

| Conceito        | Onde observar                                                                  |
| --------------- | ------------------------------------------------------------------------------ |
| CRUD            | Cadastros de pessoas e equipamentos                                            |
| Relacionamentos | Pessoa/situação, equipamento/categoria/situação, empréstimo/pessoa/equipamento |
| Migrações       | `src/migrations/` cria estrutura versionada, sem sincronização automática      |
| Validação       | Zod nos corpos e validação de IDs/paginação                                    |
| Integridade     | E-mail único, chaves estrangeiras e índice parcial de empréstimo ativo         |
| Concorrência    | Transação com bloqueio de linha em `LoanService`                               |
| Arquitetura     | Interface, rotas, controladores/serviços e entidades separados                 |
| Acessibilidade  | Rótulos de formulário, modais Radix, foco e navegação por teclado              |
| Testes          | HTTP, integração com PostgreSQL e navegador com Playwright                     |

## O que não faz parte do escopo

Login, controle de permissões, pagamento de multas, reservas e envio de mensagens
não estão implementados. O espaço acadêmico exibido na barra lateral identifica
o ambiente; não representa um usuário autenticado.

A demonstração usa dados reais do banco, mas os registros iniciais são fictícios.
Não há indicadores inventados para preencher o painel.
