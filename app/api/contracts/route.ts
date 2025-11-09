import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');

    // Find contracts where user is a party (via match -> orderA or orderB)
    const contracts = await prisma.contract.findMany({
      where: {
        ...(state && { state }),
        match: {
          OR: [
            { orderA: { userId } },
            { orderB: { userId } },
          ],
        },
      },
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
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
