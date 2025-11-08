import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        match: {
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
            negotiations: {
              orderBy: { createdAt: 'desc' },
              include: {
                signatures: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Verify user is a party to the contract (via match)
    const isParty =
      contract.match.orderA.userId === userId ||
      contract.match.orderB.userId === userId;

    if (!isParty) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
