import { createHash } from 'crypto';

/**
 * Canonical Offer object for terms hashing
 */
export interface Offer {
  match_id: string;
  underlying: string;
  strike: number;
  expiry: string; // ISO 8601
  notional: number;
  long_party: string; // pubkey
  short_party: string; // pubkey
  program_id: string;
  oracle_feed: string;
  usdc_mint: string;
  version: number;
}

/**
 * Canonicalize JSON by sorting keys recursively
 */
function canonicalize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(canonicalize);
  }

  const sorted: any = {};
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
export function generateTermsHash(offer: Offer): string {
  const canonical = canonicalize(offer);
  const jsonString = JSON.stringify(canonical);
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Create Offer object from negotiation parameters
 */
export function createOffer(params: {
  matchId: string;
  underlying: string;
  strike: number;
  expiry: string; // ISO 8601
  notional: number;
  longParty: string;
  shortParty: string;
  programId: string;
  oracleFeed: string;
  usdcMint: string;
}): Offer {
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

