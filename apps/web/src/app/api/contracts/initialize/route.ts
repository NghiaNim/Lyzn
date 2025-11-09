import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateHMAC } from '@lyzn/shared';
import { createAuditLog } from '@/lib/audit';

const InitializeSchema = z.object({
  matchId: z.string(),
  programId: z.string(),
  contractPda: z.string(),
  escrowPda: z.string(),
  oracleFeed: z.string(),
  usdcMint: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = InitializeSchema.parse(body);
    const userId = (session.user as any).id;

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: validated.matchId },
      include: {
        orderA: true,
        orderB: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify match is in AGREED state
    if (match.state !== 'AGREED') {
      return NextResponse.json(
        { error: 'Match must be in AGREED state' },
        { status: 400 }
      );
    }

    // Verify both parties have signed the same terms hash
    if (!match.bestTermsHash) {
      return NextResponse.json(
        { error: 'No agreed terms hash found' },
        { status: 400 }
      );
    }

    const signatures = await prisma.negotiationSignature.findMany({
      where: { termsHash: match.bestTermsHash },
    });

    const partyAId = match.orderA.userId;
    const partyBId = match.orderB.userId;

    const hasPartyASignature = signatures.some((s) => s.userId === partyAId);
    const hasPartyBSignature = signatures.some((s) => s.userId === partyBId);

    if (!hasPartyASignature || !hasPartyBSignature) {
      return NextResponse.json(
        { error: 'Both parties must sign before initializing contract' },
        { status: 400 }
      );
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        matchId: validated.matchId,
        programId: validated.programId,
        contractPda: validated.contractPda,
        escrowPda: validated.escrowPda,
        oracleFeed: validated.oracleFeed,
        usdcMint: validated.usdcMint,
        state: 'INIT',
      },
      include: {
        match: {
          include: {
            orderA: true,
            orderB: true,
          },
        },
      },
    });

    // Update match state
    await prisma.match.update({
      where: { id: validated.matchId },
      data: {
        state: 'AGREED', // Keep as AGREED until on-chain init completes
      },
    });

    // Update order statuses
    await prisma.order.updateMany({
      where: {
        id: { in: [match.orderAId, match.orderBId] },
      },
      data: {
        status: 'ONCHAIN_INIT',
      },
    });

    // Call chain-adapter to initialize on-chain
    const chainAdapterUrl = process.env.CHAIN_ADAPTER_URL || 'http://localhost:8080';
    const hmacSecret = process.env.CHAIN_ADAPTER_HMAC_SECRET || '';

    const payload = JSON.stringify({
      matchId: validated.matchId,
      programId: validated.programId,
      contractPda: validated.contractPda,
      escrowPda: validated.escrowPda,
      oracleFeed: validated.oracleFeed,
      usdcMint: validated.usdcMint,
      termsHash: match.bestTermsHash,
    });

    const timestamp = Date.now().toString();
    const signature = generateHMAC(payload, hmacSecret, timestamp);

    try {
      const response = await fetch(`${chainAdapterUrl}/api/v1/contracts/${contract.id}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: payload,
      });

      if (!response.ok) {
        console.error('Chain adapter error:', await response.text());
      }
    } catch (error) {
      console.error('Error calling chain adapter:', error);
      // Continue anyway - the contract is created, chain adapter will retry
    }

    await createAuditLog({
      entityType: 'Contract',
      entityId: contract.id,
      action: 'INITIALIZE',
      userId,
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error initializing contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

