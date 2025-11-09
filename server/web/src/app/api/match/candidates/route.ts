import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  findMatchCandidates,
  OrderForMatching,
  MatchCandidate,
} from '@lyzn/shared';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Get the source order
    const sourceOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!sourceOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Find all OPEN orders with opposite direction and same underlying
    const candidateOrders = await prisma.order.findMany({
      where: {
        id: { not: orderId },
        underlying: sourceOrder.underlying,
        direction: sourceOrder.direction === 'LONG' ? 'SHORT' : 'LONG',
        status: 'OPEN',
        expiry: {
          gte: new Date(), // Not expired
        },
      },
    });

    // Convert to matching format
    const sourceOrderForMatching: OrderForMatching = {
      id: sourceOrder.id,
      underlying: sourceOrder.underlying,
      direction: sourceOrder.direction as 'LONG' | 'SHORT',
      strikeMin: Number(sourceOrder.strikeMin),
      strikeMax: Number(sourceOrder.strikeMax),
      notional: Number(sourceOrder.notional),
      expiry: sourceOrder.expiry,
      tolDays: sourceOrder.tolDays,
    };

    // Calculate match scores
    const candidates: (MatchCandidate & { orderB: any })[] = [];
    for (const candidateOrder of candidateOrders) {
      const candidateForMatching: OrderForMatching = {
        id: candidateOrder.id,
        underlying: candidateOrder.underlying,
        direction: candidateOrder.direction as 'LONG' | 'SHORT',
        strikeMin: Number(candidateOrder.strikeMin),
        strikeMax: Number(candidateOrder.strikeMax),
        notional: Number(candidateOrder.notional),
        expiry: candidateOrder.expiry,
        tolDays: candidateOrder.tolDays,
      };

      const match = findMatchCandidates(
        sourceOrderForMatching,
        candidateForMatching
      );

      if (match && match.counterEligible) {
        candidates.push({
          ...match,
          orderB: candidateOrder,
        });
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Return top N candidates
    const topN = Math.min(candidates.length, 20);
    const topCandidates = candidates.slice(0, topN);

    return NextResponse.json({
      candidates: topCandidates.map((c) => ({
        orderAId: c.orderAId,
        orderBId: c.orderBId,
        orderB: c.orderB,
        score: c.score,
        expiryProximity: c.expiryProximity,
        strikeOverlapRatio: c.strikeOverlapRatio,
        notionalOverlapRatio: c.notionalOverlapRatio,
        counterEligible: c.counterEligible,
      })),
    });
  } catch (error) {
    console.error('Error finding match candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

