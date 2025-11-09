"use strict";
/**
 * Matching score calculation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateExpiryProximity = calculateExpiryProximity;
exports.calculateStrikeOverlapRatio = calculateStrikeOverlapRatio;
exports.calculateNotionalOverlapRatio = calculateNotionalOverlapRatio;
exports.calculateMatchScore = calculateMatchScore;
exports.isCounterEligible = isCounterEligible;
exports.findMatchCandidates = findMatchCandidates;
/**
 * Calculate expiry proximity score
 * Clamps to [0, 1] based on 7-day tolerance
 */
function calculateExpiryProximity(expiryA, expiryB, tolDays = 7) {
    const deltaMs = Math.abs(expiryA.getTime() - expiryB.getTime());
    const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
    const ratio = 1 - deltaDays / tolDays;
    return Math.max(0, Math.min(1, ratio));
}
/**
 * Calculate strike overlap ratio
 * Returns overlapWidth / unionWidth
 */
function calculateStrikeOverlapRatio(minA, maxA, minB, maxB) {
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
function calculateNotionalOverlapRatio(notionalA, notionalB) {
    if (notionalA === 0 || notionalB === 0) {
        return 0;
    }
    return Math.min(notionalA, notionalB) / Math.max(notionalA, notionalB);
}
/**
 * Calculate overall matching score
 * Weights: 40% expiry, 40% strike, 20% notional
 */
function calculateMatchScore(expiryProximity, strikeOverlapRatio, notionalOverlapRatio) {
    return (0.4 * expiryProximity +
        0.4 * strikeOverlapRatio +
        0.2 * notionalOverlapRatio);
}
/**
 * Check if a match is counter-eligible
 * Requirements:
 * - |Δt| ≤ 7 days
 * - Strike overlap ratio ≥ 0.15
 * - Notional ratio ≥ 0.5
 */
function isCounterEligible(expiryA, expiryB, strikeOverlapRatio, notionalOverlapRatio, tolDays = 7) {
    const deltaMs = Math.abs(expiryA.getTime() - expiryB.getTime());
    const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
    return (deltaDays <= tolDays &&
        strikeOverlapRatio >= 0.15 &&
        notionalOverlapRatio >= 0.5);
}
/**
 * Find match candidates between two orders
 */
function findMatchCandidates(orderA, orderB) {
    // Must be opposite directions
    if (orderA.direction === orderB.direction) {
        return null;
    }
    // Must be same underlying
    if (orderA.underlying !== orderB.underlying) {
        return null;
    }
    const expiryProximity = calculateExpiryProximity(orderA.expiry, orderB.expiry, Math.min(orderA.tolDays, orderB.tolDays));
    const strikeOverlapRatio = calculateStrikeOverlapRatio(orderA.strikeMin, orderA.strikeMax, orderB.strikeMin, orderB.strikeMax);
    const notionalOverlapRatio = calculateNotionalOverlapRatio(orderA.notional, orderB.notional);
    const score = calculateMatchScore(expiryProximity, strikeOverlapRatio, notionalOverlapRatio);
    const counterEligible = isCounterEligible(orderA.expiry, orderB.expiry, strikeOverlapRatio, notionalOverlapRatio, Math.min(orderA.tolDays, orderB.tolDays));
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
