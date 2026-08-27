# Baiao API

RESTful API built with **Node.js**, **Express**, **TypeScript**, **TypeORM** and **PostgreSQL**.

## Prerequisites

- Node.js 18+
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
npm run migration:generate -- src/migrations/NewMigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Git Setup & GitHub

```bash
# Initialize repository and first commit
git init
git add .
git commit -m "feat: initial RESTful API with Node.js, Express, TypeScript, TypeORM and PostgreSQL"

# Create a new empty repository on https://github.com/new
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/baiao-api.git
git branch -M main
git push -u origin main
```

## License

MIT
