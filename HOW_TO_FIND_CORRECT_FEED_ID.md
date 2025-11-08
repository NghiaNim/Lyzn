# How to Find the Correct Pyth Feed ID

## The Problem

When you visit https://pyth.network/developers/price-feed-ids, you'll see many different feed IDs, including:
- **Crypto** - Cryptocurrency spot prices (BTC/USD, ETH/USD, etc.)
- **Equity.US** - US stock prices
- **FX** - Foreign exchange rates
- **Metal** - Precious metals
- And more...

**You found:** `0xb3a76e70a55517e0405cc90a2545de4c30413c13c532caf96a734103ec4259e9`

This might be a different BTC/USD feed from a different asset class.

## Step-by-Step: Finding the Right Feed

### 1. Go to the Price Feed IDs Page
Visit: https://pyth.network/developers/price-feed-ids

### 2. Filter by Asset Class
At the top of the page, you'll see asset class filters. **Select "Crypto"**

This filters to show only cryptocurrency feeds, which is what you want for:
- BTC/USD (Bitcoin spot price)
- ETH/USD (Ethereum spot price)  
- SOL/USD (Solana spot price)

### 3. Find Your Asset
Search for "BTC/USD" in the Crypto section. You should see:

```
Symbol: Crypto.BTC/USD
Feed ID: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
```

### 4. Verify It's the Crypto Feed
Make sure the symbol says **"Crypto.BTC/USD"** not:
- ❌ "Equity.US.BTC/USD" (if it exists)
- ❌ "FX.BTC/USD" 
- ❌ Any other prefix

## The Correct Feed IDs for Crypto

For a **crypto trading/risk exchange platform**, use these from the **Crypto** asset class:

| Asset | Feed ID | Symbol |
|-------|---------|--------|
| BTC/USD | `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` | Crypto.BTC/USD |
| ETH/USD | `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` | Crypto.ETH/USD |
| SOL/USD | `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d` | Crypto.SOL/USD |

## What if You Found a Different ID?

If `0xb3a76e70...` was for BTC/USD, it might be:

1. **Different Asset Class:** Could be BTC in a different market (futures, options, etc.)
2. **Different Pair:** Could be BTC/EUR or another currency pair
3. **Test Feed:** Could be a beta/test feed

**Always use the Crypto asset class for cryptocurrency spot prices.**

## Quick Checklist

✅ Visit https://pyth.network/developers/price-feed-ids  
✅ Select **"Stable"** (not Beta)  
✅ Filter by **"Crypto"** asset class  
✅ Find **"Crypto.BTC/USD"** (not other variants)  
✅ Copy the Feed ID (starts with `0x...`)  
✅ Verify it matches: `0xe62df...` for BTC/USD  

## Visual Guide

On the Pyth website, you should see:

```
[Stable] [Beta]          <- Select "Stable"
[All] [Crypto] [FX] ...  <- Select "Crypto"

Search: BTC/USD

Results:
🟢 Crypto.BTC/USD
   Feed ID: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
   Status: Active
   [Copy ID] [View Details]
```

That's the one you want!

## Still Unsure?

If you're still seeing different IDs:

1. **Screenshot the page** showing the Feed ID
2. **Check the "Symbol"** field - it should say "Crypto.BTC/USD"
3. **Check "Status"** - it should be "Active"
4. **Check you're on "Stable"** - not Beta

The Feed IDs in your `constants.ts` file are correct for **Crypto spot prices**.

