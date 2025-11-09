import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';

const CreateMatchSchema = z.object({
  orderAId: z.string(),
  orderBId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateMatchSchema.parse(body);
    const userId = (session.user as any).id;

    // Get both orders
    const [orderA, orderB] = await Promise.all([
      prisma.order.findUnique({ where: { id: validated.orderAId } }),
      prisma.order.findUnique({ where: { id: validated.orderBId } }),
    ]);

    if (!orderA || !orderB) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify orders are compatible
    if (orderA.underlying !== orderB.underlying) {
      return NextResponse.json(
        { error: 'Orders must have same underlying' },
        { status: 400 }
      );
    }

    if (orderA.direction === orderB.direction) {
      return NextResponse.json(
        { error: 'Orders must have opposite directions' },
        { status: 400 }
      );
    }

    // Check if match already exists
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { orderAId: validated.orderAId, orderBId: validated.orderBId },
          { orderAId: validated.orderBId, orderBId: validated.orderAId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ match: existing });
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        orderAId: validated.orderAId,
        orderBId: validated.orderBId,
        state: 'MATCHED',
      },
      include: {
        orderA: {
          include: {
            user: {
              select: {
                id: true,
                wallet: true,
              },
            },
          },
        },
        orderB: {
          include: {
            user: {
              select: {
                id: true,
                wallet: true,
              },
            },
          },
        },
      },
    });

    // Update order statuses
    await prisma.order.updateMany({
      where: {
        id: { in: [validated.orderAId, validated.orderBId] },
      },
      data: {
        status: 'MATCHED',
      },
    });

    await createAuditLog({
      entityType: 'Match',
      entityId: match.id,
      action: 'CREATE',
      userId,
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

