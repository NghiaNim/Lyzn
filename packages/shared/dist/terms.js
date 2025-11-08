"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTermsHash = generateTermsHash;
exports.createOffer = createOffer;
const crypto_1 = require("crypto");
/**
 * Canonicalize JSON by sorting keys recursively
 */
function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(canonicalize);
    }
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = canonicalize(obj[key]);
    }
    return sorted;
}
/**
 * Generate terms hash from canonical Offer object
 * 1. Canonicalize JSON (sorted keys)
 * 2. SHA256 hash
 */
function generateTermsHash(offer) {
    const canonical = canonicalize(offer);
    const jsonString = JSON.stringify(canonical);
    return (0, crypto_1.createHash)('sha256').update(jsonString).digest('hex');
}
/**
 * Create Offer object from negotiation parameters
 */
function createOffer(params) {
    return {
        match_id: params.matchId,
        underlying: params.underlying,
        strike: params.strike,
        expiry: params.expiry,
        notional: params.notional,
        long_party: params.longParty,
        short_party: params.shortParty,
        program_id: params.programId,
        oracle_feed: params.oracleFeed,
        usdc_mint: params.usdcMint,
        version: 1,
    };
}
