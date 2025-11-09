import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Rate limit middleware
 * Use with: export const config = { matcher: '/api/matches/:path*/counter' }
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  userId: string,
  endpoint: string
): Promise<Response | null> {
  const result = await checkRateLimit(userId, endpoint, {
    maxRequests: 10, // 10 requests
    windowMs: 60 * 1000, // per minute
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        remaining: result.remaining,
        resetAt: result.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetAt.getTime().toString(),
          'Retry-After': Math.ceil(
            (result.resetAt.getTime() - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  return null; // Continue
}

