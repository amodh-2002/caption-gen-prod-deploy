.PHONY: help build up down logs clean restart dev prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

dev: ## Start all services in development mode with hot reload
	@echo "Cleaning up any orphaned networks..."
	@docker network prune -f > /dev/null 2>&1 || true
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

down: ## Stop all services
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans || docker-compose down --remove-orphans

logs: ## Show logs from all services
	docker-compose logs -f

logs-auth: ## Show logs from auth service
	docker-compose logs -f auth

logs-backend: ## Show logs from backend service
	docker-compose logs -f backend

logs-frontend: ## Show logs from frontend service
	docker-compose logs -f frontend

logs-db: ## Show logs from database
	docker-compose logs -f postgres

restart: down up ## Restart all services

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

clean-network: ## Clean up orphaned Docker networks
	docker-compose down --remove-orphans
	docker network prune -f

clean-all: clean clean-network ## Complete cleanup including networks

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d caption_gen

db-reset: ## Reset database (WARNING: destroys all data)
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for database to initialize..."
	@sleep 5
	@echo "Database reset complete"

status: ## Show status of all services
	docker-compose ps

test-auth: ## Test auth service health
	curl -f http://localhost:4000/health || echo "Auth service not responding"

test-backend: ## Test backend service health
	curl -f http://localhost:5000/health || echo "Backend service not responding"

test-all: test-auth test-backend ## Test all services

install-deps: ## Install local development dependencies
	cd frontend && npm install
	cd backend && pip install -r requirements.txt
	cd services/auth && pip install -r requirements.txt

setup: ## Initial setup for local development
	@echo "Setting up local development environment..."
	@cp services/auth/env.example services/auth/.env 2>/dev/null || echo "Auth .env already exists"
	@echo "Setup complete! Edit .env files as needed, then run 'make dev'"

prod: ## Start all services in production mode
	docker-compose up -d
	@echo "Services started in production mode"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"
	@echo "Auth: http://localhost:4000"
	@echo "Database: localhost:5432"

