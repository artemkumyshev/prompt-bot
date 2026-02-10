# Research: Backend API — каталог промптов

**Feature**: 001-prompts-catalog-api  
**Phase**: 0 (Outline & Research)

## Summary

Спека и конституция уже фиксируют стек и контракты. Открытых NEEDS CLARIFICATION не было. Ниже зафиксированы принятые решения и практики для реализации.

---

## 1. ORM и работа с БД

**Decision**: Prisma как единственный слой доступа к PostgreSQL.

**Rationale**: Конституция (§1) и спека явно задают Prisma; типизация, миграции и seed через Prisma CLI упрощают разработку и соответствуют DoD.

**Alternatives considered**: TypeORM — отклонён конституцией в пользу Prisma.

---

## 2. Валидация входящих данных

**Decision**: Global ValidationPipe NestJS с `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`; DTO для всех Create/Update и для query-параметров списков; class-validator + class-transformer.

**Rationale**: Соответствует конституции (§2.2) и спеке (FR-003); запрет лишних полей и приведение типов снижают риск некорректных данных.

**Alternatives considered**: Ручная валидация в сервисах — отклонена как менее единообразная и более подверженная ошибкам.

---

## 3. JSON-поля промпта (rules, key_references, criteria, evaluationRubric)

**Decision**: Хранение в PostgreSQL JSONB через Prisma `Json`; валидация структуры на уровне DTO (custom validators или проверка формы в сервисе) с возвратом 400 VALIDATION_ERROR при несоответствии контракту.

**Rationale**: Конституция (§3.3) и спека задают JSONB для скорости и простоты MVP; контракты структур зафиксированы в спеке — валидация обязательна.

**Alternatives considered**: Отдельные нормализованные таблицы — отложены; при появлении поиска по вложенным данным можно мигрировать.

---

## 4. Маппинг ошибок Prisma

**Decision**: Глобальный Exception Filter (например `PrismaClientExceptionFilter` или кастомный), преобразующий Prisma-ошибки в единый формат: `statusCode`, `message`, `errorCode` (UNIQUE_CONSTRAINT, NOT_FOUND, FK_CONSTRAINT и т.д.), `details` при необходимости.

**Rationale**: Конституция (§8) и спека (FR-004) требуют единый формат и человекочитаемые сообщения.

**Alternatives considered**: Обработка в каждом сервисе — отклонена из-за дублирования и риска расхождений.

---

## 5. Поиск (search) и пагинация

**Decision**: Один параметр `search` — подстрока без учёта регистра (ILIKE) по перечисленным полям; пустая строка search игнорируется. Пагинация: `page`, `pageSize` (default 20, max 100); ответ списков: `items` + `meta: { page, pageSize, total }`. Сортировка по умолчанию: `sortBy=updatedAt`, `sortOrder=desc`.

**Rationale**: Согласовано в speckit.clarify и зафиксировано в спеке; конституция (§6) задаёт page/pageSize и meta.

---

## 6. Проверка role ∈ department при создании/обновлении промпта

**Decision**: При POST/PATCH промпта проверять, что выбранная роль принадлежит указанному отделу (`role.departmentId === departmentId`); при несоответствии — 400 или 409 с понятным сообщением (например errorCode ROLE_DEPARTMENT_MISMATCH или в details).

**Rationale**: Согласовано в speckit.clarify; сохраняет целостность данных и предсказуемость для кабинета.

---

## 7. Swagger (OpenAPI)

**Decision**: NestJS Swagger/OpenAPI по пути /api/docs; все эндпоинты и DTO описаны декораторами; для JSON-полей промпта указаны примеры структур (rules, key_references, criteria, evaluationRubric).

**Rationale**: Конституция (§7) и спека (SC-005, DoD) требуют обязательную документацию API с примерами.

**Alternatives considered**: Ручная поддержка openapi.yaml — отклонена из-за риска расхождения с кодом; код как источник истины через декораторы предпочтителен.
