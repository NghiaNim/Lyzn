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
export declare function calculateExpiryProximity(expiryA: Date, expiryB: Date, tolDays?: number): number;
/**
 * Calculate strike overlap ratio
 * Returns overlapWidth / unionWidth
 */
export declare function calculateStrikeOverlapRatio(minA: number, maxA: number, minB: number, maxB: number): number;
/**
 * Calculate notional overlap ratio
 * Returns min(A, B) / max(A, B)
 */
export declare function calculateNotionalOverlapRatio(notionalA: number, notionalB: number): number;
/**
 * Calculate overall matching score
 * Weights: 40% expiry, 40% strike, 20% notional
 */
export declare function calculateMatchScore(expiryProximity: number, strikeOverlapRatio: number, notionalOverlapRatio: number): number;
/**
 * Check if a match is counter-eligible
 * Requirements:
 * - |Δt| ≤ 7 days
 * - Strike overlap ratio ≥ 0.15
 * - Notional ratio ≥ 0.5
 */
export declare function isCounterEligible(expiryA: Date, expiryB: Date, strikeOverlapRatio: number, notionalOverlapRatio: number, tolDays?: number): boolean;
/**
 * Find match candidates between two orders
 */
export declare function findMatchCandidates(orderA: OrderForMatching, orderB: OrderForMatching): MatchCandidate | null;
