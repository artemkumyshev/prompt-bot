# Tasks: Backend API — каталог промптов (Departments / Roles / Prompts)

**Input**: Design documents from `specs/001-prompts-catalog-api/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Не в scope (спека: приёмка вручную через Swagger).

**Organization**: Задачи сгруппированы по user story для пошаговой реализации и независимой проверки.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Можно выполнять параллельно (другие файлы, нет зависимостей внутри фазы).
- **[Story]**: US1 / US2 / US3 — к какой user story относится задача.
- В описании указаны конкретные пути к файлам.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Зависимости, инфраструктура БД, базовая структура каталога.

- [x] T001 Добавить зависимости: @prisma/client, prisma, class-validator, class-transformer, @nestjs/swagger в package.json и установить (npm install)
- [x] T002 Добавить docker-compose.yml для PostgreSQL и обновить .env.example (DATABASE_URL, PORT, SWAGGER_PATH) в корне репозитория
- [x] T003 Создать структуру каталогов: src/prisma/, src/common/, src/filters/, src/modules/department/dto/, src/modules/role/dto/, src/modules/prompt/dto/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Схема БД, Prisma, глобальная валидация и формат ошибок. Без этого фазы US1–US3 не начинать.

- [x] T004 Описать Prisma-схему: модели Department, Role, Prompt (поля и индексы по data-model.md) в prisma/schema.prisma
- [x] T005 Выполнить prisma migrate dev (первая миграция) и создать PrismaService + PrismaModule в src/prisma/prisma.service.ts и src/prisma/prisma.module.ts
- [x] T006 Подключить глобальный ValidationPipe (whitelist: true, forbidNonWhitelisted: true, transform: true) в src/main.ts
- [x] T007 Реализовать Prisma Exception Filter: маппинг ошибок Prisma в { statusCode, message, errorCode, details } и зарегистрировать глобально в src/filters/prisma-exception.filter.ts
- [x] T008 Добавить общие типы/DTO: PaginatedResponseDto (items + meta), базовый query DTO (page, pageSize, sortBy, sortOrder с дефолтами updatedAt/desc) в src/common/

---

## Phase 3: User Story 1 — Управление справочниками отделов и ролей (Priority: P1) — MVP

**Goal**: CRUD для Department и Role; удаление отдела/роли запрещено при наличии зависимостей (409 HAS_DEPENDENCIES).

**Independent Test**: Создание/чтение/обновление/удаление отделов и ролей через API; при связанных промптах/ролях удаление возвращает 409.

- [ ] T009 [P] [US1] Создать DTO для Department: CreateDepartmentDto, UpdateDepartmentDto, ListDepartmentQueryDto в src/modules/department/dto/
- [ ] T010 [P] [US1] Создать DTO для Role: CreateRoleDto, UpdateRoleDto, ListRoleQueryDto в src/modules/role/dto/
- [ ] T011 [US1] Реализовать DepartmentService: CRUD, список с пагинацией/search/sort (ILIKE по name, description; пустой search игнорировать), при DELETE проверять отсутствие roles и prompts → иначе 409 в src/modules/department/department.service.ts
- [ ] T012 [US1] Реализовать RoleService: CRUD, список с пагинацией/filter departmentId/search/sort, при DELETE проверять отсутствие prompts → иначе 409 в src/modules/role/role.service.ts
- [ ] T013 [US1] Реализовать DepartmentController: GET /api/departments, GET /api/departments/:id, POST, PATCH :id, DELETE :id в src/modules/department/department.controller.ts
- [ ] T014 [US1] Реализовать RoleController: GET /api/roles, GET /api/roles/:id, POST, PATCH :id, DELETE :id в src/modules/role/role.controller.ts
- [ ] T015 [US1] Создать DepartmentModule и RoleModule, подключить PrismaModule и зарегистрировать оба модуля в src/app.module.ts

---

## Phase 4: User Story 2 — CRUD промптов и списки с пагинацией/фильтрами (Priority: P1)

**Goal**: CRUD по Prompt; списки с page/pageSize/sortBy/sortOrder, фильтры departmentId/roleId, search (ILIKE по name, task, prompt, task_description); GET :id с department и role (id, name); проверка role.departmentId === departmentId при создании/обновлении.

**Independent Test**: CRUD промптов через API; списки возвращают items + meta; фильтры и search работают; при несоответствии role/department — 400/409.

- [x] T016 [P] [US2] Создать DTO для Prompt: CreatePromptDto, UpdatePromptDto, ListPromptQueryDto и валидаторы JSON-полей (rules, key_references, criteria, evaluationRubric по контрактам data-model.md) в src/modules/prompt/dto/
- [x] T017 [US2] Реализовать PromptService: CRUD, список с departmentId/roleId/search (ILIKE), пагинация/sort; GET по id с include department и role; при create/update проверять role.departmentId === departmentId → иначе 400/409 в src/modules/prompt/prompt.service.ts
- [x] T018 [US2] Реализовать PromptController: GET /api/prompts, GET /api/prompts/:id, POST, PATCH :id, DELETE :id в src/modules/prompt/prompt.controller.ts
- [x] T019 [US2] Создать PromptModule и зарегистрировать в src/app.module.ts

---

## Phase 5: User Story 3 — Предсказуемые ошибки и документация API (Priority: P2)

**Goal**: Единый формат ошибок (уже в Phase 2 через filter); Swagger по /api/docs со всеми эндпоинтами и примерами для JSON-полей.

**Independent Test**: Все эндпоинты в Swagger; при невалидном теле — 400 VALIDATION_ERROR; при дубликате — 409 UNIQUE_CONSTRAINT; при несуществующем id — 404 NOT_FOUND.

- [x] T020 [US3] Подключить Swagger (DocumentBuilder, SwaggerModule) с base path /api и путём /api/docs в src/main.ts
- [x] T021 [P] [US3] Добавить ApiProperty и примеры (для rules, key_references, criteria, evaluationRubric) ко всем DTO в src/modules/department/dto/, src/modules/role/dto/, src/modules/prompt/dto/

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Seed и проверка по quickstart.

- [x] T022 Реализовать идемпотентный seed: 1 department, 1 role, 1 prompt (upsert по уникальным полям), контракты JSON-полей в prisma/seed.ts и добавить "prisma": { "seed": "..." } в package.json
- [x] T023 Проверить сценарий quickstart: docker-compose up, prisma migrate deploy, prisma db seed, npm run start, открыть /api/docs и пройти CRUD по всем ресурсам

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Старт сразу.
- **Phase 2 (Foundational)**: После Phase 1; блокирует все user stories.
- **Phase 3 (US1)**: После Phase 2.
- **Phase 4 (US2)**: После Phase 2 (и по смыслу после US1: промпты ссылаются на department/role).
- **Phase 5 (US3)**: После Phase 2; логично после Phase 3–4 (декораторы на готовых DTO).
- **Phase 6 (Polish)**: После Phase 3–5.

### User Story Dependencies

- **US1**: После Foundational; независима от US2/US3.
- **US2**: После Foundational (и после US1 для наличия department/role).
- **US3**: После Foundational; декораторы Swagger — после появления DTO (Phase 3–4).

### Parallel Opportunities

- Phase 1: T002 и T003 можно выполнять параллельно после T001.
- Phase 2: T007 и T008 можно выполнять параллельно после T006.
- Phase 3: T009 и T010 [P]; после сервисов T013 и T014 можно делать параллельно.
- Phase 4: T016 [P] отдельно; T018 после T017.
- Phase 5: T021 [P] — обход всех DTO.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3.
2. Проверить CRUD departments и roles через Swagger (после Phase 5 можно подключить Swagger раньше для удобства) или HTTP-клиентом.
3. Остановиться и зафиксировать MVP.

### Incremental Delivery

1. Setup + Foundational → база готова.
2. US1 → проверка справочников.
3. US2 → проверка промптов и списков.
4. US3 → полная документация и единый формат ошибок.
5. Polish → seed и финальная проверка по quickstart.

---

## Notes

- Тесты не создаём (scope).
- Каждая задача сформулирована так, чтобы её можно было выполнить по описанию и путям к файлам.
- После каждой фазы имеет смысл проверить соответствующие сценарии из spec.md и закоммитить изменения.
