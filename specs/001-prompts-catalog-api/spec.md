# Feature Specification: Backend API — каталог промптов (Departments / Roles / Prompts)

**Feature Branch**: `001-prompts-catalog-api`  
**Created**: 2025-02-10  
**Status**: Draft  
**Input**: Backend API для локального личного кабинета: управление каталогом промптов (Department, Role, Prompt). Без авторизации и тестов. Стек: Docker, PostgreSQL, Prisma, NestJS, TypeScript.

**Constitution alignment**: `.specify.specify/memory/constitution.md` (§2 API Design, §3 Data Model, §5 Validation, §6 Lists/Pagination, §7 Swagger, §8 Errors). Scope не противоречит принципам и ограничениям (нет auth, нет тестов).

---

## Clarifications

### Session 2025-02-10

- Q: Какие значения sortBy и sortOrder по умолчанию для списков (departments, roles, prompts)? → A: sortBy=updatedAt, sortOrder=desc для всех списков.
- Q: Поведение при одновременном PATCH одной и той же сущности? → A: Last-write-wins; проверка версии/ETag не требуется.
- Q: Семантика параметра search (подстрока / точное совпадение, регистр)? → A: Подстрока без учёта регистра (ILIKE); одно значение search применяется ко всем указанным полям.
- Q: Поведение при пустом параметре search (search=)? → A: Игнорировать: пустой search не применяется, фильтр по поиску не действует.
- Q: Проверять ли при создании/обновлении промпта, что роль принадлежит указанному отделу? → A: Да; при несоответствии (role.departmentId !== departmentId) возвращать 400/409 с сообщением о несоответствии.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Управление справочниками отделов и ролей (Priority: P1)

Оператор личного кабинета создаёт и редактирует отделы (departments) и роли (roles), привязанные к отделам, чтобы структурировать каталог промптов.

**Why this priority**: Без отделов и ролей нельзя осмысленно создавать промпты и фильтровать их в интерфейсе.

**Independent Test**: Создание/чтение/обновление/удаление отделов и ролей через API; при наличии связанных промптов удаление отдела/роли запрещено (ошибка 409).

**Acceptance Scenarios**:

1. **Given** нет отделов, **When** оператор создаёт отдел с именем и опцией описания/иконки, **Then** отдел сохраняется и возвращается с id.
2. **Given** есть отдел, **When** оператор создаёт роль с привязкой к этому отделу, **Then** роль сохраняется; имя роли уникально в рамках отдела.
3. **Given** у отдела есть роли или промпты, **When** оператор запрашивает удаление отдела, **Then** система возвращает 409 (HAS_DEPENDENCIES) и не удаляет отдел.
4. **Given** у роли есть промпты, **When** оператор запрашивает удаление роли, **Then** система возвращает 409 (HAS_DEPENDENCIES).

---

### User Story 2 — CRUD промптов и списки с пагинацией/фильтрами (Priority: P1)

Оператор создаёт, просматривает, редактирует и удаляет промпты; просматривает списки с пагинацией, сортировкой и фильтрами (по отделу/роли и поиск по тексту).

**Why this priority**: Основная ценность — управление каталогом промптов и удобный просмотр списков в кабинете.

**Independent Test**: CRUD по промптам через API; списки возвращают items + meta (page, pageSize, total); фильтры departmentId/roleId и search работают; сортировка по выбранному полю и порядку.

**Acceptance Scenarios**:

1. **Given** есть отдел и роль, **When** оператор создаёт промпт с обязательными полями (name, prompt, task, task_description, departmentId, roleId) и опциональными массивами (rules, key_references, criteria, evaluationRubric), **Then** промпт сохраняется при условии, что роль принадлежит указанному отделу; при несуществующем departmentId/roleId возвращается 409; при несоответствии role и department — 400/409.
2. **Given** есть промпты, **When** оператор запрашивает список с page, pageSize, sortBy, sortOrder, **Then** возвращаются items и meta с total.
3. **Given** запрос списка промптов с departmentId и/или roleId и/или search, **When** API обрабатывает запрос, **Then** возвращаются только подходящие промпты; search ищет по name, task, prompt, task_description.
4. **Given** запрос GET /api/prompts/:id, **When** промпт найден, **Then** в ответе присутствуют связанные department и role (минимум id, name).

---

### User Story 3 — Предсказуемые ошибки и документация API (Priority: P2)

Оператор и разработчик фронта получают единый формат ошибок и полное описание API в Swagger.

**Why this priority**: Ускоряет интеграцию кабинета и отладку; снижает неопределённость по контрактам.

**Independent Test**: Все эндпоинты описаны в Swagger; при валидации и конфликтах возвращается JSON с statusCode, message, errorCode, details (опционально).

**Acceptance Scenarios**:

1. **Given** невалидное тело запроса или неизвестные поля, **When** запрос отправлен, **Then** возвращается 400 с errorCode VALIDATION_ERROR и деталями.
2. **Given** дубликат уникального имени (отдел или пара departmentId+name для роли), **When** создание/обновление, **Then** возвращается 409 с errorCode UNIQUE_CONSTRAINT.
3. **Given** запрос к несуществующему id, **Then** возвращается 404 с errorCode NOT_FOUND.
4. **Given** открыт Swagger (/api/docs), **Then** отображены все эндпоинты и DTO с примерами для JSON-полей промпта.

---

### Edge Cases

- Запрос списка с несуществующим departmentId/roleId в фильтре — трактуем как пустой результат (фильтр по FK), не 404.
- Пустые или невалидные JSON-поля (rules, key_references, criteria, evaluationRubric) при создании/обновлении промпта — 400 VALIDATION_ERROR с деталями.
- Удаление промпта — всегда разрешено (без каскадов на другие сущности).
- Пагинация: page и pageSize валидируются (например pageSize max 100); при выходе за пределы — пустой items и корректный meta.total.
- Одновременное изменение (concurrent PATCH одной сущности): last-write-wins — последний запрос перезаписывает данные; оптимистичная блокировка и версионирование не используются.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Система MUST предоставлять REST JSON API с базовым путём /api и документацией Swagger по /api/docs.
- **FR-002**: Система MUST обеспечивать полный CRUD для Department, Role и Prompt (create, read by id, list with pagination, update, delete) с заданными правилами удаления (запрет при зависимостях для Department и Role).
- **FR-003**: Система MUST валидировать все входящие данные (Create/Update) через DTO; неизвестные поля запрещены (forbidNonWhitelisted); типы и границы (длины, обязательность) проверяются.
- **FR-004**: Система MUST возвращать ошибки в едином формате: statusCode, message, errorCode, details (опционально); маппинг: Unique constraint → 409 UNIQUE_CONSTRAINT; Record not found → 404 NOT_FOUND; Foreign key violation → 409 FK_CONSTRAINT; Валидация → 400 VALIDATION_ERROR.
- **FR-005**: Система MUST поддерживать для списков пагинацию (page, pageSize), сортировку (sortBy, sortOrder) и фильтры (для prompts: departmentId, roleId, search по name/task/prompt/task_description); ответ списков — items + meta (page, pageSize, total).
- **FR-006**: Система MUST хранить сущности Department, Role (с привязкой к Department), Prompt (с привязкой к Role и Department) и JSON-поля промпта (rules, key_references, criteria, evaluationRubric) в соответствии с зафиксированными контрактами структур. При создании/обновлении промпта система MUST проверять, что выбранная роль принадлежит указанному отделу (role.departmentId === departmentId); при несоответствии — 400 или 409 с понятным сообщением.
- **FR-007**: Система MUST предоставлять идемпотентный seed: минимум 1 department, 1 role, 1 prompt с заполненными JSON-полями; повторный запуск не создаёт дубликатов.
- **FR-008**: Инфраструктура MUST поднимать PostgreSQL через docker-compose; приложение подключается по DATABASE_URL и запускается отдельно (например npm run start).

### Key Entities

- **Department**: Отдел; атрибуты — уникальное имя, описание (опционально), иконка (опционально); идентификатор UUID.
- **Role**: Роль; привязана к одному Department; атрибуты — имя (уникальное в рамках отдела), описание, иконка; идентификатор UUID.
- **Prompt**: Промпт; привязан к одному Role и одному Department; атрибуты — имя, иконка, основной текст (prompt), задача (task), описание задачи (task_description); структурированные данные: rules (массив { key, text }), key_references (массив { title, author, year, keyinsights }), criteria (массив { key, name, description }), evaluationRubric (объект «оценка → текст»).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Оператор может поднять БД одной командой (docker-compose) и запустить API одной командой; миграции схемы выполняются без ошибок.
- **SC-002**: Все CRUD-операции для Department, Role и Prompt выполняются через API и дают ожидаемые коды ответа (200/201 для успеха, 400/404/409 при ошибках).
- **SC-003**: Списки поддерживают пагинацию и возвращают не более запрошенного pageSize элементов; общее количество доступно в meta.total.
- **SC-004**: При попытке удалить отдел или роль, у которых есть связанные сущности, система возвращает 409 и не удаляет запись.
- **SC-005**: Swagger отображает все эндпоинты и структуры запросов/ответов; примеры для JSON-полей промпта присутствуют.
- **SC-006**: Запуск seed создаёт минимум один отдел, одну роль и один промпт; повторный запуск не ломает данные и не создаёт дубликатов по уникальным полям.

---

## API and data contract (implementation reference)

Следующие контракты зафиксированы для реализации и согласования с конституцией.

### Base and format

- Base path: `/api`. Swagger: `/api/docs`.
- Валидация: Global ValidationPipe — whitelist: true, forbidNonWhitelisted: true, transform: true.
- Единый формат ошибки: `{ statusCode, message, errorCode, details? }`.

### Endpoints summary

| Resource    | GET list | GET by id | POST | PATCH | DELETE |
|------------|----------|-----------|------|-------|--------|
| Departments | /api/departments | /api/departments/:id | /api/departments | /api/departments/:id | /api/departments/:id (409 если есть roles/prompts) |
| Roles       | /api/roles | /api/roles/:id | /api/roles | /api/roles/:id | /api/roles/:id (409 если есть prompts) |
| Prompts     | /api/prompts | /api/prompts/:id | /api/prompts | /api/prompts/:id | /api/prompts/:id |

### List query parameters (common pattern)

- `page` (default 1), `pageSize` (default 20, max 100).
- `search` — поиск по текстовым полям как **подстрока без учёта регистра** (ILIKE); одно значение search применяется ко всем указанным полям. Пустая строка search игнорируется (фильтр по поиску не применяется). Departments: name, description; roles: name, description; prompts: name, task, prompt, task_description.
- `sortBy`: name | createdAt | updatedAt (default **updatedAt**).
- `sortOrder`: asc | desc (default **desc**). Для всех списков (departments, roles, prompts) значения по умолчанию: sortBy=updatedAt, sortOrder=desc.

Специфичные фильтры:

- Roles: `departmentId` (UUID, опционально).
- Prompts: `departmentId`, `roleId` (UUID, опционально).

### Response shape for lists

- `items`: массив сущностей.
- `meta`: `{ page, pageSize, total }`.

### Data model (Prisma-oriented)

- **Department**: id (UUID), name (unique), description?, icon?, createdAt, updatedAt.
- **Role**: id (UUID), departmentId (FK), name, description?, icon?, createdAt, updatedAt; unique (departmentId, name).
- **Prompt**: id (UUID), name, icon?, prompt (text), task, task_description (text), departmentId (FK), roleId (FK); JSONB: rules, key_references, criteria, evaluationRubric; createdAt, updatedAt.

Индексы: Department.name (unique); Role.departmentId; unique(Role.departmentId, Role.name); Prompt.departmentId, Prompt.roleId, Prompt.name (или по необходимости для сортировки).

### JSON field contracts (validation rules)

- **rules**: массив объектов `{ key: string, text: string }`.
- **key_references**: массив объектов `{ title: string, author: string, year: string, keyinsights: string[] }`.
- **criteria**: массив объектов `{ key: string, name: string, description: string }`.
- **evaluationRubric**: объект, ключи — строки (оценки), значения — строки.

Валидация JSON-полей на уровне DTO или custom validators; при несоответствии — 400 VALIDATION_ERROR.

### Create/Update bodies (key constraints)

- **Department**: name required (2–100), description (0–2000), icon (0–200).
- **Role**: departmentId (UUID required), name (2–100), description?, icon?.
- **Prompt**: name (2–120), prompt (min 10), task (2–200), task_description (min 10), departmentId, roleId; optional: icon, rules, key_references, criteria, evaluationRubric (по контрактам выше). При создании и обновлении проверять: роль должна принадлежать указанному отделу (role.departmentId === departmentId); иначе 400/409 с сообщением о несоответствии.

PATCH: все поля опциональны; передача null для опциональных полей допускается где применимо.

### Definition of Done (acceptance)

1. docker-compose поднимает Postgres; Prisma migrate выполняется без ошибок.
2. Swagger доступен и показывает все эндпоинты.
3. CRUD для Department, Role, Prompt работает; 404 на несуществующий id; 409 на уникальные конфликты и при удалении с зависимостями; 400 на невалидные DTO и JSON-поля.
4. Списки поддерживают пагинацию и сортировку; GET prompts фильтрует по departmentId, roleId и search.
5. Единый формат ошибок; Prisma-ошибки маппятся в читаемый вид (exception filter).
6. Seed создаёт минимум 1 department, 1 role, 1 prompt; идемпотентен.

---

## Assumptions

- Локальный личный кабинет — единственный потребитель API; авторизация и тесты не входят в scope.
- Уникальность имён: Department — глобально; Role — в рамках одного department (пара departmentId + name).
- Версионирование API (v1/v2) не требуется на старте.
- Логи не должны содержать полные тела запросов (в частности длинные тексты промптов); достаточно id и метаданных.
