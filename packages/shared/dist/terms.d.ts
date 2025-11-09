/**
 * Canonical Offer object for terms hashing
 */
export interface Offer {
    match_id: string;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    long_party: string;
    short_party: string;
    program_id: string;
    oracle_feed: string;
    usdc_mint: string;
    version: number;
}
/**
 * Generate terms hash from canonical Offer object
 * 1. Canonicalize JSON (sorted keys)
 * 2. SHA256 hash
 */
export declare function generateTermsHash(offer: Offer): string;
/**
 * Create Offer object from negotiation parameters
 */
export declare function createOffer(params: {
    matchId: string;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    longParty: string;
    shortParty: string;
    programId: string;
    oracleFeed: string;
    usdcMint: string;
}): Offer;
