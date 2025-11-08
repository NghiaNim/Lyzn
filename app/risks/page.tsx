'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { TrendingUp, Wheat, Fuel } from 'lucide-react'

interface Contract {
  id: string
  title: string
  counterparty: string
  location: string
  position: 'YES' | 'NO'
  contracts: number
  avgPrice: number
  cost: number
  payout: number
  expiry: string
}

const sugarContracts: Contract[] = [
  {
    id: 'sugar-1',
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    counterparty: 'Sugar Refinery',
    location: 'Louisiana',
    position: 'YES',
    contracts: 100,
    avgPrice: 0.45,
    cost: 450,
    payout: 1000,
    expiry: 'May 2026'
  },
  {
    id: 'sugar-2',
    title: 'Will sugar exceed $0.60/lb by Aug 2026?',
    counterparty: 'Candy Manufacturer',
    location: 'Ohio',
    position: 'YES',
    contracts: 50,
    avgPrice: 0.32,
    cost: 320,
    payout: 1000,
    expiry: 'Aug 2026'
  }
]

const wheatContracts: Contract[] = [
  {
    id: 'wheat-1',
    title: 'Will wheat exceed $8/bushel by Jun 2026?',
    counterparty: 'Wheat Farmer',
    location: 'Kansas',
    position: 'YES',
    contracts: 75,
    avgPrice: 0.52,
    cost: 520,
    payout: 1000,
    expiry: 'Jun 2026'
  }
]

export default function RisksPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Risk Profile</h1>
            <p className="text-gray-400">Based on your business, here are the risks we identified and available protection options</p>
          </div>

          {/* Risk #1: Sugar */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                🍬
              </div>
              <div>
                <h2 className="text-2xl font-bold">Risk #1: Sugar Prices Rising</h2>
                <p className="text-gray-400">High exposure - $2,000/month spend</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              {sugarContracts.map((contract) => (
                <div key={contract.id} className="card hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{contract.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <span className={`px-2 py-1 rounded ${contract.position === 'YES' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {contract.position}
                        </span>
                        <span>·</span>
                        <span>{contract.counterparty} ({contract.location})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4 py-3 border-y border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Contracts Available</p>
                      <p className="text-lg font-semibold">{contract.contracts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                      <p className="text-lg font-semibold">{(contract.avgPrice * 100).toFixed(0)}¢</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Your Cost</p>
                      <p className="text-lg font-semibold text-red-400">${contract.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Payout if Right</p>
                      <p className="text-lg font-semibold text-green-400">${contract.payout.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/contract/${contract.id}`} className="btn-primary flex-1 text-center">
                      Buy Now
                    </Link>
                    <button className="btn-secondary">
                      Negotiate Terms
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/create?risk=sugar" className="block card border-dashed border-2 hover:border-blue-500 transition-colors text-center">
              <p className="text-lg font-semibold text-blue-400">+ Create Your Own Sugar Contract</p>
              <p className="text-sm text-gray-400 mt-1">Custom terms tailored to your needs</p>
            </Link>
          </div>

          {/* Risk #2: Wheat */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <Wheat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Risk #2: Wheat Flour Prices Rising</h2>
                <p className="text-gray-400">Medium exposure - $1,500/month spend</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              {wheatContracts.map((contract) => (
                <div key={contract.id} className="card hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{contract.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <span className={`px-2 py-1 rounded ${contract.position === 'YES' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {contract.position}
                        </span>
                        <span>·</span>
                        <span>{contract.counterparty} ({contract.location})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4 py-3 border-y border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Contracts Available</p>
                      <p className="text-lg font-semibold">{contract.contracts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                      <p className="text-lg font-semibold">{(contract.avgPrice * 100).toFixed(0)}¢</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Your Cost</p>
                      <p className="text-lg font-semibold text-red-400">${contract.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Payout if Right</p>
                      <p className="text-lg font-semibold text-green-400">${contract.payout.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/contract/${contract.id}`} className="btn-primary flex-1 text-center">
                      Buy Now
                    </Link>
                    <button className="btn-secondary">
                      Negotiate Terms
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/create?risk=wheat" className="block card border-dashed border-2 hover:border-blue-500 transition-colors text-center">
              <p className="text-lg font-semibold text-blue-400">+ Create Your Own Wheat Contract</p>
              <p className="text-sm text-gray-400 mt-1">Custom terms tailored to your needs</p>
            </Link>
          </div>

          {/* Risk #3: Diesel */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Fuel className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Risk #3: Diesel Fuel Costs</h2>
                <p className="text-gray-400">Low exposure - delivery operations</p>
              </div>
            </div>
            
            <div className="card bg-slate-700/50">
              <p className="text-gray-400 mb-4">No existing contracts found for diesel fuel hedging.</p>
              <Link href="/create?risk=diesel" className="btn-primary inline-block">
                + Create Your Own Diesel Contract
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="card bg-gradient-to-r from-blue-600 to-blue-800">
            <h3 className="text-xl font-semibold mb-3">💡 Recommended Action</h3>
            <p className="text-blue-100 mb-4">
              Based on your risk profile, we recommend hedging your sugar exposure first (highest risk). 
              The May 2026 contract at 45¢ offers good protection at a reasonable cost.
            </p>
            <p className="text-sm text-blue-200">
              <strong>Potential savings:</strong> If sugar prices spike 40% again, this $450 contract could save you $8,000+ in increased costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

