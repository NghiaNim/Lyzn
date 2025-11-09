import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/settle-expired
 * Cron job endpoint to automatically settle expired contracts
 * Call this periodically (e.g., every 5 minutes) using:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service (cron-job.org)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock active contracts
    // In production, these would come from your smart contract or database
    const activeContracts = [
      {
        id: 'contract-1',
        underlying: 'BTC',
        strike: 65000,
        expiry: new Date('2025-11-01'),
        partyA: 'wallet-a',
        partyB: 'wallet-b',
        notional: 10000,
      },
      {
        id: 'contract-2',
        underlying: 'ETH',
        strike: 3200,
        expiry: new Date('2025-11-05'),
        partyA: 'wallet-c',
        partyB: 'wallet-d',
        notional: 5000,
      },
    ];

    const now = new Date();
    const expiredContracts = activeContracts.filter(
      (contract) => new Date(contract.expiry) < now
    );

    console.log(`Found ${expiredContracts.length} expired contracts to settle`);

    // Settle each expired contract
    const settlements = [];
    for (const contract of expiredContracts) {
      try {
        const settleResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contracts/settle`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contract),
          }
        );

        if (settleResponse.ok) {
          const result = await settleResponse.json();
          settlements.push({
            contractId: contract.id,
            status: 'settled',
            result,
          });
        } else {
          settlements.push({
            contractId: contract.id,
            status: 'failed',
            error: await settleResponse.text(),
          });
        }
      } catch (error) {
        settlements.push({
          contractId: contract.id,
          status: 'error',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      checked: activeContracts.length,
      expired: expiredContracts.length,
      settlements,
    });
  } catch (error) {
    console.error('Error in cron settlement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

