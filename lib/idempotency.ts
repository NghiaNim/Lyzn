import { prisma } from './prisma';

/**
 * Check if an idempotency key has been used
 * Returns the existing result if found, null otherwise
 */
export async function checkIdempotency(
  key: string,
  userId: string
): Promise<any | null> {
  const existing = await prisma.idempotencyKey.findUnique({
    where: {
      key_userId: {
        key,
        userId,
      },
    },
  });

  if (existing) {
    return existing.result ? JSON.parse(existing.result) : null;
  }

  return null;
}

/**
 * Store idempotency key result
 */
export async function storeIdempotency(
  key: string,
  userId: string,
  result: any
): Promise<void> {
  await prisma.idempotencyKey.upsert({
    where: {
      key_userId: {
        key,
        userId,
      },
    },
    create: {
      key,
      userId,
      result: JSON.stringify(result),
      createdAt: new Date(),
    },
    update: {
      result: JSON.stringify(result),
    },
  });
}


