import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createOffer, generateTermsHash } from '@/lib/shared/terms';
import { SOLANA_CONFIG, USDC_MINT, getPythFeedId } from '@/lib/shared/constants';
import { createAuditLog } from '@/lib/audit';
import { checkIdempotency, storeIdempotency } from '@/lib/idempotency';
import { rateLimitMiddleware } from '@/middleware/rate-limit';
import { checkNotionalLimit } from '@/lib/notional-limits';

const CounterSchema = z.object({
  strike: z.number().positive(),
  notional: z.number().positive(),
  expiry: z.string().datetime(),
  message: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CounterSchema.parse(body);
    const proposerId = (session.user as any).id;

    // Check idempotency
    if (validated.idempotencyKey) {
      const existing = await checkIdempotency(validated.idempotencyKey, proposerId);
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      proposerId,
      `/api/matches/${params.id}/counter`
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check notional limit
    const notionalCheck = await checkNotionalLimit(proposerId, validated.notional);
    if (!notionalCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Daily notional limit exceeded',
          used: notionalCheck.used,
          limit: notionalCheck.limit,
          remaining: notionalCheck.remaining,
        },
        { status: 429 }
      );
    }

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        orderA: {
          include: {
            user: true,
          },
        },
        orderB: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Determine which order is the proposer's
    const proposerOrder =
      match.orderA.userId === proposerId ? match.orderA : match.orderB;
    const otherOrder =
      match.orderA.userId === proposerId ? match.orderB : match.orderA;

    if (!proposerOrder) {
      return NextResponse.json(
        { error: 'You are not a party to this match' },
        { status: 403 }
      );
    }

    // Get user wallets
    const proposerUser = await prisma.user.findUnique({
      where: { id: proposerId },
    });
    const otherUser = await prisma.user.findUnique({
      where: { id: otherOrder.userId },
    });

    // Determine long/short parties (use wallet if available, fallback to user ID)
    const longParty =
      proposerOrder.direction === 'LONG'
        ? proposerUser?.wallet || proposerId
        : otherUser?.wallet || otherOrder.userId;
    const shortParty =
      proposerOrder.direction === 'SHORT'
        ? proposerUser?.wallet || proposerId
        : otherUser?.wallet || otherOrder.userId;

    // Get oracle feed ID for underlying
    // Note: This is the Feed ID (hex), not a derived account address
    // Account addresses are derived using PythSolanaReceiver SDK
    const oracleFeed = getPythFeedId(
      `${match.orderA.underlying}_USD` as 'BTC_USD' | 'ETH_USD' | 'SOL_USD'
    ) || getPythFeedId('BTC_USD'); // Fallback to BTC

    // Create offer and generate terms hash
    const offer = createOffer({
      matchId: match.id,
      underlying: match.orderA.underlying,
      strike: validated.strike,
      expiry: validated.expiry,
      notional: validated.notional,
      longParty: longParty,
      shortParty: shortParty,
      programId: SOLANA_CONFIG.DEVNET_PROGRAM_ID,
      oracleFeed: oracleFeed,
      usdcMint:
        SOLANA_CONFIG.CLUSTER === 'mainnet'
          ? USDC_MINT.MAINNET
          : USDC_MINT.DEVNET,
    });

    const termsHash = generateTermsHash(offer);

    // Create negotiation
    const negotiation = await prisma.negotiation.create({
      data: {
        matchId: match.id,
        proposerId,
        strike: validated.strike,
        notional: validated.notional,
        expiry: new Date(validated.expiry),
        termsHash,
        message: validated.message,
      },
    });

    // Update match state
    await prisma.match.update({
      where: { id: match.id },
      data: {
        state: 'COUNTERING',
        strike: validated.strike,
        notional: validated.notional,
        expiry: new Date(validated.expiry),
        bestTermsHash: termsHash,
      },
    });

    await createAuditLog({
      entityType: 'Match',
      entityId: match.id,
      action: 'COUNTER',
      userId: proposerId,
    });

    const response = {
      negotiation,
      termsHash,
    };

    // Store idempotency result
    if (validated.idempotencyKey) {
      await storeIdempotency(validated.idempotencyKey, proposerId, response);
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating counter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

