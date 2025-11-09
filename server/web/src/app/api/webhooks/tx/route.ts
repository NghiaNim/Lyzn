import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHMAC } from '@lyzn/shared';
import { z } from 'zod';

const WebhookSchema = z.object({
  contractId: z.string(),
  sig: z.string(),
  kind: z.enum(['INIT', 'FUND_A', 'FUND_B', 'SETTLE', 'CANCEL']),
  status: z.enum(['SENT', 'CONFIRMED', 'FAILED']),
  meta: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify HMAC
    const timestamp = request.headers.get('X-Timestamp');
    const signature = request.headers.get('X-Signature');
    const hmacSecret = process.env.CHAIN_ADAPTER_HMAC_SECRET || '';

    if (!timestamp || !signature) {
      return NextResponse.json(
        { error: 'Missing HMAC headers' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const isValid = verifyHMAC(body, signature, hmacSecret, timestamp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid HMAC signature' },
        { status: 401 }
      );
    }

    // Parse and validate payload
    const data = JSON.parse(body);
    const validated = WebhookSchema.parse(data);

    // Find or create transaction ledger entry
    const txLedger = await prisma.txLedger.upsert({
      where: { sig: validated.sig },
      update: {
        status: validated.status,
        meta: validated.meta || null,
      },
      create: {
        contractId: validated.contractId,
        sig: validated.sig,
        kind: validated.kind,
        status: validated.status,
        meta: validated.meta || null,
      },
    });

    // Update contract state based on transaction kind and status
    if (validated.status === 'CONFIRMED') {
      const contract = await prisma.contract.findUnique({
        where: { id: validated.contractId },
      });

      if (contract) {
        let newState = contract.state;

        switch (validated.kind) {
          case 'INIT':
            newState = 'INIT';
            break;
          case 'FUND_A':
            if (contract.state === 'INIT') {
              newState = 'PARTIALLY_FUNDED';
            }
            break;
          case 'FUND_B':
            if (contract.state === 'PARTIALLY_FUNDED') {
              newState = 'LIVE';
            }
            break;
          case 'SETTLE':
            newState = 'SETTLED';
            break;
          case 'CANCEL':
            newState = 'CANCELLED';
            break;
        }

        if (newState !== contract.state) {
          await prisma.contract.update({
            where: { id: validated.contractId },
            data: { state: newState },
          });
        }
      }
    }

    return NextResponse.json({ success: true, txLedger });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

