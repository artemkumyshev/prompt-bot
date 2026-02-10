# prompt-bot.lc: Docker и локальная разработка

COMPOSE_FILE := docker.compose.yaml
DEV_COMPOSE_FILE := docker.compose.dev.yaml

.PHONY: help build up start stop restart logs logs-api clean ps \
	dev-build dev-up dev-stop dev-logs dev-clean dev-ps \
	local-up local-down local \
	db-migrate db-migrate-deploy db-seed db-studio db-reset generate \
	install dev start-app lint format type-check clean validate-env

help:
	@echo "Команды для prompt-bot.lc:"
	@echo ""
	@echo "Production (Docker):"
	@echo "  make build        Собрать образ API"
	@echo "  make up           Запустить prod (db + api, attached)"
	@echo "  make start        Запустить prod (detached)"
	@echo "  make stop         Остановить prod"
	@echo "  make logs         Логи prod"
	@echo "  make logs-api     Логи только API"
	@echo "  make clean        Остановить и удалить volumes"
	@echo "  make ps           Список prod-контейнеров"
	@echo ""
	@echo "Development (полный Docker: db + app с live reload):"
	@echo "  make dev-build    Собрать dev-образ"
	@echo "  make dev-up       Запустить dev-окружение"
	@echo "  make dev-stop     Остановить dev"
	@echo "  make dev-logs     Логи dev"
	@echo "  make dev-clean    Остановить dev и удалить volumes"
	@echo "  make dev-ps       Список dev-контейнеров"
	@echo ""
	@echo "Локально (только БД в Docker, приложение на хосте):"
	@echo "  make local-up     Поднять только PostgreSQL"
	@echo "  make local-down   Остановить PostgreSQL"
	@echo "  make local        Поднять БД + npm install + migrate + npm run start:dev"
	@echo ""
	@echo "БД (нужен .env с DATABASE_URL):"
	@echo "  make db-migrate   prisma migrate dev"
	@echo "  make db-migrate-deploy  prisma migrate deploy"
	@echo "  make db-seed      prisma db seed"
	@echo "  make db-studio   Prisma Studio"
	@echo "  make db-reset    Сброс БД"
	@echo ""
	@echo "Приложение (без Docker):"
	@echo "  make install      npm install"
	@echo "  make dev         npm run start:dev"
	@echo "  make start-app   npm run start:prod (локально)"
	@echo "  make lint, format, type-check, generate"
	@echo ""

# ==========================================
# Production
# ==========================================

build:
	docker compose -f $(COMPOSE_FILE) build api

up:
	docker compose -f $(COMPOSE_FILE) --profile prod up --remove-orphans

start:
	docker compose -f $(COMPOSE_FILE) --profile prod up -d

stop:
	docker compose -f $(COMPOSE_FILE) --profile prod down

restart: stop start

logs:
	docker compose -f $(COMPOSE_FILE) --profile prod logs -f

logs-api:
	docker compose -f $(COMPOSE_FILE) --profile prod logs -f api

clean:
	docker compose -f $(COMPOSE_FILE) --profile prod down --volumes --remove-orphans

ps:
	docker compose -f $(COMPOSE_FILE) --profile prod ps -a

# ==========================================
# Development (full Docker)
# ==========================================

dev-build:
	docker compose -f $(DEV_COMPOSE_FILE) build

dev-up:
	docker compose -f $(DEV_COMPOSE_FILE) up -d

dev-stop:
	docker compose -f $(DEV_COMPOSE_FILE) down

dev-logs:
	docker compose -f $(DEV_COMPOSE_FILE) logs -f

dev-clean:
	docker compose -f $(DEV_COMPOSE_FILE) down --volumes --remove-orphans

dev-ps:
	docker compose -f $(DEV_COMPOSE_FILE) ps -a

# ==========================================
# Local (только БД в Docker)
# ==========================================

local-up:
	docker compose -f $(COMPOSE_FILE) --profile dev up -d

local-down:
	docker compose -f $(COMPOSE_FILE) --profile dev down

local: local-up
	@echo "Ожидание БД..."
	@sleep 3
	npm install
	npx prisma migrate deploy
	@echo "Запуск приложения..."
	npm run start:dev

# ==========================================
# База данных (локально)
# ==========================================

validate-env:
	@test -f .env || (echo "Ошибка: нет .env. Скопируйте: cp .env.example .env" && exit 1)
	@grep -E '^DATABASE_URL=.+' .env >/dev/null 2>&1 || (echo "Ошибка: в .env не задан DATABASE_URL" && exit 1)
	@echo "✓ .env проверен"

db-migrate: validate-env
	npx prisma migrate dev

db-migrate-deploy: validate-env
	npx prisma migrate deploy

db-seed: validate-env
	npx prisma db seed

db-studio: validate-env
	npx prisma studio

db-reset: validate-env
	npx prisma migrate reset

generate:
	npx prisma generate

# ==========================================
# Приложение (без Docker)
# ==========================================

install:
	npm install

dev:
	npm run start:dev

start-app:
	npm run start:prod

lint:
	npm run lint

format:
	npm run format

type-check:
	npx tsc --noEmit

clean-app:
	rm -rf dist node_modules/.cache
