'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, TrendingUp } from 'lucide-react'

interface Contract {
  id: string
  title: string
  category: string
  counterparty: string
  location: string
  position: 'YES' | 'NO'
  contracts: number
  avgPrice: number
  cost: number
  payout: number
  expiry: string
  volume24h: number
}

const allContracts: Contract[] = [
  {
    id: 'sugar-1',
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    category: 'Commodities',
    counterparty: 'Sugar Refinery',
    location: 'Louisiana',
    position: 'YES',
    contracts: 100,
    avgPrice: 0.45,
    cost: 450,
    payout: 1000,
    expiry: 'May 2026',
    volume24h: 12500
  },
  {
    id: 'sugar-2',
    title: 'Will sugar exceed $0.60/lb by Aug 2026?',
    category: 'Commodities',
    counterparty: 'Candy Manufacturer',
    location: 'Ohio',
    position: 'YES',
    contracts: 50,
    avgPrice: 0.32,
    cost: 320,
    payout: 1000,
    expiry: 'Aug 2026',
    volume24h: 8200
  },
  {
    id: 'wheat-1',
    title: 'Will wheat exceed $8/bushel by Jun 2026?',
    category: 'Commodities',
    counterparty: 'Wheat Farmer',
    location: 'Kansas',
    position: 'YES',
    contracts: 75,
    avgPrice: 0.52,
    cost: 520,
    payout: 1000,
    expiry: 'Jun 2026',
    volume24h: 15600
  },
  {
    id: 'eur-1',
    title: 'Will EUR/USD exceed 1.15 by Dec 2025?',
    category: 'Currency',
    counterparty: 'EU Importer',
    location: 'Germany',
    position: 'NO',
    contracts: 200,
    avgPrice: 0.58,
    cost: 580,
    payout: 1000,
    expiry: 'Dec 2025',
    volume24h: 28400
  },
  {
    id: 'oil-1',
    title: 'Will oil exceed $90/barrel by Mar 2026?',
    category: 'Energy',
    counterparty: 'Construction Co.',
    location: 'Texas',
    position: 'YES',
    contracts: 150,
    avgPrice: 0.48,
    cost: 480,
    payout: 1000,
    expiry: 'Mar 2026',
    volume24h: 19800
  },
  {
    id: 'coffee-1',
    title: 'Will coffee exceed $2.50/lb by Jul 2026?',
    category: 'Commodities',
    counterparty: 'Coffee Roaster',
    location: 'Oregon',
    position: 'YES',
    contracts: 80,
    avgPrice: 0.41,
    cost: 410,
    payout: 1000,
    expiry: 'Jul 2026',
    volume24h: 11200
  }
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Commodities', 'Currency', 'Energy']

  const filteredContracts = allContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || contract.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Contract Marketplace</h1>
            <p className="text-gray-400">Browse and purchase event contracts from other businesses</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Contracts</p>
              <p className="text-2xl font-bold">{allContracts.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-2xl font-bold">
                ${(allContracts.reduce((sum, c) => sum + c.volume24h, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Active Users</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Avg Protection</p>
              <p className="text-2xl font-bold">$5,000</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="card mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contracts, commodities, or counterparties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contracts Grid */}
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="card hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{contract.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                            {contract.category}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            contract.position === 'YES' 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {contract.position}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-400">
                            {contract.counterparty} ({contract.location})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 py-3 border-y border-gray-700 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Available</p>
                        <p className="font-semibold">{contract.contracts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                        <p className="font-semibold">{(contract.avgPrice * 100).toFixed(0)}¢</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Your Cost</p>
                        <p className="font-semibold text-red-400">${contract.cost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Payout</p>
                        <p className="font-semibold text-green-400">${contract.payout.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                        <p className="font-semibold">${(contract.volume24h / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Expiry</p>
                        <p className="font-semibold">{contract.expiry}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link 
                        href={`/contract/${contract.id}`}
                        className="btn-primary"
                      >
                        View Details
                      </Link>
                      <button className="btn-secondary">
                        Negotiate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredContracts.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-400 mb-4">No contracts found matching your search.</p>
              <Link href="/create" className="btn-primary inline-block">
                Create Your Own Contract
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 card bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can't find what you need?</h3>
                <p className="text-blue-100">Create a custom contract and let AI handle the details</p>
              </div>
              <Link href="/create" className="btn-secondary bg-white text-blue-600 hover:bg-gray-100">
                Create Contract
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

