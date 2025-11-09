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

    const match = await prisma.match.findUnique({
      where: { id: params.id },
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
            signatures: {
              include: {
                // Note: userId is stored, but we'd need a User relation if we want full user data
              },
            },
          },
        },
        contract: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

