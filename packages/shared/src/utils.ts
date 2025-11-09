import * as crypto from 'crypto';

/**
 * Verify HMAC signature for server-to-server auth
 */
export function verifyHMAC(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): boolean {
  const maxAge = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  const requestTime = parseInt(timestamp, 10);

  if (now - requestTime > maxAge) {
    return false; // Request too old
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(
  payload: string,
  secret: string,
  timestamp: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
}

/**
 * Check if order is expired
 */
export function isOrderExpired(expiry: string): boolean {
  return new Date(expiry) < new Date();
}

/**
 * Format Solana address for display
 */
export function formatAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

