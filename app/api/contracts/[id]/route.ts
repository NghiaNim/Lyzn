import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServer();

    // Fetch contract from Supabase
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !contract) {
      console.error('Contract not found:', error);
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Transform to expected format for frontend
    const strikePrice = ((contract.strike_min + contract.strike_max) / 2).toFixed(2);
    const expiryDate = new Date(contract.expiry).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });

    const categories: Record<string, string> = {
      'sugar': 'Commodities',
      'wheat': 'Commodities',
      'coffee': 'Commodities',
      'corn': 'Commodities',
      'soybeans': 'Commodities',
      'cotton': 'Commodities',
      'oil': 'Energy',
      'eur': 'Currency',
      'btc': 'Crypto',
      'eth': 'Crypto',
      'sol': 'Crypto',
    };

    const transformed = {
      id: contract.id,
      title: `Will ${contract.underlying.toLowerCase()} exceed $${strikePrice} by ${expiryDate}?`,
      category: categories[contract.underlying] || 'Commodities',
      counterparty: contract.party_a?.slice(0, 8) || 'Unknown',
      location: 'Online',
      position: contract.direction === 'LONG' ? 'YES' : 'NO',
      contracts: 100,
      avgPrice: 0.45,
      cost: Math.round(contract.notional * 0.1),
      payout: contract.notional,
      expiry: expiryDate,
      oracle: 'Pyth Network',
      currentPrice: parseFloat(strikePrice) * 0.95,
      strikePrice: parseFloat(strikePrice),
      description: `This contract protects against ${contract.underlying} price ${contract.direction === 'LONG' ? 'increases' : 'decreases'}. If ${contract.underlying} ${contract.direction === 'LONG' ? 'exceeds' : 'falls below'} $${strikePrice} by ${expiryDate}, ${contract.direction === 'LONG' ? 'YES' : 'NO'} holders receive $${contract.notional.toLocaleString()} per contract.`,
    };

    return NextResponse.json({ contract: transformed });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
