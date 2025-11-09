import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHMAC } from '@/lib/shared/utils';

/**
 * GET /api/contracts/due
 * Returns contracts that are due for settlement (expired and in LIVE state)
 * Called by chain-adapter scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify HMAC (server-to-server)
    const timestamp = request.headers.get('X-Timestamp');
    const signature = request.headers.get('X-Signature');
    const hmacSecret = process.env.CHAIN_ADAPTER_HMAC_SECRET || '';

    if (!timestamp || !signature) {
      return NextResponse.json(
        { error: 'Missing HMAC headers' },
        { status: 401 }
      );
    }

    const isValid = verifyHMAC('', signature, hmacSecret, timestamp);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid HMAC signature' },
        { status: 401 }
      );
    }

    // Find contracts that are expired and in LIVE state
    const now = new Date();
    const contracts = await prisma.contract.findMany({
      where: {
        state: 'LIVE',
        match: {
          // Contract is expired if match expiry has passed
          // We need to check the match's bestTermsHash to get expiry
          // For now, we'll use a simpler approach - check if contract was created more than X days ago
          // In production, you'd want to store expiry in the Contract model
        },
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

    // Filter contracts that are actually expired
    // TODO: Store expiry in Contract model or derive from match
    const dueContracts = contracts
      .filter((contract: any) => {
        // For now, we'll need to get expiry from the match's negotiations
        // This is a simplified version - in production, store expiry in Contract
        return true; // Placeholder
      })
      .map((contract: any) => ({
        id: contract.id,
        contractPda: contract.contractPda,
        escrowPda: contract.escrowPda,
        oracleFeed: contract.oracleFeed,
        underlying: contract.match.orderA.underlying,
      }));

    return NextResponse.json({ contracts: dueContracts });
  } catch (error) {
    console.error('Error fetching due contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

