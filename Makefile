.PHONY: help install build start dev docker-up docker-down docker-logs docker-build \
	db-migrate db-migrate-deploy db-seed db-studio db-reset generate \
	lint format type-check test clean validate-env

help: ## Показать справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ============================================================================
# Docker
# ============================================================================

docker-up: ## Запустить Docker (PostgreSQL + приложение)
	docker compose up -d --build

docker-down: ## Остановить Docker-сервисы
	docker compose down

docker-logs: ## Показать логи Docker-сервисов
	docker compose logs -f

docker-build: ## Собрать образ приложения
	docker compose build app

# ============================================================================
# База данных (локально, требует .env с DATABASE_URL)
# ============================================================================

validate-env:
	@test -f .env || (echo "❌ Ошибка: файл .env не найден. Скопируйте: cp .env.example .env" && exit 1)
	@grep -E '^DATABASE_URL=.+' .env >/dev/null 2>&1 || (echo "❌ Ошибка: в .env не задан DATABASE_URL" && exit 1)
	@echo "✓ .env проверен"

db-migrate: validate-env ## Миграции Prisma (режим разработки)
	npx prisma migrate dev

db-migrate-deploy: validate-env ## Применить миграции (production)
	npx prisma migrate deploy

db-seed: validate-env ## Заполнить БД тестовыми данными
	npx prisma db seed

db-studio: validate-env ## Открыть Prisma Studio
	npx prisma studio

db-reset: validate-env ## Сбросить БД и применить миграции заново
	npx prisma migrate reset

generate: ## Сгенерировать Prisma Client
	npx prisma generate

# ============================================================================
# Приложение
# ============================================================================

install: ## Установить зависимости
	npm install

build: ## Собрать проект
	npm run build

dev: ## Запустить в режиме разработки (hot-reload)
	npm run start:dev

start: ## Запустить собранное приложение
	npm run start:prod

# ============================================================================
# Код
# ============================================================================

lint: ## Проверить код линтером
	npm run lint

format: ## Отформатировать код
	npm run format

type-check: ## Проверить типы TypeScript
	npx tsc --noEmit

clean: ## Удалить dist и кэш
	rm -rf dist
	rm -rf node_modules/.cache
