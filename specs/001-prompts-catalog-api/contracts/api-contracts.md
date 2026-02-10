# API Contracts: Backend API — каталог промптов

**Feature**: 001-prompts-catalog-api  
**Base path**: `/api`  
**Swagger (runtime)**: `/api/docs`

Спецификация контрактов для реализации. Итоговая OpenAPI генерируется NestJS Swagger из кода (декораторы).

---

## Error response (all 4xx/5xx)

```json
{
  "statusCode": 400,
  "message": "Readable message",
  "errorCode": "VALIDATION_ERROR",
  "details": []
}
```

**errorCode**: `VALIDATION_ERROR` | `UNIQUE_CONSTRAINT` | `NOT_FOUND` | `FK_CONSTRAINT` | `HAS_DEPENDENCIES` | (при необходимости `ROLE_DEPARTMENT_MISMATCH`) | др.

---

## Departments

### GET /api/departments

**Query**: `page?`, `pageSize?`, `search?`, `sortBy?`, `sortOrder?`  
Default: page=1, pageSize=20, sortBy=updatedAt, sortOrder=desc. pageSize max 100.  
Search: ILIKE по name, description; пустой search игнорируется.

**Response 200**: `{ "items": Department[], "meta": { "page", "pageSize", "total" } }`

### GET /api/departments/:id

**Response 200**: Department.  
**Response 404**: errorCode NOT_FOUND.

### POST /api/departments

**Body**: `{ "name": string (2–100), "description"?: string (0–2000), "icon"?: string (0–200) }`  
**Response 201**: Department.  
**Response 409**: UNIQUE_CONSTRAINT (name).

### PATCH /api/departments/:id

**Body**: все поля опциональны; `name?`, `description?` | null, `icon?` | null.  
**Response 200**: Department.  
**Response 404**: NOT_FOUND. **Response 409**: UNIQUE_CONSTRAINT.

### DELETE /api/departments/:id

**Response 200/204**: удалён.  
**Response 404**: NOT_FOUND. **Response 409**: HAS_DEPENDENCIES (есть roles или prompts).

---

## Roles

### GET /api/roles

**Query**: `page?`, `pageSize?`, `departmentId?` (UUID), `search?`, `sortBy?`, `sortOrder?`  
Default sort: sortBy=updatedAt, sortOrder=desc. Search: ILIKE по name, description.

**Response 200**: `{ "items": Role[], "meta": { "page", "pageSize", "total" } }`

### GET /api/roles/:id

**Response 200**: Role. **Response 404**: NOT_FOUND.

### POST /api/roles

**Body**: `{ "departmentId": UUID, "name": string (2–100), "description"?: string, "icon"?: string }`  
**Response 201**: Role.  
**Response 409**: UNIQUE_CONSTRAINT (departmentId+name) или FK_CONSTRAINT (departmentId не найден).

### PATCH /api/roles/:id

**Body**: опционально departmentId?, name?, description?, icon?.  
**Response 200**: Role. **Response 404**: NOT_FOUND. **Response 409**: UNIQUE_CONSTRAINT / FK_CONSTRAINT.

### DELETE /api/roles/:id

**Response 200/204**: удалён. **Response 404**: NOT_FOUND. **Response 409**: HAS_DEPENDENCIES (есть prompts).

---

## Prompts

### GET /api/prompts

**Query**: `page?`, `pageSize?`, `departmentId?`, `roleId?`, `search?`, `sortBy?`, `sortOrder?`  
Default sort: sortBy=updatedAt, sortOrder=desc. Search: ILIKE по name, task, prompt, task_description; пустой search игнорируется.

**Response 200**: `{ "items": Prompt[], "meta": { "page", "pageSize", "total" } }`

### GET /api/prompts/:id

**Response 200**: Prompt с вложенными `department: { id, name }`, `role: { id, name }`.  
**Response 404**: NOT_FOUND.

### POST /api/prompts

**Body**:  
- Обязательные: `name` (2–120), `prompt` (min 10), `task` (2–200), `task_description` (min 10), `departmentId`, `roleId`.  
- Опциональные: `icon`, `rules`, `key_references`, `criteria`, `evaluationRubric` (по контрактам из data-model.md).  
- Проверка: role.departmentId === departmentId; иначе 400/409.

**Response 201**: Prompt. **Response 400**: VALIDATION_ERROR (DTO или JSON-поля). **Response 409**: FK_CONSTRAINT или несоответствие role/department.

### PATCH /api/prompts/:id

**Body**: все поля опциональны; при смене departmentId/roleId — проверка role∈department.  
**Response 200**: Prompt. **Response 404**: NOT_FOUND. **Response 400/409**: как выше.

### DELETE /api/prompts/:id

**Response 200/204**: удалён. **Response 404**: NOT_FOUND.

---

## List query validation

- `page`: число ≥ 1 (default 1).  
- `pageSize`: число 1–100 (default 20).  
- `sortBy`: name | createdAt | updatedAt.  
- `sortOrder`: asc | desc.  
- Фильтры `departmentId`, `roleId`: валидный UUID или отсутствует; несуществующий UUID в фильтре → пустой результат (не 404).
