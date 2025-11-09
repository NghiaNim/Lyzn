.PHONY: help dev web adapter program-build program-test db-migrate db-studio clean install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Run initial setup script
	@./scripts/setup.sh

check-env: ## Check if required environment variables are set
	@./scripts/check-env.sh

install: ## Install all dependencies
	pnpm install
	cd server/chain-adapter && go mod download && go mod tidy
	@echo "Note: Anchor program build requires Anchor CLI. Run 'anchor build' in programs/risk-exchange after installing Anchor."

dev: ## Start all services in development mode
	@echo "Starting Docker services..."
	docker-compose up -d postgres redis solana-validator
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Starting Next.js app..."
	pnpm --filter web dev

web: ## Start only the web app
	pnpm --filter web dev

adapter: ## Start only the chain-adapter service
	cd server/chain-adapter && go run ./main.go

program-build: ## Build the Solana program
	cd programs/risk-exchange && anchor build

program-test: ## Test the Solana program
	cd programs/risk-exchange && anchor test

db-migrate: ## Run database migrations
	cd server/web && pnpm db:migrate

db-studio: ## Open Prisma Studio
	cd server/web && pnpm db:studio

clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf server/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf server/*/.next
	rm -rf server/*/dist
	rm -rf packages/*/dist
	cd server/chain-adapter && rm -rf bin/
	cd programs/risk-exchange && anchor clean

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

test-pyth-ts: ## Test Pyth integration (TypeScript)
	@echo "Testing Pyth integration with TypeScript..."
	cd server/web && npx tsx scripts/test-pyth.ts

test-pyth-go: ## Test Pyth integration (Go)
	@echo "Testing Pyth integration with Go..."
	cd server/chain-adapter && go run ../../scripts/test-pyth.go

test-pyth: test-pyth-ts ## Test Pyth integration (all)
	@echo "Running all Pyth tests..."
	@$(MAKE) test-pyth-go

