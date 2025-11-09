# Lyzn - Non-Custodial Risk Exchange Platform

A production-ready monorepo for a non-custodial risk exchange platform built on Solana. Users create orders, negotiate terms off-chain, and settle contracts on-chain using Pyth oracle prices.

## Architecture

The monorepo consists of three main applications:

1. **server/web** - Next.js (App Router) application with:
   - Prisma + Supabase PostgreSQL for order/contract management
   - NextAuth for authentication
   - REST API for orders, counters, contracts, and matching
   - Non-custodial first design (client signs transactions)

2. **server/chain-adapter** - Go service that:
   - Builds and submits Solana transactions
   - Runs schedulers for contract expiry and settlement
   - Handles retries and idempotent operations
   - HMAC authentication for server-to-server communication

3. **programs/risk-exchange** - Solana Anchor program (Rust) that:
   - Manages escrowed USDC for contracts
   - Integrates with Pyth oracle for price feeds
   - Handles contract lifecycle: initialize → fund → activate → settle

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Go** >= 1.22
- **Rust** and **Anchor** (for Solana programs)
- **Docker** and **Docker Compose** (for local services)
- **Solana CLI** tools
- **Supabase account** (for PostgreSQL database)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Lyzn

# Install root dependencies
pnpm install

# Install Go dependencies
cd server/chain-adapter
go mod download
cd ../..
```

### 2. Setup Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection string (format: `postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres`)
4. Add it to your `.env` file (see step 3)

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and fill in your values:
# - DATABASE_URL (from Supabase)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - HMAC_SECRET (generate with: openssl rand -base64 32)
# - Other values as needed
```

### 4. Start Docker Services

```bash
# Start Postgres, Redis, and Solana test validator
docker-compose up -d

# Verify services are running
docker-compose ps
```

The Solana test validator will be available at `http://localhost:8899`

### 5. Setup Database

```bash
# Generate Prisma client
cd server/web
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 6. Build Solana Program

```bash
# Build the Anchor program
cd programs/risk-exchange
anchor build

# The program ID will be printed - update it in:
# - programs/risk-exchange/declare_id!() in src/lib.rs
# - .env PROGRAM_ID
# - server/chain-adapter/.env PROGRAM_ID
```

### 7. Fund Dev Wallets

#### Local Validator (Recommended for Development)

```bash
# Start local validator (already running via docker-compose)
# Get airdrop for your wallet
solana airdrop 10 $(solana address) --url http://localhost:8899

# Check balance
solana balance --url http://localhost:8899
```

#### Devnet (Alternative)

```bash
# Switch to devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2 $(solana address)

# Create and fund USDC token account
# TODO: Use devnet USDC faucet or create test USDC mint
```

### 8. Start Development Servers

```bash
# From project root, start all services
make dev

# Or start individually:
# Terminal 1: Next.js app
make web
# or: cd server/web && pnpm dev

# Terminal 2: Go chain-adapter
make adapter
# or: cd server/chain-adapter && go run ./main.go
```

## Development

### Available Make Targets

```bash
make help          # Show all available targets
make dev           # Start all services
make web           # Start Next.js app only
make adapter       # Start Go service only
make program-build # Build Solana program
make program-test  # Test Solana program
make db-migrate    # Run database migrations
make db-studio     # Open Prisma Studio
make clean         # Clean all build artifacts
make docker-up     # Start Docker services
make docker-down   # Stop Docker services
```

### Project Structure

```
.
├── apps/
│   ├── web/              # Next.js application
│   │   ├── src/
│   │   │   ├── app/      # App router pages and API routes
│   │   │   └── lib/      # Utilities (Prisma, auth, etc.)
│   │   └── prisma/       # Database schema and migrations
│   └── chain-adapter/    # Go service
│       ├── internal/
│       │   ├── api/      # HTTP API handlers
│       │   ├── solana/   # Solana client
│       │   └── scheduler/# Expiry/settlement schedulers
│       └── main.go
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
├── programs/
│   └── risk-exchange/    # Solana Anchor program
│       └── src/lib.rs    # On-chain contract logic
├── docker-compose.yml    # Local services (Postgres, Redis, Solana)
└── Makefile              # Common development tasks
```

## API Endpoints

### Web API (Next.js)

- `GET /api/orders` - List orders (with filters)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `POST /api/match/candidates` - Find match candidates
- `GET /api/matches/[id]` - Get match/negotiation thread
- `POST /api/matches/[id]/counter` - Create counter proposal
- `POST /api/matches/[id]/sign` - Sign terms (creates contract)
- `POST /api/contracts/initialize` - Initialize contract on-chain
- `GET /api/contracts/due` - Get contracts due for settlement (S2S)

### Chain Adapter API (Go)

- `POST /v1/contracts/initialize` - Initialize contract on-chain
- `POST /v1/contracts/{id}/fund` - Fund contract escrow
- `POST /v1/contracts/{id}/settle` - Settle contract
- `POST /v1/contracts/{id}/submit-signed` - Submit signed transaction
- `GET /v1/health` - Health check

All chain-adapter endpoints require HMAC authentication:
- `X-Timestamp`: Unix timestamp in milliseconds
- `X-Signature`: HMAC-SHA256 signature of `{timestamp}.{body}`

## Workflow

1. **Order Creation**: User creates an order (hedge/speculative, long/short, strike range, expiry, notional)
2. **Matching**: System proposes potential matches (opposite direction, same underlying)
3. **Negotiation**: Parties exchange counter proposals off-chain until both agree on terms
4. **Contract Creation**: Once both parties sign the same `terms_hash`, a contract is created
5. **On-Chain Initialization**: Chain-adapter initializes the contract on Solana (creates escrow PDA)
6. **Funding**: Both parties fund the escrow with USDC
7. **Activation**: Contract goes live once both parties have funded
8. **Settlement**: At expiry, scheduler reads Pyth oracle price and settles the contract
9. **Payout**: Winner receives funds, remainder refunded to both parties

## Testing

### Test Solana Program

```bash
cd programs/risk-exchange
anchor test
```

### Test Go Service

```bash
cd server/chain-adapter
go test ./...
```

### Test Next.js App

```bash
cd server/web
pnpm test
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth sessions
- `HMAC_SECRET` - Secret for server-to-server HMAC auth
- `RPC_PRIMARY` - Primary Solana RPC endpoint
- `PROGRAM_ID` - Deployed Solana program ID
- `NON_CUSTODIAL` - Enable/disable custodial mode

## Security Features

- **HMAC Authentication**: All S2S communication uses HMAC-SHA256
- **Idempotency Keys**: All POST mutators support idempotency
- **Rate Limiting**: Sensitive endpoints are rate-limited
- **Notional Limits**: Per-user daily notional limits enforced
- **Audit Trail**: All operations logged for compliance

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## Deployment

### Prerequisites

- Deploy Solana program to devnet/mainnet
- Update `PROGRAM_ID` in environment variables
- Configure production Supabase database
- Set up production RPC endpoints
- Configure KMS for custodial mode (if used)

### Steps

1. Build all applications:
   ```bash
   pnpm build
   cd server/chain-adapter && make build
   cd programs/risk-exchange && anchor build
   ```

2. Deploy Solana program:
   ```bash
   cd programs/risk-exchange
   anchor deploy --provider.cluster mainnet
   ```

3. Run database migrations:
   ```bash
   cd server/web
   pnpm db:migrate
   ```

4. Deploy applications to your hosting platform (Vercel, Railway, etc.)

## Troubleshooting

### Database Connection Issues

- Verify Supabase connection string is correct
- Check Supabase project is active
- Ensure IP is whitelisted in Supabase (if using IP restrictions)

### Solana RPC Issues

- For local development, ensure validator is running: `docker-compose ps`
- Check RPC URL in `.env` matches your setup
- For devnet, use public RPC or get API key from QuickNode/Alchemy

### Program Build Issues

- Ensure Anchor is installed: `anchor --version`
- Run `anchor build` from `programs/risk-exchange` directory
- Check Rust toolchain: `rustc --version`

### Port Conflicts

- Next.js default: 3000
- Chain-adapter default: 8080
- Solana validator: 8899
- Postgres: 5432
- Redis: 6379

Change ports in `.env` or `docker-compose.yml` if needed.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

See LICENSE file for details.
