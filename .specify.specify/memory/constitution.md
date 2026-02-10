<!--
Sync Impact Report
- Version: 1.0.0 → 2.0.0
- Modified principles: Mission (refined), Architecture (NestJS modules + Prisma), Data Model (Role optional departmentId, JSONB), API (page/pageSize, sortBy/sortOrder), Validation, Security (removed auth), Testing (no tests), DoD (Prisma, Swagger, seed), Default Decisions.
- Added sections: Stack (§1), API design (§2), Data model principles (§3), NestJS structure (§4), Validation & integrity (§5), Lists/filters (§6), Swagger (§7), Errors (§8), Migrations & seed (§9), Docker (§10), NFR (§11), DoD (§12), Constraints (§13).
- Removed sections: Spec-Kit Specific (merged into workflow note); separate Security as auth removed; Rate limiting (not in scope).
- Templates: ✅ plan-template.md (DoD §12), spec-template.md (refs §2,§3,§5–§8), tasks-template.md (Swagger, tests out of scope). specs/001-prompts-catalog-api/* — ⚠ рекомендуется выровнять под Prisma, page/pageSize, без auth.
- Follow-up TODOs: При реализации Phase 1+ обновить spec.md и tasks.md под Prisma, Docker, Swagger, пагинацию page/pageSize и отсутствие X-Admin-Key.
-->

# Constitution: Prompt Bot Backend API

**Project:** prompt-bot.lc — Backend API для каталога промптов (Department / Role / Prompt)  
**Constitution Version:** 2.0.0  
**Ratification Date:** 2025-02-10  
**Last Amended:** 2025-02-10

---

## 0. Mission

Построить стабильный и простой Backend API для управления каталогом промптов и их метаданными (department, role, prompt), чтобы локальный «личный кабинет» мог получать, создавать и обновлять данные через HTTP API.

**Ключевой фокус:** предсказуемая модель данных, корректные связи, строгая валидация входящих данных, удобные списки/фильтры/сортировки, понятная документация (Swagger).

**Не делаем:** авторизация, роли пользователей, платежи, тесты, внешние интеграции.

---

## 1. Stack and Base Decisions

- **Runtime:** Node.js + TypeScript  
- **Framework:** NestJS  
- **ORM:** Prisma  
- **DB:** PostgreSQL  
- **Контейнеризация:** Docker / docker-compose  
- **Документация API:** Swagger (NestJS OpenAPI)  
- **Валидация:** class-validator + class-transformer  
- **Логирование:** встроенный Nest Logger + структурированные сообщения  

---

## 2. API Design Principles

### 2.1 REST and predictability

- REST-эндпоинты и стандартные HTTP-коды:
  - **200 / 201** — успешные ответы
  - **400** — ошибка валидации/формата
  - **404** — не найдено
  - **409** — конфликт уникальности
  - **500** — непредвиденная ошибка
- Ответы всегда в JSON.
- Ошибки — в едином формате.

### 2.2 Explicit contracts

- DTO обязательны для всех входящих данных (Create / Update).
- Валидация DTO через ValidationPipe: `whitelist=true`, `forbidNonWhitelisted=true`, `transform=true`.
- На чтение допускаются query-параметры для пагинации, сортировки и фильтрации.

### 2.3 No “magic” fields

- Поля и типы фиксированы схемой Prisma.
- Списковые поля (rules, keyReferences, criteria, evaluationRubric) хранятся так, чтобы ими было удобно управлять и при необходимости версионировать.

---

## 3. Data Model and Relations (Principles)

### 3.1 Department

- `id`: UUID (генерируется БД/Prisma)
- `name`: string (unique)
- `description`: string (optional)
- `icon`: string (optional)

### 3.2 Role

- `id`: UUID
- `name`: string (unique в рамках системы; рекомендуется unique в связке с departmentId)
- `description`: string (optional)
- `icon`: string (optional)
- **Связь:** Role привязана к Department (`role.departmentId`). Иначе фильтрация и UX в кабинете размыты. Решение зафиксировать в Prisma-схеме.

### 3.3 Prompt

- `id`: UUID
- `name`: string
- `icon`: string (optional)
- `prompt`: text (основная инструкция)
- `task`: string
- `taskDescription`: text (optional)
- `roleId`: UUID (FK)
- `departmentId`: UUID (FK)

**Списочные поля (в API — camelCase):** `rules[]`, `keyReferences[]`, `criteria[]`, `evaluationRubric[]`.

**Хранение:** JSONB — баланс скорость/простота для MVP. Если понадобится поиск по вложенным данным — нормализовать позже.

---

## 4. NestJS Architecture (Required Structure)

- **Модули:** `modules/department`, `modules/role`, `modules/prompt`
- В каждом модуле: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`; при необходимости — `*.repository.ts`
- **Общее:** `common/`, `prisma/prisma.service.ts`, `filters/`, `pipes/`, `interceptors/`, `types/`

**Принцип:** Controller тонкий; вся логика в Service. Доступ к БД через PrismaService (или репозитории при выделении слоя).

---

## 5. Validation and Data Integrity

### 5.1 Input validation

- `name`: trim, min/max длина
- `icon`: строка (URL или имя иконки; правило фиксируем)
- `prompt` / `task` / `taskDescription`: minLen, maxLen

### 5.2 Uniqueness

- `Department.name` — unique
- `Role.name` — unique (или unique вместе с departmentId)
- При конфликте — **409** с понятным сообщением

### 5.3 Relations

- Prompt нельзя создать, если `roleId` или `departmentId` не существуют.
- При удалении department/role: **запрещаем удаление, если есть связанные prompts (409)**. Каскадное удаление не применяем, чтобы не терять данные в админке.

---

## 6. Lists, Filters, Sort, Pagination

### 6.1 Pagination

- Query: `page`, `pageSize`
- Ответ: `items` + `meta` (page, pageSize, total)

### 6.2 Sort

- `sortBy` (например: name, createdAt, updatedAt)
- `sortOrder` (asc / desc)

### 6.3 Filters (prompts)

- `departmentId`
- `roleId`
- `search` (по name + task + prompt, базовый ILIKE)

**Принцип:** все query-параметры валидируются и приводятся к нужным типам.

---

## 7. Documentation (Swagger) — Mandatory

- Все DTO покрыты декораторами Swagger.
- Примеры (example) для сложных JSONB-полей (rules, keyReferences, criteria, evaluationRubric) добавляются сразу.

---

## 8. Errors and Exceptions

- Ошибки Prisma преобразуются в человекочитаемые (через Exception Filter).
- Единый формат ответа об ошибке:
  - `statusCode`
  - `message`
  - `errorCode` (например: VALIDATION_ERROR, UNIQUE_CONSTRAINT, NOT_FOUND)
  - `details` (опционально)

---

## 9. Migrations and Seed

- **Prisma migrations** — источник истины для схемы.
- **Seed** обязателен:
  - минимум 1 department, 1 role, 1 prompt, чтобы локальный кабинет сразу мог работать;
  - seed идемпотентен (повторный запуск не ломает БД).

---

## 10. Docker and Local Run

- docker-compose поднимает Postgres.
- Backend запускается локально (npm/yarn/pnpm) и подключается к БД в контейнере.
- Переменные окружения: `DATABASE_URL`, `PORT`, при необходимости `SWAGGER_PATH`.

**Принцип:** один шаг — поднять инфраструктуру, один шаг — запустить API.

---

## 11. Non-Functional Requirements

- Быстрые ответы на списки: индексы на name, departmentId, roleId.
- Логи без персональных данных (в текущем scope их нет).
- Стабильность важнее «красоты»; никаких абстракций ради абстракций.

---

## 12. Definition of Done (Backend)

Фича считается готовой, если:

- Prisma schema и миграции обновлены
- CRUD-эндпоинты работают
- Валидация DTO есть
- Swagger обновлён и отражает реальный контракт
- Seed обновлён (если нужно)
- Ошибки возвращаются в едином формате

---

## 13. Explicit Constraints

- **Нет авторизации:** эндпоинты не защищены
- **Нет тестов:** компенсируем строгой валидацией и ручными проверками через Swagger / HTTP-клиент
- Нет фоновых задач и очередей
- Нет версионирования API (пока)

---

## 14. Governance

- **Amendments:** изменения конституции вносятся через явное обновление этого файла с инкрементом версии и обновлением Last Amended.
- **Versioning:** семантическое версионирование (MAJOR — несовместимые изменения принципов/контрактов, MINOR — новые принципы/секции, PATCH — уточнения, опечатки).
- **Compliance:** при реализации фич и рефакторинге решения MUST соответствовать описанным принципам; расхождения либо вносятся в конституцию, либо документируются как исключения с обоснованием.
