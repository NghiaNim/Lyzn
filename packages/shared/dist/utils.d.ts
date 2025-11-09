/**
 * Verify HMAC signature for server-to-server auth
 */
export declare function verifyHMAC(payload: string, signature: string, secret: string, timestamp: string): boolean;
/**
 * Generate HMAC signature
 */
export declare function generateHMAC(payload: string, secret: string, timestamp: string): string;
/**
 * Check if order is expired
 */
export declare function isOrderExpired(expiry: string): boolean;
/**
 * Format Solana address for display
 */
export declare function formatAddress(address: string, chars?: number): string;
