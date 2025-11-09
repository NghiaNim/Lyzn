import { prisma } from './prisma';

export interface NotionalLimitConfig {
  maxNotionalPerDay: number; // in USDC (6 decimals)
}

const DEFAULT_CONFIG: NotionalLimitConfig = {
  maxNotionalPerDay: 100000 * 1e6, // 100,000 USDC per day
};

/**
 * Check if user has exceeded daily notional limit
 * Returns { allowed: boolean, used: number, limit: number, remaining: number }
 */
export async function checkNotionalLimit(
  userId: string,
  requestedNotional: number,
  config: NotionalLimitConfig = DEFAULT_CONFIG
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Sum all notional from orders created today
  const orders = await prisma.order.findMany({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    select: {
      notional: true,
    },
  });

  const used = orders.reduce((sum: number, order: any) => {
    return sum + Number(order.notional);
  }, 0);

  const limit = config.maxNotionalPerDay;
  const remaining = Math.max(0, limit - used);
  const allowed = used + requestedNotional <= limit;

  return { allowed, used, limit, remaining };
}

