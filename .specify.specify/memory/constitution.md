<!--
Sync Impact Report
- Version: (none) → 1.0.0
- Initial constitution for Backend API каталога промптов (Department / Role / Prompt).
- Modified principles: N/A (initial)
- Added sections: Mission, Context, Non-Goals, Architecture Principles, Data Model,
  API Contracts, Validation, Security, Reliability, Code Style, Migrations, Data Portability,
  Testing, Spec-Kit, Definition of Done, Default Decisions, Governance.
- Removed sections: none
- Templates: ✅ constitution-template.md, plan-template.md, spec-template.md, tasks-template.md
  created and aligned with constitution. commands/* — ⚠ pending (optional).
- Follow-up TODOs: Add command-specific templates under commands/ if using Spec-Kit commands.
-->

# Constitution: Prompt Bot Backend API

**Project:** prompt-bot.lc — Backend API для каталога промптов (Department / Role / Prompt)  
**Constitution Version:** 1.0.0  
**Ratification Date:** 2025-02-10  
**Last Amended:** 2025-02-10

---

## 0. Mission

Сделать надёжный и удобный backend, который:

- хранит и отдаёт структурированные промпты и справочники (department, role),
- обеспечивает чистый и предсказуемый REST API для локального личного кабинета,
- масштабируется по данным и функциональности без переписываний.

---

## 1. Context and Key Scenarios

### Primary scenarios

1. **Admin (локальный кабинет)** создаёт/редактирует/удаляет:
   - departments,
   - roles,
   - prompts.
2. **Client (в будущем: Telegram-бот / публичный UI)** читает каталог:
   - список департаментов и ролей,
   - списки промптов с фильтрами,
   - детальную карточку промпта.
3. **Импорт/экспорт (на будущее):**
   - выгрузка промптов в JSON для бэкапа, миграций, версий.

### Implicit requirements

- Консистентность схемы данных: промпт связан с role и department.
- Удобная фильтрация и пагинация.
- Версионирование и мягкая эволюция схемы без поломок клиентов.

---

## 2. Non-Goals (Out of Scope at Start)

- Генерация ответов LLM (никаких вызовов OpenAI и т.п.).
- Сложная RBAC и множество ролей пользователей — только базовый доступ для кабинета.
- Мультиязычность как отдельная сущность (локализованные поля допустимы позже).
- Сложный workflow approval/review для промптов.

---

## 3. Architecture Principles

### 3.1 API-first

- Сначала определяем контракты (DTO, схемы, примеры), затем реализация.
- Все изменения API MUST быть обратно-совместимыми или вводиться через версию (например `/api/v2`).

### 3.2 Layered architecture

- **Controller/Transport:** приём запроса, валидация DTO, формирование response.
- **Service/UseCases:** бизнес-логика (фильтры, связи, правила обновления).
- **Repository/DB:** доступ к данным.
- **Domain/Model:** сущности и инварианты.

### 3.3 Identifiers and relations

- ID — UUID (предпочтительно) или автоинкремент; единообразие по всем сущностям.
- Prompt MUST иметь `roleId` и `departmentId` (обязательные связи).
- При удалении role/department:
  - по умолчанию: удаление запрещено, если есть связанные prompts (ответ 409 Conflict),
  - альтернатива (на будущее): soft-delete или каскад.

---

## 4. Data Model (Primary)

### 4.1 Department

- `id`: string (UUID)
- `name`: string (уникальный в пределах системы, case-insensitive)
- `description`: string (optional)
- `icon`: string (optional; имя иконки / emoji / URL)

### 4.2 Role

- `id`: string (UUID)
- `name`: string (уникальный, case-insensitive)
- `description`: string (optional)
- `icon`: string (optional)

### 4.3 Prompt

- `id`: string (UUID)
- `name`: string
- `icon`: string (optional)
- `prompt`: string (основной текст промпта)
- `departmentId`: string (FK)
- `roleId`: string (FK)
- `task`: string
- `task_description`: string
- `rules`: Rule[] (массив)
- `key_references`: KeyReference[] (массив)
- `criteria`: Criteria[] (массив)
- `evaluationRubric`: EvaluationRubric (object или массив)

#### Nested structures (recommended shapes)

- **Rule:** `{ id, text, order }` или `{ key, text }`
- **KeyReference:** `{ title, author, year, keyInsights: string[] }`
- **Criteria:** `{ id, name, description }`
- **EvaluationRubric:** либо `Record<string, string>` (ключи "1".."10"), либо массив `{ score: number | string, description: string }`

Вложенные структуры MUST быть валидируемыми и сохраняемыми в БД. Допускается хранение в JSONB (PostgreSQL).

---

## 5. API Contracts (Conventions)

### 5.1 Versioning

- Базовый префикс: `/api/v1`.

### 5.2 Response format

- Success: `200` с данными, `201` при создании, `204` при удалении без тела.
- Error (единый формат):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable message",
    "details": [{ "path": "field", "issue": "..." }]
  }
}
```

### 5.3 Pagination and filters (списки)

- `GET /prompts?departmentId=&roleId=&q=&limit=&offset=&sort=`
- `q` — поиск по name и (опционально) по task/prompt (FTS — решение позже).
- Сортировка по умолчанию: зафиксировать одно из `updatedAt DESC` или `name ASC`.

### 5.4 Endpoints (минимальный набор)

**Departments**

- GET /departments
- POST /departments
- GET /departments/:id
- PATCH /departments/:id
- DELETE /departments/:id

**Roles**

- GET /roles
- POST /roles
- GET /roles/:id
- PATCH /roles/:id
- DELETE /roles/:id

**Prompts**

- GET /prompts
- POST /prompts
- GET /prompts/:id
- PATCH /prompts/:id
- DELETE /prompts/:id

**Admin / ops**

- GET /meta (версия API, билд, время)
- GET /health (liveness)
- GET /ready (readiness, при наличии БД)

---

## 6. Validation and Invariants

- Все входные DTO MUST валидироваться до входа в сервис-слой.
- Инварианты:
  - `department.name` и `role.name` уникальны (case-insensitive).
  - `prompt.departmentId` и `prompt.roleId` MUST существовать.
  - `prompt.prompt`, `prompt.name`, `prompt.task` не пустые.
  - `rules` имеют стабильный порядок (explicit order или порядок массива сохраняется как есть).
- Любое нарушение — понятная ошибка с полем `details`.

---

## 7. Security

### 7.1 Admin authentication

- На старте достаточно: API Key в заголовке `X-Admin-Key`, значение из env.
- Альтернатива: Basic Auth (API key предпочтительнее для простоты).
- Публичные read-endpoints могут быть без auth по решению; admin CRUD — только с auth.

### 7.2 CORS

- Разрешаем только `http://localhost:*` и при необходимости конкретные origin.
- В проде запрещаем `*`.

### 7.3 Rate limiting

- Минимальный лимит на публичные endpoints при их появлении.
- Для админки — мягче.

---

## 8. Reliability and Observability

- Структурированные логи (JSON) с: requestId, method, path, status, время ответа.
- Ошибки: stacktrace не возвращаем клиенту; stacktrace пишем в лог.
- Метрики (опционально на старте): хотя бы базовый timing.

---

## 9. Code Style and DX

- TypeScript strict.
- `any` не использовать в доменной и сервисной логике.
- Обязательны: единый форматтер (Prettier), ESLint для стабильности.
- Именование: переменные/поля — camelCase; таблицы/колонки — по стандарту ORM (фиксируется один раз).
- DTO и сущности не смешивать: DTO = контракт API; Entity/Model = домен/БД.

---

## 10. Migrations and Data Compatibility

- Любое изменение схемы — через миграции.
- JSON-поля (rules, key_references, criteria, evaluationRubric) эволюционируют осторожно: добавляем поля, не ломаем существующие; при смене структуры — миграция данных или версионирование поля.

---

## 11. Data and Portability

- Экспорт/импорт (future-ready):
  - GET /export/prompts.json (админ) — для бэкапа.
  - Импорт — CLI-скриптом (без API), чтобы не усложнять безопасность.

---

## 12. Testing (Pragmatic)

- На старте допускается минимум:
  - контрактные проверки DTO (валидация),
  - smoke-tests на основные CRUD (5–10 сценариев).
- Если принципиально без тестов — обязателен ручной чеклист регрессии на каждый релиз.

---

## 13. Spec-Kit Specific

- Spec-driven подход:
  1. описание API и моделей (Specify),
  2. фиксация критериев приёмки (Acceptance),
  3. затем реализация.
- Любое изменение начинается с обновления спеки, затем код.

---

## 14. Definition of Done

Фича считается готовой, если:

- есть чёткий контракт (DTO + примеры),
- реализованы endpoint’ы и валидация,
- ошибки стандартизированы,
- CRUD работает для всех трёх сущностей (Department, Role, Prompt),
- добавлены минимальные health/meta,
- обновлена документация API (Swagger/OpenAPI или markdown).

---

## 15. Default Decisions

- Вложенные структуры prompt хранятся в JSONB.
- Уникальность `name` для department и role.
- Удаление role/department при наличии связанных prompts — запрещено (409 Conflict).
- Админ-доступ через заголовок `X-Admin-Key`.

---

## 16. Governance

- **Amendments:** изменения конституции вносятся через явное обновление этого файла с инкрементом версии и обновлением Last Amended.
- **Versioning:** семантическое версионирование (MAJOR — несовместимые изменения принципов/контрактов, MINOR — новые принципы/секции, PATCH — уточнения, опечатки).
- **Compliance:** при реализации фич и рефакторинге решения MUST соответствовать принципам и контрактам, описанным выше; расхождения фиксируются и либо вносятся в конституцию, либо явно документируются как исключения с обоснованием.
