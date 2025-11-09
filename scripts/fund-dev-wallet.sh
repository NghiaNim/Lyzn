#!/bin/bash
set -e

# Script to fund dev wallets with SOL and USDC on local validator or devnet

CLUSTER=${1:-localnet}
WALLET_ADDRESS=${2:-$(solana address 2>/dev/null || echo "")}

if [ -z "$WALLET_ADDRESS" ]; then
    echo "❌ No wallet address provided. Usage:"
    echo "   ./scripts/fund-dev-wallet.sh [localnet|devnet] [wallet-address]"
    exit 1
fi

if [ "$CLUSTER" = "localnet" ]; then
    RPC_URL="http://localhost:8899"
    echo "💰 Funding wallet on local validator..."
    echo "   Address: $WALLET_ADDRESS"
    echo "   RPC: $RPC_URL"
    
    # Airdrop SOL
    solana airdrop 10 "$WALLET_ADDRESS" --url "$RPC_URL" || {
        echo "⚠️  Airdrop failed. Make sure local validator is running: docker-compose up -d solana-validator"
        exit 1
    }
    
    echo "✅ Airdropped 10 SOL to $WALLET_ADDRESS"
    echo ""
    echo "📊 Balance:"
    solana balance "$WALLET_ADDRESS" --url "$RPC_URL"
    echo ""
    echo "💡 For USDC on localnet, you'll need to:"
    echo "   1. Create a test USDC mint"
    echo "   2. Create token accounts"
    echo "   3. Mint test USDC tokens"
    echo "   (This requires additional setup - see TODO in codebase)"
    
elif [ "$CLUSTER" = "devnet" ]; then
    RPC_URL="https://api.devnet.solana.com"
    echo "💰 Funding wallet on devnet..."
    echo "   Address: $WALLET_ADDRESS"
    echo "   RPC: $RPC_URL"
    
    # Switch to devnet
    solana config set --url devnet
    
    # Airdrop SOL
    solana airdrop 2 "$WALLET_ADDRESS" || {
        echo "⚠️  Airdrop failed. Devnet may be rate-limited. Try again later."
        exit 1
    }
    
    echo "✅ Airdropped 2 SOL to $WALLET_ADDRESS"
    echo ""
    echo "📊 Balance:"
    solana balance "$WALLET_ADDRESS"
    echo ""
    echo "💡 For USDC on devnet:"
    echo "   - Use devnet USDC mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    echo "   - Get test USDC from devnet faucet or create test mint"
    
else
    echo "❌ Invalid cluster. Use 'localnet' or 'devnet'"
    exit 1
fi

