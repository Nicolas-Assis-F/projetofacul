# CampusLab — API

Base local: `http://localhost:3000/api/v1`. Requisições com corpo usam
`Content-Type: application/json`. O projeto acadêmico não exige autenticação.

## Endpoints

| Método | Rota                | Resultado                                        |
| ------ | ------------------- | ------------------------------------------------ |
| GET    | `/users`            | Pessoas paginadas, com situação                  |
| GET    | `/users/:id`        | Pessoa pelo ID                                   |
| POST   | `/users`            | Cria pessoa (201)                                |
| PUT    | `/users/:id`        | Atualiza campos informados                       |
| DELETE | `/users/:id`        | Exclui se não há histórico (204)                 |
| GET    | `/products`         | Equipamentos paginados, com categoria e situação |
| GET    | `/products/:id`     | Equipamento pelo ID                              |
| POST   | `/products`         | Cria equipamento (201)                           |
| PUT    | `/products/:id`     | Atualiza campos informados                       |
| DELETE | `/products/:id`     | Exclui se não há histórico (204)                 |
| GET    | `/catalogs`         | IDs e nomes de categorias e situações            |
| GET    | `/loans`            | Empréstimos paginados com pessoa e equipamento   |
| POST   | `/loans`            | Registra retirada (201)                          |
| POST   | `/loans/:id/return` | Confirma devolução (200)                         |

Fora de `/api/v1`: `GET /api` apresenta o diretório da API, `GET /health` verifica
o processo e `GET /ready` verifica a conexão com o banco (200 ou 503).

## Paginação

`GET /products?page=1&limit=10`. `page` deve ser um inteiro positivo e `limit` deve
ficar entre 1 e 100. Os valores padrão são 1 e 10.

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## Cadastro de pessoa

Consulte `/catalogs` antes de escolher os IDs. Exemplo:

```json
{
  "name": "Ana Clara",
  "email": "ana@exemplo.com",
  "situationId": 1
}
```

O nome tem entre 2 e 150 caracteres. E-mail é validado, normalizado para minúsculas
e precisa ser único. As situações internas são `Active`, `Inactive` e `Pending`,
traduzidas pela interface.

## Cadastro de equipamento

```json
{
  "name": "Kit Arduino Uno",
  "productCategoryId": 3,
  "productSituationId": 1
}
```

IDs acima são ilustrativos. A situação `Available` permite empréstimos.
`Out of Stock` é apresentada como manutenção e `Discontinued` como inativo.
O estado “Emprestado” é derivado da existência de um empréstimo sem devolução,
sem sobrescrever a situação administrativa do equipamento.

## Registro de empréstimo

```json
{
  "userId": 1,
  "productId": 1,
  "dueAt": "2030-12-20T23:59:59-03:00",
  "notes": "Projeto de robótica"
}
```

O prazo deve ser uma data/hora ISO 8601 com fuso, no futuro. `notes` é opcional e
aceita até 500 caracteres. Pessoa precisa estar ativa, equipamento disponível e
sem outro empréstimo ativo. A devolução usa `POST /loans/ID/return`, sem corpo.

`returnedAt` preenchido indica devolução. Sem devolução e com `dueAt` vencido,
o empréstimo está em atraso. A API preserva as datas e a interface calcula a apresentação.

## Respostas de erro

| Código | Uso                                                                                      |
| ------ | ---------------------------------------------------------------------------------------- |
| 400    | ID/paginação inválidos ou JSON malformado                                                |
| 404    | Rota ou registro inexistente                                                             |
| 409    | E-mail duplicado, equipamento já emprestado, cadastro indisponível ou devolução repetida |
| 413    | Corpo acima do limite aceito                                                             |
| 422    | Campos inválidos, referência inexistente ou exclusão bloqueada por histórico             |
| 500    | Erro interno, sem detalhes do banco expostos ao cliente                                  |

`PUT` aceita atualização parcial, mas precisa conter pelo menos um campo conhecido.
Nomes são aparados. Erros de validação incluem `message` e uma lista `errors` com
`field` e `message`.
