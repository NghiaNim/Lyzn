'use client'

import Navigation from '@/components/Navigation'
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { useContracts } from '@/contexts/ContractContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PurchasedPosition {
  id: string
  title: string
  position: 'YES' | 'NO'
  cost: number
  payout: number
  expiry: string
  purchasedAt: string
  counterparty: string
}

export default function DashboardPage() {
  const { contracts } = useContracts()
  const [positions, setPositions] = useState<PurchasedPosition[]>([])

  useEffect(() => {
    // Load purchased positions from localStorage
    const stored = localStorage.getItem('purchasedPositions')
    if (stored) {
      setPositions(JSON.parse(stored))
    }
  }, [])

  const totalInvested = positions.reduce((sum, p) => sum + p.cost, 0)
  const totalPotentialPayout = positions.reduce((sum, p) => sum + p.payout, 0)
  const potentialProfit = totalPotentialPayout - totalInvested

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/building-bg.jpg)'
          }}
        />
        <div className="absolute inset-0 bg-slate-950/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/40"></div>
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative pt-24 pb-12 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Monitor your active positions and hedges</p>
          </div>

          {positions.length === 0 ? (
            <div className="card text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">No Active Positions</h2>
                <p className="text-gray-400 mb-6">
                  You haven&apos;t purchased any contracts yet. Browse the marketplace to find hedging opportunities.
                </p>
                <Link href="/marketplace" className="btn-primary inline-block">
                  Browse Marketplace
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Portfolio Overview */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
                  <p className="text-sm text-gray-400 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{positions.length} position{positions.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
                  <p className="text-sm text-gray-400 mb-1">Potential Payout</p>
                  <p className="text-2xl font-bold text-green-400">${totalPotentialPayout.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">If all conditions met</p>
                </div>
                <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
                  <p className="text-sm text-gray-400 mb-1">Potential Profit</p>
                  <p className="text-2xl font-bold text-green-400">+${potentialProfit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{((potentialProfit / totalInvested) * 100).toFixed(0)}% ROI</p>
                </div>
              </div>

              {/* Active Positions */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Active Positions</h2>
                <div className="space-y-4">
                  {positions.map((position) => {
                    const profit = position.payout - position.cost
                    const roi = ((profit / position.cost) * 100).toFixed(0)
                    
                    return (
                      <div key={position.id + position.purchasedAt} className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-blue-500 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <span className={`px-2 py-1 rounded ${
                                position.position === 'YES' 
                                  ? 'bg-green-600/20 text-green-400' 
                                  : 'bg-red-600/20 text-red-400'
                              }`}>
                                {position.position}
                              </span>
                              <span className="text-gray-400">·</span>
                              <span className="text-gray-400">{position.counterparty}</span>
                              <span className="text-gray-400">·</span>
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Expires {position.expiry}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                              Active
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 py-3 border-y border-gray-700">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Your Cost</p>
                            <p className="font-semibold">${position.cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Potential Payout</p>
                            <p className="font-semibold text-green-400">${position.payout.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Potential Profit</p>
                            <p className="font-semibold text-green-400">+${profit.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">ROI if Won</p>
                            <p className="font-semibold text-green-400">{roi}%</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-blue-600/10 border border-blue-500/30 p-3 rounded-lg">
                          <p className="text-sm text-blue-100">
                            <strong>Status:</strong> Contract deployed and active. Funds locked in escrow. 
                            Automatic settlement on expiry date.
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="card bg-slate-900/40 backdrop-blur-sm border-slate-800">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3">Want More Protection?</h3>
                  <p className="text-gray-300 mb-4">
                    Explore more contracts to hedge additional risks in your business.
                  </p>
                  <Link href="/marketplace" className="btn-primary inline-block">
                    Browse Marketplace
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
