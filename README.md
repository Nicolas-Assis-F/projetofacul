# Baiao API

RESTful API built with **Node.js**, **Express**, **TypeScript**, **TypeORM** and **PostgreSQL**.

## Prerequisites

- Node.js 22+
- PostgreSQL 14+
- npm

## Project Structure

```
src/
├── config/
│   └── database.ts          # DataSource configuration
├── entities/
│   ├── Situation.ts
│   ├── User.ts
│   ├── ProductCategory.ts
│   ├── ProductSituation.ts
│   └── Product.ts
├── migrations/
│   └── 1722000000000-CreateTables.ts
├── seeds/
│   └── seed.ts
├── services/
│   ├── UserService.ts       # Business logic + pagination
│   └── ProductService.ts
├── controllers/
│   ├── UserController.ts
│   └── ProductController.ts
├── routes/
│   ├── userRoutes.ts
│   ├── productRoutes.ts
│   └── index.ts
├── middlewares/
│   └── errorHandler.ts
├── app.ts
└── server.ts
```

## Installation

```bash
npm install
```

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

## Database Setup

```bash
# 1. Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE baiao_db;"

# 2. Run migrations (creates all tables and foreign keys)
npm run migration:run

# 3. Seed domain tables (situations, product_categories, product_situations)
npm run seed
```

## Running the Server

```bash
# Development (hot-reload)
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Users

| Method | Endpoint   | Description            |
| ------ | ---------- | ---------------------- |
| GET    | /users     | List users (paginated) |
| GET    | /users/:id | Get user by ID         |
| POST   | /users     | Create user            |
| PUT    | /users/:id | Update user            |
| DELETE | /users/:id | Delete user            |

### Products

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| GET    | /products     | List products (paginated) |
| GET    | /products/:id | Get product by ID         |
| POST   | /products     | Create product            |
| PUT    | /products/:id | Update product            |
| DELETE | /products/:id | Delete product            |

### Pagination Query Parameters

| Param | Default | Description              |
| ----- | ------- | ------------------------ |
| page  | 1       | Page number (≥ 1)        |
| limit | 10      | Records per page (1–100) |

Example: `GET /api/v1/users?page=2&limit=5`

### Paginated Response Shape

```json
{
  "data": [...],
  "total": 42,
  "page": 2,
  "limit": 5,
  "totalPages": 9
}
```

### Create User – Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "situationId": 1
}
```

### Create Product – Request Body

```json
{
  "name": "Laptop Pro",
  "productSituationId": 1,
  "productCategoryId": 1
}
```

## TypeORM Migration Commands

```bash
# Generate a new migration after changing entities
npm run typeorm -- migration:generate src/migrations/NewMigrationName -d src/config/database.ts

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Validação e testes

```bash
npm test
# Use um banco isolado, já migrado e populado:
DATABASE_URL=postgresql://user:password@localhost:5432/baiao_test TEST_DATABASE=true npm run test:integration
npm audit
```

A integração exercita criação, leitura, atualização, exclusão, paginação,
relacionamentos, e-mail duplicado e referências inválidas em PostgreSQL real.
O GitHub Actions executa esses testes a cada push e pull request.

## Rotas adicionais e erros

- `GET /`: nome, versão e diretório de endpoints.
- `GET /health`: disponibilidade do processo.
- `GET /ready`: disponibilidade do banco (503 se indisponível).
- `GET /api/v1/catalogs`: situações de usuários, categorias e situações de produtos,
  com os IDs que devem ser enviados nos cadastros.

IDs e parâmetros de paginação inválidos retornam 400. JSON malformado retorna
400; corpo inválido, atualização vazia e referências inexistentes retornam 422;
e-mail já cadastrado retorna 409; registro ou rota inexistente retorna 404.
Nomes são aparados e e-mails são normalizados para minúsculas. `PUT` aceita
atualização parcial, mas exige pelo menos um campo conhecido.

## Execução com Docker

```bash
cp .env.example .env
# Defina DB_PASS no .env antes de iniciar.
docker compose up --build -d
```

A API fica em `http://localhost:3000`; o PostgreSQL usa volume persistente.
Migrações e seed são executados na inicialização. `docker compose down` preserva
os dados; não use `--volumes` se quiser mantê-los.

## Publicação no Render

O arquivo `render.yaml` configura a API e um PostgreSQL para demonstração.
Ele aponta para a branch `Nicolas-Assis-F/terminar` deste repositório.

1. Entre em [Render](https://dashboard.render.com/), escolha **New → Blueprint**
   e conecte este repositório.
2. Selecione a branch `Nicolas-Assis-F/terminar` e revise os recursos do blueprint.
3. Aplique o blueprint e aguarde a implantação. A URL pública aparece no serviço
   `baiao-api`; verifique `/ready` e `/api/v1/catalogs`.

O comando `start:deploy` aplica migrações e popula somente as tabelas de domínio.
Os seeds podem ser repetidos e não criam usuários ou produtos fictícios.
A API mantém o escopo acadêmico original, sem autenticação: todos os endpoints
ficam acessíveis a quem conhecer a URL. Use dados de demonstração.
O plano gratuito tem limites e expiração do banco; consulte a
[documentação do Render](https://render.com/docs/free) antes de guardar dados permanentes.

Para outro provedor Node.js, use build `npm ci --include=dev && npm run build`,
start `npm run start:deploy`, `DATABASE_URL` e `NODE_ENV=production`.
`DB_SSL=true` habilita TLS com verificação de certificado; `CORS_ORIGIN` aceita
uma lista de origens separadas por vírgula. A aplicação respeita `PORT`.

## License

MIT
