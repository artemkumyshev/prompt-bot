# Implementation Plan: Backend API — каталог промптов (Departments / Roles / Prompts)

**Branch**: `001-prompts-catalog-api` | **Date**: 2025-02-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-prompts-catalog-api/spec.md`

## Summary

REST API для локального личного кабинета: полный CRUD по Department, Role и Prompt с пагинацией, сортировкой, фильтрами и поиском (ILIKE). Стек: NestJS + Prisma + PostgreSQL в Docker; валидация через class-validator/ValidationPipe; единый формат ошибок и Prisma exception filter; Swagger по /api/docs; идемпотентный seed. Без авторизации и без тестов (приёмка ручная через Swagger).

## Technical Context

**Language/Version**: TypeScript (Node.js LTS)  
**Primary Dependencies**: NestJS, Prisma, class-validator, class-transformer, @nestjs/swagger  
**Storage**: PostgreSQL (docker-compose); Prisma ORM, миграции и seed  
**Testing**: N/A (тесты не в scope; приёмка вручную через Swagger)  
**Target Platform**: Node.js сервер (локальная разработка и развёртывание)  
**Project Type**: single (backend API в монорепо, существующая структура src/)  
**Performance Goals**: Разумная отзывчивость списков; индексы на name, departmentId, roleId  
**Constraints**: Единый формат ошибок; логи без полных тел запросов; last-write-wins при concurrent PATCH  
**Scale/Scope**: Локальный кабинет, один оператор; явных лимитов по объёму данных не задано  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **§0 Mission**: API для каталога промптов (department, role, prompt); без auth, тестов, внешних интеграций — соответствует.
- [x] **§1 Stack**: Node.js, TypeScript, NestJS, Prisma, PostgreSQL, Docker, Swagger, class-validator/class-transformer, Nest Logger — соответствует.
- [x] **§2 API**: REST, коды 200/201/400/404/409/500, JSON, единый формат ошибок; DTO + ValidationPipe (whitelist, forbidNonWhitelisted, transform) — соответствует.
- [x] **§3 Data Model**: Department, Role (с departmentId), Prompt (roleId, departmentId, JSONB для rules/key_references/criteria/evaluationRubric) — соответствует.
- [x] **§4 NestJS structure**: Модули department, role, prompt; common/, prisma/; тонкий Controller, логика в Service, доступ через PrismaService — соответствует.
- [x] **§5 Validation**: Уникальность Department.name и (departmentId, name) для Role; проверка FK и role∈department для Prompt; запрет удаления при зависимостях — соответствует.
- [x] **§6 Lists**: page, pageSize, sortBy, sortOrder (default updatedAt desc), фильтры и search (ILIKE); ответ items + meta — соответствует.
- [x] **§7 Swagger**: Обязателен; DTO с декораторами и примерами для JSON-полей — соответствует.
- [x] **§8 Errors**: Exception filter для Prisma; statusCode, message, errorCode, details — соответствует.
- [x] **§9 Migrations & seed**: Prisma migrations; идемпотентный seed (минимум 1 department, 1 role, 1 prompt) — соответствует.
- [x] **§10 Docker**: docker-compose для Postgres; backend локально; DATABASE_URL, PORT, SWAGGER_PATH — соответствует.
- [x] **§12 DoD**: Schema/миграции, CRUD, валидация, Swagger, seed, единый формат ошибок — соответствует.
- [x] **§13 Constraints**: Нет auth, нет тестов, нет фоновых задач, нет версионирования API — соответствует.

**Result**: Все проверки пройдены; нарушений нет.

## Project Structure

### Documentation (this feature)

```text
specs/001-prompts-catalog-api/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 (API contracts)
└── tasks.md             # Phase 2 (/speckit.tasks — not created by plan)
```

### Source Code (repository root)

Существующая структура дополняется модулями каталога и общими компонентами по конституции (§4):

```text
src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── telegram/           # существующий
│   ├── department/         # department.module, .controller, .service, dto/
│   ├── role/               # role.module, .controller, .service, dto/
│   └── prompt/             # prompt.module, .controller, .service, dto/
├── common/                 # пагинация, типы meta, query DTO base
├── prisma/
│   └── prisma.service.ts
├── filters/
│   └── prisma-exception.filter.ts
├── pipes/
├── shared/
│   ├── config/
│   └── database/           # JSON-данные (при необходимости для seed/справочников)
```

**Structure Decision**: Один backend в `src/`; модули каталога (department, role, prompt) по конституции; общие prisma, filters, common — переиспользуются. Тесты не создаём (scope).

## Complexity Tracking

Не применимо — нарушений конституции нет.
