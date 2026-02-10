# Data Model: Backend API — каталог промптов

**Feature**: 001-prompts-catalog-api  
**Phase**: 1 (Design & Contracts)

## Entities

### Department

| Field       | Type    | Constraints              | Notes                    |
|------------|---------|---------------------------|--------------------------|
| id         | UUID    | PK, default cuid/uuid     | Генерируется Prisma      |
| name       | string  | unique, 2–100             | Обязательный             |
| description| string? | 0–2000                    | Опционально              |
| icon       | string? | 0–200                     | Опционально              |
| createdAt  | DateTime| default now()             |                          |
| updatedAt  | DateTime| updatedAt                 |                          |

**Relations**: Department has many Role; Department has many Prompt.

**Uniqueness**: `name` — глобально уникален.

**Lifecycle**: Удаление запрещено (409 HAS_DEPENDENCIES), если есть хотя бы одна связанная Role или Prompt.

---

### Role

| Field        | Type    | Constraints                    | Notes                |
|-------------|---------|---------------------------------|----------------------|
| id          | UUID    | PK, default cuid/uuid           |                      |
| departmentId| UUID    | FK → Department                 | Обязательный         |
| name        | string  | 2–100                           | Обязательный         |
| description | string? |                                 | Опционально          |
| icon        | string? |                                 | Опционально          |
| createdAt   | DateTime| default now()                   |                      |
| updatedAt   | DateTime| updatedAt                       |                      |

**Relations**: Role belongs to Department; Role has many Prompt.

**Uniqueness**: `(departmentId, name)` — уникальная пара (роль уникальна в рамках отдела).

**Lifecycle**: Удаление запрещено (409 HAS_DEPENDENCIES), если есть хотя бы один связанный Prompt.

---

### Prompt

| Field          | Type   | Constraints       | Notes                          |
|----------------|--------|-------------------|--------------------------------|
| id             | UUID   | PK, default       |                                |
| name           | string | 2–120             | Обязательный                   |
| icon           | string?|                   | Опционально                    |
| prompt         | string | min 10            | Основной текст (text)           |
| task           | string | 2–200             | Обязательный                   |
| task_description | string| min 10          | Обязательный                   |
| departmentId   | UUID   | FK → Department   | Обязательный                   |
| roleId         | UUID   | FK → Role         | Обязательный                   |
| rules          | Json   | массив по контракту | JSONB; default []           |
| key_references | Json   | массив по контракту | JSONB; default []           |
| criteria       | Json   | массив по контракту | JSONB; default []           |
| evaluationRubric | Json | объект по контракту  | JSONB; default {}           |
| createdAt      | DateTime| default now()    |                                |
| updatedAt      | DateTime| updatedAt        |                                |

**Relations**: Prompt belongs to Department; Prompt belongs to Role.

**Invariant**: При создании/обновлении должно выполняться `role.departmentId === departmentId`; иначе 400/409.

**Lifecycle**: Удаление разрешено без каскадов (нет зависимых сущностей).

---

## JSON field contracts (validation)

### rules

Массив объектов. Каждый элемент:

- `key`: string
- `text`: string

### key_references

Массив объектов. Каждый элемент:

- `title`: string
- `author`: string
- `year`: string
- `keyinsights`: string[] (массив строк)

### criteria

Массив объектов. Каждый элемент:

- `key`: string
- `name`: string
- `description`: string

### evaluationRubric

Объект (не массив). Ключи — строки (оценки, например "1", "2", "7.5", "10"); значения — строки.

---

## Indexes (Prisma)

- `Department`: `@@unique([name])`
- `Role`: `@@index([departmentId])`, `@@unique([departmentId, name])`
- `Prompt`: `@@index([departmentId])`, `@@index([roleId])`, при необходимости `@@index([name])` или по полям сортировки (createdAt, updatedAt)

---

## State transitions

- **Department / Role**: нет состояний; создание → обновление (last-write-wins) → удаление (если нет зависимостей).
- **Prompt**: аналогично; при PATCH проверка role∈department при изменении departmentId или roleId.
