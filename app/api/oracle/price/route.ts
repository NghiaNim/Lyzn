import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getPythFeedId, PYTH_PROGRAM_ID } from '@/lib/shared/constants';

/**
 * GET /api/oracle/price?feed=BTC_USD
 * Fetches REAL price from Pyth oracle on Solana
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const feed = searchParams.get('feed') as 'BTC_USD' | 'ETH_USD' | 'SOL_USD';
    
    if (!feed) {
      return NextResponse.json(
        { error: 'Feed parameter required (BTC_USD, ETH_USD, or SOL_USD)' },
        { status: 400 }
      );
    }

    // Connect to Solana
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    console.log(`Connecting to Solana: ${rpcUrl}`);
    console.log(`Fetching ${feed} price from Pyth oracle...`);

    // Get Pyth price feed ID
    const feedId = getPythFeedId(feed);
    
    try {
      // Fetch from real Pyth oracle
      // Note: Pyth price accounts are derived from feedId
      // For production, you'd use @pythnetwork/pyth-solana-receiver SDK
      // For now, we'll use a simplified approach
      
      // Pyth mainnet price account addresses (these are the actual accounts)
      const priceAccounts: Record<string, string> = {
        BTC_USD: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU', // BTC/USD
        ETH_USD: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB', // ETH/USD  
        SOL_USD: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG', // SOL/USD
      };

      const priceAccountPubkey = new PublicKey(priceAccounts[feed]);
      const accountInfo = await connection.getAccountInfo(priceAccountPubkey);

      if (!accountInfo) {
        throw new Error('Price account not found');
      }

      // Parse Pyth price data
      // Pyth price format: https://docs.pyth.network/documentation/solana-price-feeds
      const data = accountInfo.data;
      
      // Simple parsing (in production, use @pythnetwork/client)
      // Price is at offset 208-216 (int64)
      // Confidence is at offset 216-224 (uint64)
      // Expo is at offset 20-24 (int32)
      // PublishTime is at offset 224-232 (int64)
      
      const price = data.readBigInt64LE(208);
      const confidence = data.readBigUInt64LE(216);
      const expo = data.readInt32LE(20);
      const publishTime = Number(data.readBigInt64LE(224));

      // Convert to human-readable price
      const priceFloat = Number(price) * Math.pow(10, expo);
      const confidenceFloat = Number(confidence) * Math.pow(10, expo);

      console.log(`✅ Got real price from Solana: ${priceFloat}`);

      return NextResponse.json({
        feed,
        feedId,
        priceAccount: priceAccountPubkey.toString(),
        price: priceFloat,
        confidence: confidenceFloat,
        expo,
        publishTime,
        timestamp: new Date().toISOString(),
        source: 'Pyth Network (Solana Mainnet)',
      });

    } catch (error) {
      console.warn('Failed to fetch from Pyth, using fallback prices:', error);
      
      // Fallback to mock prices if Pyth fetch fails
      const mockPrices = {
        BTC_USD: { price: 68234.50, confidence: 45.2, expo: -2 },
        ETH_USD: { price: 3456.78, confidence: 2.1, expo: -2 },
        SOL_USD: { price: 156.89, confidence: 0.8, expo: -2 },
      };

      const priceData = mockPrices[feed];

      return NextResponse.json({
        feed,
        feedId,
        price: priceData.price,
        confidence: priceData.confidence,
        expo: priceData.expo,
        publishTime: Date.now(),
        timestamp: new Date().toISOString(),
        source: 'Mock Data (Pyth unavailable)',
      });
    }
  } catch (error) {
    console.error('Error fetching oracle price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oracle price' },
      { status: 500 }
    );
  }
}

