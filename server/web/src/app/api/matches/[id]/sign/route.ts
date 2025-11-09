import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';
import { checkIdempotency, storeIdempotency } from '@/lib/idempotency';
import { rateLimitMiddleware } from '@/middleware/rate-limit';

const SignSchema = z.object({
  termsHash: z.string(),
  pubkey: z.string(),
  signature: z.string(),
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
    const validated = SignSchema.parse(body);
    const userId = (session.user as any).id;

    // Check idempotency
    if (validated.idempotencyKey) {
      const existing = await checkIdempotency(validated.idempotencyKey, userId);
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    // Rate limiting
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      userId,
      `/api/matches/${params.id}/sign`
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        orderA: true,
        orderB: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify user is a party to the match
    if (match.orderA.userId !== userId && match.orderB.userId !== userId) {
      return NextResponse.json(
        { error: 'You are not a party to this match' },
        { status: 403 }
      );
    }

    // Check if signature already exists
    const existing = await prisma.negotiationSignature.findUnique({
      where: {
        termsHash_userId: {
          termsHash: validated.termsHash,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Signature already exists',
        signature: existing,
      });
    }

    // Create signature
    const signature = await prisma.negotiationSignature.create({
      data: {
        termsHash: validated.termsHash,
        userId,
        pubkey: validated.pubkey,
        signature: validated.signature,
      },
    });

    // Check if both parties have signed the same terms hash
    const signatures = await prisma.negotiationSignature.findMany({
      where: { termsHash: validated.termsHash },
    });

    const partyAId = match.orderA.userId;
    const partyBId = match.orderB.userId;

    const hasPartyASignature = signatures.some((s) => s.userId === partyAId);
    const hasPartyBSignature = signatures.some((s) => s.userId === partyBId);

    if (hasPartyASignature && hasPartyBSignature) {
      // Both parties have signed - update match to AGREED
      await prisma.match.update({
        where: { id: match.id },
        data: {
          state: 'AGREED',
          bestTermsHash: validated.termsHash,
        },
      });

      // Update order statuses
      await prisma.order.updateMany({
        where: {
          id: { in: [match.orderAId, match.orderBId] },
        },
        data: {
          status: 'AGREED',
        },
      });
    }

    await createAuditLog({
      entityType: 'Match',
      entityId: match.id,
      action: 'SIGN',
      userId,
    });

    const response = {
      signature,
      bothSigned: hasPartyASignature && hasPartyBSignature,
    };

    // Store idempotency result
    if (validated.idempotencyKey) {
      await storeIdempotency(validated.idempotencyKey, userId, response);
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error signing terms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

