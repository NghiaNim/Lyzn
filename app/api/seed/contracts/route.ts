import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * POST /api/seed/contracts
 * Seeds fake contracts into Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Create fake contracts - commodities with PAST expiry dates for settlement testing
    const fakeContracts = [
      {
        id: 'contract-sugar-1',
        underlying: 'sugar',
        direction: 'LONG',
        strike_min: 0.50,
        strike_max: 0.58,
        strike: 0.55,
        notional: 5000,
        expiry: new Date('2025-05-31').toISOString(),
        status: 'OPEN',
        party_a: '8Z9d7Ge4YqPQ5FrXc3LHhATLJkB8RxNq4xGh7JWZ6XaP',
        party_b: '9Y8c6Fd3XpMN4ErSQb2KGhZSIJkA7RyNm3xFg6JVY5Zm',
        created_at: new Date('2025-01-15').toISOString(),
      },
      {
        id: 'contract-wheat-1',
        underlying: 'wheat',
        direction: 'LONG',
        strike_min: 7.50,
        strike_max: 8.50,
        strike: 8.00,
        notional: 7500,
        expiry: new Date('2025-06-30').toISOString(),
        status: 'OPEN',
        party_a: '7X5b3Ca2VmLK3DqNYa1HFdRGHjI9SxMl2wEe5IUX4Yl',
        party_b: '6W4a2Bb1UlJI2CpMXz0GEcQFGiH8RwLk1vDd4HTW3Xk',
        created_at: new Date('2025-02-01').toISOString(),
      },
      {
        id: 'contract-coffee-1',
        underlying: 'coffee',
        direction: 'SHORT',
        strike_min: 2.10,
        strike_max: 2.40,
        strike: 2.25,
        notional: 4000,
        expiry: new Date('2025-08-15').toISOString(),
        status: 'OPEN',
        party_a: '5V3z1Aa0TkHG1BnLWy9FDbPEFhG7QvJj0uCc3GSV2Wj',
        party_b: '8Z9d7Ge4YqPQ5FrXc3LHhATLJkB8RxNq4xGh7JWZ6XaP',
        created_at: new Date('2025-03-10').toISOString(),
      },
      {
        id: 'contract-oil-1',
        underlying: 'oil',
        direction: 'LONG',
        strike_min: 85,
        strike_max: 95,
        strike: 90,
        notional: 10000,
        expiry: new Date('2025-09-30').toISOString(),
        status: 'OPEN',
        party_a: '9Y8c6Fd3XpMN4ErSQb2KGhZSIJkA7RyNm3xFg6JVY5Zm',
        party_b: '7X5b3Ca2VmLK3DqNYa1HFdRGHjI9SxMl2wEe5IUX4Yl',
        created_at: new Date('2025-04-20').toISOString(),
      },
      {
        id: 'contract-corn-1',
        underlying: 'corn',
        direction: 'SHORT',
        strike_min: 4.20,
        strike_max: 4.80,
        strike: 4.50,
        notional: 6000,
        expiry: new Date('2025-07-31').toISOString(),
        status: 'OPEN',
        party_a: '6W4a2Bb1UlJI2CpMXz0GEcQFGiH8RwLk1vDd4HTW3Xk',
        party_b: '5V3z1Aa0TkHG1BnLWy9FDbPEFhG7QvJj0uCc3GSV2Wj',
        created_at: new Date('2025-03-01').toISOString(),
      },
      {
        id: 'contract-soybeans-1',
        underlying: 'soybeans',
        direction: 'LONG',
        strike_min: 13.00,
        strike_max: 14.50,
        strike: 13.75,
        notional: 8500,
        expiry: new Date('2025-08-31').toISOString(),
        status: 'OPEN',
        party_a: '8Z9d7Ge4YqPQ5FrXc3LHhATLJkB8RxNq4xGh7JWZ6XaP',
        party_b: '6W4a2Bb1UlJI2CpMXz0GEcQFGiH8RwLk1vDd4HTW3Xk',
        created_at: new Date('2025-02-15').toISOString(),
      },
      {
        id: 'contract-cotton-1',
        underlying: 'cotton',
        direction: 'LONG',
        strike_min: 0.75,
        strike_max: 0.85,
        strike: 0.80,
        notional: 5500,
        expiry: new Date('2025-09-15').toISOString(),
        status: 'OPEN',
        party_a: '7X5b3Ca2VmLK3DqNYa1HFdRGHjI9SxMl2wEe5IUX4Yl',
        party_b: '9Y8c6Fd3XpMN4ErSQb2KGhZSIJkA7RyNm3xFg6JVY5Zm',
        created_at: new Date('2025-04-01').toISOString(),
      },
    ];

    // Insert contracts into Supabase
    const { data, error } = await supabase
      .from('contracts')
      .upsert(fakeContracts, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to seed contracts', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Seeded ${data?.length || 0} commodity contracts (all expired for settlement testing)`);

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || 0} contracts`,
      contracts: data,
    });
  } catch (error) {
    console.error('Error seeding contracts:', error);
    return NextResponse.json(
      { error: 'Failed to seed contracts', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seed/contracts
 * Deletes all contracts (for testing)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('contracts')
      .delete()
      .neq('id', ''); // Delete all

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete contracts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All contracts deleted',
    });
  } catch (error) {
    console.error('Error deleting contracts:', error);
    return NextResponse.json(
      { error: 'Failed to delete contracts' },
      { status: 500 }
    );
  }
}

