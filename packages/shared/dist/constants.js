"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC_MINT = exports.SETTLEMENT_CONFIG = exports.PYTH_PROGRAM_ID = exports.PYTH_FEED_IDS = exports.SOLANA_CONFIG = exports.API_ENDPOINTS = exports.FEATURE_FLAGS = void 0;
exports.getPythFeedId = getPythFeedId;
// Feature flags
exports.FEATURE_FLAGS = {
    CUSTODIAL_MODE: process.env.ENABLE_CUSTODIAL_MODE === 'true',
};
// API endpoints
exports.API_ENDPOINTS = {
    ORDERS: '/api/orders',
    COUNTERS: '/api/counters',
    CONTRACTS: '/api/contracts',
    MATCHES: '/api/matches',
};
// Solana program IDs (devnet/testnet)
exports.SOLANA_CONFIG = {
    DEVNET_PROGRAM_ID: '11111111111111111111111111111111', // Replace with actual program ID
    MAINNET_PROGRAM_ID: '', // Set when deploying to mainnet
    CLUSTER: process.env.SOLANA_CLUSTER || 'devnet',
};
// Pyth oracle price feed IDs (hex format)
// Get from: https://pyth.network/developers/price-feed-ids
// IMPORTANT: Use the "Crypto" asset class feeds (not Equity.US or other markets)
// These are Feed IDs, not account addresses. Account addresses are derived using the SDK.
exports.PYTH_FEED_IDS = {
    // Feed IDs are the same across all networks
    // Verify these at https://pyth.network/developers/price-feed-ids (select "Crypto" asset class)
    BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    // If you found a different BTC/USD ID, it might be from a different market
    // For example: 0xb3a76e70... could be an equity or futures market
    // For crypto spot prices, use the IDs above from the "Crypto" asset class
};
// Pyth Program ID (same on all Solana networks)
exports.PYTH_PROGRAM_ID = 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s';
// Helper function to get Pyth feed ID
function getPythFeedId(feed) {
    return exports.PYTH_FEED_IDS[feed];
}
// Note: Price feed account addresses are derived programmatically using:
// - PythSolanaReceiver.getPriceFeedAccountAddress(shardId, feedId)
// - Default shard ID is 0
// See: @pythnetwork/pyth-solana-receiver for TypeScript
// See: pyth-solana-receiver-sdk for Rust
// Settlement
exports.SETTLEMENT_CONFIG = {
    SETTLEMENT_DELAY_SECONDS: 60, // Delay after expiry before settlement
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 5000,
};
// USDC mint (devnet)
exports.USDC_MINT = {
    DEVNET: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC devnet mint
    MAINNET: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet mint
};
