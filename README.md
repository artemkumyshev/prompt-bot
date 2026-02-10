# Prompt Bot · Каталог промптов

Backend API для каталога промптов: справочники отделов и ролей, CRUD промптов с фильтрами, пагинацией и единым форматом ошибок.

---

## Возможности

- **Отделы (Departments)** — CRUD, список с поиском и сортировкой
- **Роли (Roles)** — CRUD с привязкой к отделу, проверка зависимостей при удалении
- **Промпты (Prompts)** — CRUD с полями `rules`, `key_references`, `criteria`, `evaluationRubric` (JSON), фильтры по отделу/роли, поиск по тексту
- **Swagger** — интерактивная документация по адресу `/api/docs`
- **Валидация** — единый формат ответов об ошибках (в т.ч. Prisma: 404, 409, валидация тела)

---

## Стек

| Технология | Назначение |
|------------|------------|
| **NestJS** | API, модули, пайпы, фильтры |
| **Prisma** | ORM, миграции, типы |
| **PostgreSQL** | База данных |
| **class-validator / class-transformer** | DTO и валидация |
| **Swagger (OpenAPI)** | Документация API |

---

## Требования

- **Node.js** (LTS, рекомендуется 18+)
- **Docker** и **Docker Compose** — для PostgreSQL и опционально для запуска приложения в контейнере
- **npm**

---

## Быстрый старт

### Вариант 1: Всё в Docker

Поднять PostgreSQL и приложение одной командой:

```bash
make docker-up
```

- API: **http://localhost:3000/api**
- Swagger: **http://localhost:3000/api/docs**

Миграции применяются при старте контейнера приложения. Тестовые данные (seed) можно добавить с хоста:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prompt_bot" make db-seed
```

### Вариант 2: Разработка (БД в Docker, приложение локально)

```bash
# Поднять только PostgreSQL
docker compose up -d postgres

# Настроить окружение
cp .env.example .env
# Отредактировать .env: DATABASE_URL, при необходимости PORT

# Зависимости, миграции, seed
make install
make db-migrate-deploy
make db-seed

# Запуск с hot-reload
make dev
```

После запуска откройте **http://localhost:3000/api/docs** (или свой `PORT`).

---

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://postgres:postgres@localhost:5432/prompt_bot` |
| `PORT` | Порт HTTP-сервера | `3000` |
| `SWAGGER_PATH` | Путь к Swagger UI | `api/docs` (по умолчанию) |
| `TELEGRAM_BOT_TOKEN` | Токен бота (если используется Telegram) | — |
| `TELEGRAM_BOT_NAME` | Имя бота | — |

Файл **.env** создаётся из **.env.example**; для локальной разработки обязательно задайте `DATABASE_URL`.

---

## API

Базовый путь: **`/api`**.

| Ресурс | Эндпоинты |
|--------|-----------|
| **Departments** | `GET/POST /api/departments`, `GET/PATCH/DELETE /api/departments/:id` |
| **Roles** | `GET/POST /api/roles`, `GET/PATCH/DELETE /api/roles/:id` |
| **Prompts** | `GET/POST /api/prompts`, `GET/PATCH/DELETE /api/prompts/:id` |

Списки поддерживают пагинацию (`page`, `pageSize`), сортировку (`sortBy`, `sortOrder`) и, где предусмотрено, фильтры и поиск. Полное описание запросов и ответов — в Swagger: **http://localhost:3000/api/docs**.

---

## Команды Make

Удобные цели для повседневной работы (подробнее: `make help`):

| Команда | Описание |
|---------|----------|
| `make help` | Список всех команд с описаниями |
| `make docker-up` | Запустить Docker (postgres + app) |
| `make docker-down` | Остановить контейнеры |
| `make docker-logs` | Логи контейнеров |
| `make db-migrate` | Миграции (dev) |
| `make db-migrate-deploy` | Миграции (deploy) |
| `make db-seed` | Заполнить БД тестовыми данными |
| `make db-studio` | Открыть Prisma Studio |
| `make dev` | Запуск приложения с hot-reload |
| `make build` | Сборка проекта |
| `make start` | Запуск собранного приложения |
| `make lint` | Проверка кода (ESLint) |
| `make format` | Форматирование (Prettier) |
| `make type-check` | Проверка типов (TypeScript) |
| `make generate` | Сгенерировать Prisma Client |

Команды для БД (`db-migrate`, `db-seed`, `db-studio`, `db-reset`) требуют наличия файла **.env** с корректным **DATABASE_URL**.

---

## Структура проекта

```
├── prisma/
│   ├── schema.prisma    # Модели Department, Role, Prompt
│   ├── migrations/      # Миграции
│   └── seed.ts          # Идемпотентный seed (1 отдел, 1 роль, 1 промпт)
├── src/
│   ├── main.ts          # Точка входа, Swagger, ValidationPipe, Prisma filter
│   ├── common/          # Общие DTO (пагинация, list-query)
│   ├── filters/         # Prisma Exception Filter
│   ├── prisma/          # PrismaService, PrismaModule
│   └── modules/
│       ├── department/  # CRUD отделов
│       ├── role/        # CRUD ролей
│       └── prompt/      # CRUD промптов (с JSON-полями)
├── docker-compose.yml   # PostgreSQL + приложение
├── Dockerfile           # Multi-stage сборка приложения
└── Makefile             # Команды для сборки, БД и разработки
```

---

## Лицензия

UNLICENSED (приватный репозиторий).
