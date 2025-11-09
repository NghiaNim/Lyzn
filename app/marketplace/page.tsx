'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, TrendingUp, Loader2 } from 'lucide-react'

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

// Convert backend orders to frontend contracts format
function orderToContract(order: any): Contract {
  const underlying = order.underlying.toUpperCase()
  const direction = order.direction
  const strikePrice = ((order.strikeMin + order.strikeMax) / 2).toFixed(2)
  const expiryDate = new Date(order.expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  const categories: Record<string, string> = {
    'BTC': 'Crypto',
    'ETH': 'Crypto',
    'SOL': 'Crypto',
    'SUGAR': 'Commodities',
    'WHEAT': 'Commodities',
    'COFFEE': 'Commodities',
    'OIL': 'Energy',
    'EUR': 'Currency',
  }

  return {
    id: order.id,
    title: `Will ${underlying} exceed $${strikePrice} by ${expiryDate}?`,
    category: categories[underlying] || 'Commodities',
    counterparty: order.user?.wallet?.slice(0, 8) || 'Unknown',
    location: 'Online',
    position: direction === 'LONG' ? 'YES' : 'NO',
    contracts: 100,
    avgPrice: 0.45,
    cost: Math.round(order.notional * 0.1),
    payout: order.notional,
    expiry: expiryDate,
    volume24h: Math.round(Math.random() * 20000 + 5000),
  }
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = ['All', 'Commodities', 'Currency', 'Energy', 'Crypto']

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/orders?status=OPEN')
      
      if (!response.ok) {
        throw new Error('Failed to load orders')
      }
      
      const data = await response.json()
      const loadedContracts = data.orders.map(orderToContract)
      setContracts(loadedContracts)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load marketplace. Please try again.')
      // Use empty array for now
      setContracts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredContracts = contracts.filter(contract => {
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
              <p className="text-2xl font-bold">{contracts.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-2xl font-bold">
                ${(contracts.reduce((sum, c) => sum + c.volume24h, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Active Users</p>
              <p className="text-2xl font-bold">{Math.max(contracts.length * 2, 10)}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Avg Protection</p>
              <p className="text-2xl font-bold">
                ${contracts.length > 0 
                  ? Math.round(contracts.reduce((sum, c) => sum + c.payout, 0) / contracts.length).toLocaleString()
                  : '0'}
              </p>
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

          {/* Loading State */}
          {loading && (
            <div className="card text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400">Loading marketplace...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="card text-center py-12 border-red-500 bg-red-500/10">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={loadOrders} className="btn-primary">
                Retry
              </button>
            </div>
          )}

          {/* Contracts Grid */}
          {!loading && !error && (
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
          )}

          {!loading && !error && filteredContracts.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-400 mb-4">
                {contracts.length === 0 
                  ? 'No contracts available yet. Be the first to create one!'
                  : 'No contracts found matching your search.'}
              </p>
              <Link href="/create" className="btn-primary inline-block">
                Create Your Own Contract
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 card bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can&apos;t find what you need?</h3>
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
