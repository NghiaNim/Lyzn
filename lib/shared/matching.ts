/**
 * Matching score calculation utilities
 */

export interface MatchCandidate {
  orderAId: string;
  orderBId: string;
  expiryProximity: number;
  strikeOverlapRatio: number;
  notionalOverlapRatio: number;
  score: number;
  counterEligible: boolean;
}

export interface OrderForMatching {
  id: string;
  underlying: string;
  direction: 'LONG' | 'SHORT';
  strikeMin: number;
  strikeMax: number;
  notional: number;
  expiry: Date;
  tolDays: number;
}

/**
 * Calculate expiry proximity score
 * Clamps to [0, 1] based on 7-day tolerance
 */
export function calculateExpiryProximity(
  expiryA: Date,
  expiryB: Date,
  tolDays: number = 7
): number {
  const deltaMs = Math.abs(expiryA.getTime() - expiryB.getTime());
  const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
  const ratio = 1 - deltaDays / tolDays;
  return Math.max(0, Math.min(1, ratio));
}

/**
 * Calculate strike overlap ratio
 * Returns overlapWidth / unionWidth
 */
export function calculateStrikeOverlapRatio(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number
): number {
  const overlapMin = Math.max(minA, minB);
  const overlapMax = Math.min(maxA, maxB);
  
  if (overlapMin >= overlapMax) {
    return 0; // No overlap
  }

  const overlapWidth = overlapMax - overlapMin;
  const unionMin = Math.min(minA, minB);
  const unionMax = Math.max(maxA, maxB);
  const unionWidth = unionMax - unionMin;

  if (unionWidth === 0) {
    return 1; // Perfect match
  }

  return overlapWidth / unionWidth;
}

/**
 * Calculate notional overlap ratio
 * Returns min(A, B) / max(A, B)
 */
export function calculateNotionalOverlapRatio(
  notionalA: number,
  notionalB: number
): number {
  if (notionalA === 0 || notionalB === 0) {
    return 0;
  }
  return Math.min(notionalA, notionalB) / Math.max(notionalA, notionalB);
}

/**
 * Calculate overall matching score
 * Weights: 40% expiry, 40% strike, 20% notional
 */
export function calculateMatchScore(
  expiryProximity: number,
  strikeOverlapRatio: number,
  notionalOverlapRatio: number
): number {
  return (
    0.4 * expiryProximity +
    0.4 * strikeOverlapRatio +
    0.2 * notionalOverlapRatio
  );
}

/**
 * Check if a match is counter-eligible
 * Requirements:
 * - |Δt| ≤ 7 days
 * - Strike overlap ratio ≥ 0.15
 * - Notional ratio ≥ 0.5
 */
export function isCounterEligible(
  expiryA: Date,
  expiryB: Date,
  strikeOverlapRatio: number,
  notionalOverlapRatio: number,
  tolDays: number = 7
): boolean {
  const deltaMs = Math.abs(expiryA.getTime() - expiryB.getTime());
  const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
  
  return (
    deltaDays <= tolDays &&
    strikeOverlapRatio >= 0.15 &&
    notionalOverlapRatio >= 0.5
  );
}

/**
 * Find match candidates between two orders
 */
export function findMatchCandidates(
  orderA: OrderForMatching,
  orderB: OrderForMatching
): MatchCandidate | null {
  // Must be opposite directions
  if (orderA.direction === orderB.direction) {
    return null;
  }

  // Must be same underlying
  if (orderA.underlying !== orderB.underlying) {
    return null;
  }

  const expiryProximity = calculateExpiryProximity(
    orderA.expiry,
    orderB.expiry,
    Math.min(orderA.tolDays, orderB.tolDays)
  );

  const strikeOverlapRatio = calculateStrikeOverlapRatio(
    orderA.strikeMin,
    orderA.strikeMax,
    orderB.strikeMin,
    orderB.strikeMax
  );

  const notionalOverlapRatio = calculateNotionalOverlapRatio(
    orderA.notional,
    orderB.notional
  );

  const score = calculateMatchScore(
    expiryProximity,
    strikeOverlapRatio,
    notionalOverlapRatio
  );

  const counterEligible = isCounterEligible(
    orderA.expiry,
    orderB.expiry,
    strikeOverlapRatio,
    notionalOverlapRatio,
    Math.min(orderA.tolDays, orderB.tolDays)
  );

  return {
    orderAId: orderA.id,
    orderBId: orderB.id,
    expiryProximity,
    strikeOverlapRatio,
    notionalOverlapRatio,
    score,
    counterEligible,
  };
}

