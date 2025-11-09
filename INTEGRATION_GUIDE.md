# Integration Guide

## Overview

This guide explains how the frontend, backend, and smart contracts are connected in the LYZN platform.

## Architecture

```
Frontend (Next.js) → Backend API (Next.js API Routes) → Database (PostgreSQL)
                                   ↓
                          Chain Adapter (Go) → Solana + Pyth Network
                                   ↓
                         Smart Contract (Rust/Anchor)
```

## Components

### 1. Frontend (`app/`)

The frontend is built with Next.js and React. Key pages:

#### Chat Page (`app/chat/page.tsx`)
- **Purpose**: AI-powered risk assessment using Grok
- **Integration**: Calls `/api/chat` endpoint
- **Features**:
  - Real-time conversation with Grok AI
  - Analyzes business risks
  - Suggests hedging strategies
  - Redirects to risks page after analysis

#### Marketplace Page (`app/marketplace/page.tsx`)
- **Purpose**: Browse and purchase risk contracts
- **Integration**: Calls `/api/orders` endpoint
- **Features**:
  - Fetches open orders from database
  - Filters by category and search
  - Displays real-time contract data
  - Links to contract details

#### Create Contract Page (`app/create/page.tsx`)
- **Purpose**: Create custom risk contracts
- **Integration**: 
  - Calls `/api/orders` to create orders
  - Orders are matched via `/api/matches`
  - Matched orders trigger smart contract deployment
- **Features**:
  - AI-powered contract generation
  - Pyth Network oracle integration
  - Automatic strike price calculation
  - Posts to marketplace

### 2. Backend API (`apps/web/src/app/api/`)

#### Chat API (`/api/chat`)
- **File**: `apps/web/src/app/api/chat/route.ts`
- **Purpose**: Grok AI integration
- **Features**:
  - Calls Grok API (X.AI)
  - Analyzes business context
  - Detects risk exposures
  - Suggests next steps
- **Environment**: Requires `GROK_API_KEY` or `XAI_API_KEY`

#### Orders API (`/api/orders`)
- **File**: `apps/web/src/app/api/orders/route.ts`
- **Purpose**: Create and fetch risk orders
- **Features**:
  - Create new orders
  - Fetch open/matched orders
  - Filter by underlying, direction, expiry
  - Idempotency support
- **Database**: Uses Prisma ORM

#### Matches API (`/api/matches`)
- **File**: `apps/web/src/app/api/matches/route.ts`
- **Purpose**: Match opposite orders
- **Features**:
  - Validate order compatibility
  - Create matches
  - Update order statuses
  - Trigger contract initialization

#### Contracts API (`/api/contracts`)
- **File**: `apps/web/src/app/api/contracts/route.ts`
- **Purpose**: Initialize and manage smart contracts
- **Features**:
  - Initialize contracts on Solana
  - Fetch contract details
  - Track contract status
  - Settlement integration

### 3. Smart Contracts (`programs/risk-exchange/`)

#### Solana Program (Anchor)
- **File**: `programs/risk-exchange/src/lib.rs`
- **Purpose**: Trustless settlement of risk contracts
- **Features**:
  - Escrow collateral from both parties
  - Integrate with Pyth Network oracles
  - Automatic settlement at expiry
  - Fixed-point price calculations
- **Pyth Integration**: Uses `pyth-solana-receiver-sdk`

### 4. Chain Adapter (`apps/chain-adapter/`)

#### Go Service
- **File**: `apps/chain-adapter/internal/solana/client.go`
- **Purpose**: Monitor Solana blockchain and trigger events
- **Features**:
  - Read Pyth price feeds
  - Monitor contract events
  - Trigger settlements
  - Webhook notifications
- **Pyth Integration**: Direct account parsing

### 5. Shared Utilities (`packages/shared/`)

#### Constants (`packages/shared/src/constants.ts`)
- Pyth Network Feed IDs
- Solana configuration
- USDC mint addresses

#### API Client (`apps/web/src/lib/api-client.ts`)
- Type-safe API client
- Request/response types
- Error handling

## Data Flow

### Creating a Contract

1. **User fills form** in `/create`
   - Selects commodity, strike price, expiry
   - Chooses LONG or SHORT position
   - Sets protection amount

2. **AI generates contract structure**
   - Calculates strike range
   - Selects Pyth oracle
   - Estimates costs

3. **Frontend posts order** to `/api/orders`
   ```typescript
   POST /api/orders
   {
     underlying: "SUGAR",
     direction: "LONG",
     strikeMin: 0.55,
     strikeMax: 0.58,
     notional: 5000,
     expiry: "2026-05-01T00:00:00Z",
     tolDays: 7
   }
   ```

4. **Backend validates and stores** in database
   - Checks notional limits
   - Creates audit log
   - Returns order ID

5. **Order appears** in marketplace at `/marketplace`

### Matching and Settlement

1. **Counterparty finds order** in marketplace

2. **Match created** via `/api/matches`
   ```typescript
   POST /api/matches
   {
     orderAId: "order-1-id",
     orderBId: "order-2-id"
   }
   ```

3. **Smart contract initialized** via `/api/contracts/initialize`
   - Deploys Solana program
   - Both parties deposit collateral
   - Oracle configured

4. **Chain adapter monitors** contract
   - Checks Pyth prices
   - Detects expiry

5. **Automatic settlement**
   - Oracle reports final price
   - Smart contract calculates payout
   - Funds distributed

## API Endpoints

### Orders
- `GET /api/orders` - List orders (with filters)
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

### Matches
- `POST /api/matches` - Create match
- `GET /api/matches/:id` - Get match details
- `POST /api/matches/:id/sign` - Sign match
- `POST /api/matches/:id/counter` - Counter-offer

### Contracts
- `GET /api/contracts` - List contracts
- `GET /api/contracts/:id` - Get contract details
- `POST /api/contracts/initialize` - Initialize smart contract
- `GET /api/contracts/due` - Get contracts due for settlement

### Chat
- `POST /api/chat` - Send message to Grok AI

## Environment Variables

See `.env.example` for all required environment variables:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Key variables:
- `GROK_API_KEY` - For AI chat functionality
- `DATABASE_URL` - PostgreSQL connection
- `SOLANA_RPC_URL` - Solana RPC endpoint
- `NEXTAUTH_SECRET` - Authentication secret

## Testing

### Test Chat Integration
```bash
# Visit http://localhost:3000/chat
# Type a message
# Should receive Grok AI response
```

### Test Marketplace
```bash
# Visit http://localhost:3000/marketplace
# Should load orders from database
# Filter and search should work
```

### Test Contract Creation
```bash
# Visit http://localhost:3000/create
# Fill in form
# Generate contract
# Post to marketplace
# Should appear in /marketplace
```

### Test Pyth Integration
```bash
# TypeScript test
make test-pyth-ts

# Go test
make test-pyth-go

# Both
make test-pyth
```

## Troubleshooting

### Chat not working
- Check `GROK_API_KEY` is set
- Verify API key is valid at https://console.x.ai/
- Check browser console for errors
- Falls back to canned responses if API unavailable

### Marketplace empty
- Create orders via `/create` page
- Check database connection
- Verify `DATABASE_URL` is correct
- Check API logs in terminal

### Orders not creating
- Ensure you're authenticated (NextAuth)
- Check notional limits
- Verify all required fields
- Check API response in Network tab

### Pyth prices not updating
- Verify Feed IDs in `packages/shared/src/constants.ts`
- Check RPC connection
- Test with `make test-pyth`
- Verify account addresses

## Development Workflow

1. **Start database**
   ```bash
   make docker-up
   ```

2. **Run migrations**
   ```bash
   make db-migrate
   ```

3. **Build shared package**
   ```bash
   cd packages/shared && npm run build
   ```

4. **Start web app**
   ```bash
   make web
   ```

5. **Start chain adapter** (optional)
   ```bash
   make adapter
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## Next Steps

1. **Get Grok API key**: https://console.x.ai/
2. **Configure environment**: Copy `.env.example` to `.env`
3. **Start services**: `make dev`
4. **Test chat**: Visit `/chat`
5. **Create contract**: Visit `/create`
6. **Browse marketplace**: Visit `/marketplace`

## Architecture Decisions

### Why Next.js API Routes?
- Co-located with frontend
- TypeScript type safety
- Easy deployment
- Built-in middleware

### Why Grok AI?
- Real-time capabilities
- X integration
- Powerful reasoning
- Business-focused

### Why Pyth Network?
- Low latency price feeds
- Wide asset coverage
- Solana-native
- Trustless oracles

### Why Solana?
- Low transaction costs
- High throughput
- Native program support
- Pyth integration

## Support

For issues or questions:
1. Check this guide
2. Review code comments
3. Test with example data
4. Check logs and console


