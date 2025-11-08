# Verifying Pyth Network Integration

This guide shows you how to verify that the Pyth Network integration is working correctly.

## Quick Verification

### 1. Test TypeScript Helper Functions

```bash
# From project root
cd apps/web
npx tsx ../../scripts/test-pyth.ts
```

This will:
- Test the `getPythFeed()` helper function
- Read actual Pyth price feeds from Solana
- Display price, confidence, status, and freshness
- Verify data is valid and recent

### 2. Test Go Client Integration

```bash
# From project root
cd apps/chain-adapter
go run ../../scripts/test-pyth.go
```

Or set a custom RPC:
```bash
RPC_URL=https://api.devnet.solana.com go run ../../scripts/test-pyth.go
```

This will:
- Test the Go implementation of `GetPythPrice()`
- Read BTC/USD and ETH/USD feeds
- Display parsed price data

### 3. Test in Your Application

#### Test the Chain Adapter API

Start the chain adapter:
```bash
cd apps/chain-adapter
go run main.go
```

Then test the price endpoint (if you have an API endpoint):
```bash
curl http://localhost:8080/api/pyth-price?feed=HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J
```

#### Test the Web API

Start the web app:
```bash
cd apps/web
pnpm dev
```

The Pyth feeds are used automatically when:
- Creating counter offers (uses `getPythFeed()`)
- Settling contracts (chain adapter reads prices)

## Manual Verification Steps

### 1. Verify Pyth Feed Addresses

Check that the feed addresses are correct:
```typescript
// In packages/shared/src/constants.ts
import { PYTH_CONFIG, getPythFeed } from '@lyzn/shared';

console.log('BTC/USD Devnet:', PYTH_CONFIG.BTC_USD_DEVNET);
console.log('ETH/USD Devnet:', PYTH_CONFIG.ETH_USD_DEVNET);
console.log('Current BTC feed:', getPythFeed('BTC_USD'));
```

### 2. Verify Rust Program Parsing

The Rust program parses Pyth accounts in `programs/risk-exchange/src/lib.rs`:
- Checks account size (>= 200 bytes)
- Parses price, confidence, exponent
- Validates status (must be Trading = 1)
- Checks freshness (max 60 seconds old)
- Validates confidence threshold

### 3. Verify Go Client Parsing

The Go client reads prices in `apps/chain-adapter/internal/solana/client.go`:
- Fetches account data via RPC
- Parses the same structure as Rust
- Returns float64 price for settlement

## Expected Results

When everything works correctly, you should see:

1. **TypeScript Test:**
   - ✓ Prices displayed (e.g., BTC ~$40,000-60,000)
   - ✓ Status = 1 (Trading)
   - ✓ Age < 60 seconds (Fresh)
   - ✓ Confidence values present

2. **Go Test:**
   - ✓ Prices parsed successfully
   - ✓ Status = 1 (Trading)
   - ✓ All fields populated

3. **Integration:**
   - Contracts can be created with oracle feeds
   - Settlement can read prices from Pyth
   - No errors in logs

## Troubleshooting

### Error: "Account not found"
- Check the feed address is correct
- Verify you're on the right network (devnet vs mainnet)
- Ensure the RPC endpoint is working

### Error: "Account data too short"
- The account might not be a valid Pyth price feed
- Verify the address points to a Pyth price account

### Error: "Status not Trading"
- The price feed might be temporarily unavailable
- Try a different feed or wait a moment

### Error: "Price feed is stale"
- The price hasn't been updated recently
- This is normal if the feed is inactive
- Check Pyth network status

## Using Mainnet

To test on mainnet:

1. Update feed addresses in `packages/shared/src/constants.ts`:
   ```typescript
   BTC_USD_MAINNET: '...', // Get from https://pyth.network/developers/price-feed-ids
   ETH_USD_MAINNET: '...',
   ```

2. Set environment variable:
   ```bash
   export SOLANA_CLUSTER=mainnet
   ```

3. Use mainnet RPC:
   ```bash
   export RPC_URL=https://api.mainnet-beta.solana.com
   ```

## Additional Resources

- [Pyth Network Documentation](https://docs.pyth.network)
- [Price Feed IDs](https://pyth.network/developers/price-feed-ids)
- [Pyth Account Structure](https://docs.pyth.network/price-feeds/account-structure)

