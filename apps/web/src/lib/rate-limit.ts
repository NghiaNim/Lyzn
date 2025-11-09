import { prisma } from './prisma';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Check rate limit for a user
 * Returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Count requests in the current window
  const count = await prisma.rateLimit.count({
    where: {
      userId,
      endpoint,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  const remaining = Math.max(0, config.maxRequests - count);
  const allowed = count < config.maxRequests;
  const resetAt = new Date(now.getTime() + config.windowMs);

  if (allowed) {
    // Record this request
    await prisma.rateLimit.create({
      data: {
        userId,
        endpoint,
        createdAt: now,
      },
    });
  }

  return { allowed, remaining, resetAt };
}

/**
 * Clean up old rate limit records (should be run periodically)
 */
export async function cleanupRateLimits(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  await prisma.rateLimit.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });
}

