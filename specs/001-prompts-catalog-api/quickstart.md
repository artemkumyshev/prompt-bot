# Quickstart: Backend API — каталог промптов

**Feature**: 001-prompts-catalog-api

## Предварительные условия

- Node.js (LTS)
- Docker и Docker Compose
- npm (или yarn/pnpm)

## Шаги

### 1. Поднять PostgreSQL

Из корня репозитория:

```bash
docker-compose up -d
```

Ожидается сервис `postgres` с портом 5432 и переменная `DATABASE_URL` в `.env` (см. ниже).

### 2. Переменные окружения

Скопировать `.env.example` в `.env` и задать:

- `DATABASE_URL` — строка подключения к PostgreSQL (например `postgresql://user:password@localhost:5432/prompt_bot`)
- `PORT` — порт приложения (например 3000)
- При необходимости: `SWAGGER_PATH` — путь к Swagger UI (по умолчанию /api/docs)

### 3. Установка зависимостей и миграции

```bash
npm install
npx prisma migrate deploy
```

(Для разработки: `npx prisma migrate dev` при изменении схемы.)

### 4. Seed (опционально, но рекомендуется)

```bash
npx prisma db seed
```

Создаётся минимум один department, одна role и один prompt; повторный запуск идемпотентен.

### 5. Запуск API

```bash
npm run start
```

Для разработки с hot-reload:

```bash
npm run start:dev
```

### 6. Проверка

- **Swagger**: открыть в браузере `http://localhost:<PORT>/api/docs`
- **Health/readiness**: при наличии эндпоинтов GET /health, GET /ready — проверить доступность и (для ready) подключение к БД

## Итог

- Один шаг — поднять инфраструктуру (docker-compose).
- Один шаг — установка, миграции, seed, запуск приложения (npm install, prisma migrate, prisma db seed, npm run start).

Соответствует конституции §10.
