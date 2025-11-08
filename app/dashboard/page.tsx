'use client'

import Navigation from '@/components/Navigation'
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'

interface Position {
  id: string
  title: string
  position: 'YES' | 'NO'
  quantity: number
  invested: number
  currentValue: number
  payout: number
  expiry: string
  status: 'active' | 'expired' | 'settled'
  result?: 'won' | 'lost'
}

const positions: Position[] = [
  {
    id: '1',
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    position: 'YES',
    quantity: 1,
    invested: 454,
    currentValue: 485,
    payout: 1000,
    expiry: 'May 31, 2026',
    status: 'active'
  },
  {
    id: '2',
    title: 'Will wheat exceed $8/bushel by Jun 2026?',
    position: 'YES',
    quantity: 2,
    invested: 1050,
    currentValue: 1120,
    payout: 2000,
    expiry: 'Jun 30, 2026',
    status: 'active'
  },
  {
    id: '3',
    title: 'Will coffee exceed $2.30/lb by Dec 2025?',
    position: 'YES',
    quantity: 1,
    invested: 380,
    currentValue: 0,
    payout: 0,
    expiry: 'Dec 31, 2025',
    status: 'settled',
    result: 'lost'
  }
]

export default function DashboardPage() {
  const activePositions = positions.filter(p => p.status === 'active')
  const totalInvested = activePositions.reduce((sum, p) => sum + p.invested, 0)
  const totalCurrentValue = activePositions.reduce((sum, p) => sum + p.currentValue, 0)
  const totalPotentialPayout = activePositions.reduce((sum, p) => sum + p.payout, 0)
  const unrealizedGain = totalCurrentValue - totalInvested

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Monitor your active positions and hedges</p>
          </div>

          {/* Portfolio Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Invested</p>
              <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Current Value</p>
              <p className="text-2xl font-bold">${totalCurrentValue.toLocaleString()}</p>
              <p className={`text-sm mt-1 ${unrealizedGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedGain >= 0 ? '+' : ''}{unrealizedGain.toLocaleString()} 
                ({((unrealizedGain / totalInvested) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Potential Payout</p>
              <p className="text-2xl font-bold text-green-400">${totalPotentialPayout.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">If all conditions met</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Active Positions</p>
              <p className="text-2xl font-bold">{activePositions.length}</p>
            </div>
          </div>

          {/* Active Positions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Positions</h2>
            <div className="space-y-4">
              {activePositions.map((position) => (
                <div key={position.id} className="card hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          position.position === 'YES' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {position.position}
                        </span>
                        <span className="text-gray-400">×{position.quantity}</span>
                        <span className="text-gray-400">·</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Expires {position.expiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 py-3 border-y border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Invested</p>
                      <p className="font-semibold">${position.invested}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Current Value</p>
                      <p className="font-semibold">${position.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Unrealized P/L</p>
                      <p className={`font-semibold ${
                        position.currentValue - position.invested >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.currentValue - position.invested >= 0 ? '+' : ''}
                        ${position.currentValue - position.invested}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Potential Payout</p>
                      <p className="font-semibold text-green-400">${position.payout}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ROI if Won</p>
                      <p className="font-semibold text-green-400">
                        {(((position.payout - position.invested) / position.invested) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="btn-secondary text-sm">
                      View Details
                    </button>
                    <button className="btn-secondary text-sm">
                      Sell Position
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Settlement History</h2>
            <div className="space-y-4">
              {positions.filter(p => p.status === 'settled').map((position) => (
                <div key={position.id} className="card opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{position.title}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          position.result === 'won'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {position.result === 'won' ? '✓ Won' : '✗ Lost'}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-400">Settled {position.expiry}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Result</p>
                      <p className={`text-xl font-bold ${
                        position.result === 'won' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.result === 'won' ? `+$${position.payout}` : `-$${position.invested}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

