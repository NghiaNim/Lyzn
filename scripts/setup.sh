#!/bin/bash
set -e

echo "🚀 Setting up Lyzn development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Install with: npm install -g pnpm" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker is not installed. Docker Compose services will not be available." >&2; }
command -v anchor >/dev/null 2>&1 || { echo "⚠️  Anchor CLI is not installed. Solana program builds will not work." >&2; }
command -v go >/dev/null 2>&1 || { echo "⚠️  Go is not installed. Chain-adapter service will not work." >&2; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Install Go dependencies
if command -v go >/dev/null 2>&1; then
    echo "📦 Installing Go dependencies..."
    cd apps/chain-adapter
    go mod download
    go mod tidy
    cd ../..
fi

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and fill in your configuration:"
    echo "   - DATABASE_URL (Supabase connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - HMAC_SECRET (generate with: openssl rand -base64 32)"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
if [ -f apps/web/prisma/schema.prisma ]; then
    echo "🔧 Generating Prisma client..."
    cd apps/web
    pnpm db:generate
    cd ../..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and configure your environment variables"
echo "2. Start Docker services: make docker-up"
echo "3. Run database migrations: make db-migrate"
echo "4. Build Solana program: make program-build"
echo "5. Start development: make dev"
echo ""

