import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';
import { checkIdempotency, storeIdempotency } from '@/lib/idempotency';
import { checkNotionalLimit } from '@/lib/notional-limits';

const CreateOrderSchema = z.object({
  underlying: z.string(),
  direction: z.enum(['LONG', 'SHORT']),
  strikeMin: z.number().positive(),
  strikeMax: z.number().positive(),
  notional: z.number().positive(),
  expiry: z.string().datetime(),
  tolDays: z.number().int().positive().default(7),
  idempotencyKey: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const underlying = searchParams.get('underlying');
    const direction = searchParams.get('direction') as 'LONG' | 'SHORT' | null;
    const expiryFrom = searchParams.get('expiryFrom');
    const expiryTo = searchParams.get('expiryTo');
    const status = searchParams.get('status');

    const where: any = {
      status: status || 'OPEN',
    };

    if (underlying) {
      where.underlying = underlying;
    }

    if (direction) {
      where.direction = direction;
    }

    if (expiryFrom || expiryTo) {
      where.expiry = {};
      if (expiryFrom) {
        where.expiry.gte = new Date(expiryFrom);
      }
      if (expiryTo) {
        where.expiry.lte = new Date(expiryTo);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            wallet: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateOrderSchema.parse(body);
    const userId = (session.user as any).id;

    // Check idempotency
    if (validated.idempotencyKey) {
      const existing = await checkIdempotency(validated.idempotencyKey, userId);
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    // Validate strike range
    if (validated.strikeMin >= validated.strikeMax) {
      return NextResponse.json(
        { error: 'strikeMin must be less than strikeMax' },
        { status: 400 }
      );
    }

    // Check notional limit
    const notionalCheck = await checkNotionalLimit(userId, validated.notional);
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

    const order = await prisma.order.create({
      data: {
        userId,
        underlying: validated.underlying,
        direction: validated.direction,
        strikeMin: validated.strikeMin,
        strikeMax: validated.strikeMax,
        notional: validated.notional,
        expiry: new Date(validated.expiry),
        tolDays: validated.tolDays,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            wallet: true,
          },
        },
      },
    });

    await createAuditLog({
      entityType: 'Order',
      entityId: order.id,
      action: 'CREATE',
      userId,
    });

    const response = { order };

    // Store idempotency result
    if (validated.idempotencyKey) {
      await storeIdempotency(validated.idempotencyKey, userId, response);
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
