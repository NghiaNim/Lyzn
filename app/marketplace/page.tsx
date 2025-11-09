'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, TrendingUp } from 'lucide-react'
import { useContracts } from '@/contexts/ContractContext'
import { purchaseContract } from '@/lib/purchaseHelper'
import { useRouter } from 'next/navigation'

export default function MarketplacePage() {
  const router = useRouter()
  const { contracts: allContracts } = useContracts()
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
            <h1 className="text-4xl font-bold mb-2">Contract Marketplace</h1>
            <p className="text-gray-400">Browse and purchase event contracts from other businesses</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <p className="text-sm text-gray-400 mb-1">Total Contracts</p>
              <p className="text-2xl font-bold">{allContracts.length}</p>
            </div>
            <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-2xl font-bold">
                ${(allContracts.reduce((sum, c) => sum + c.volume24h, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <p className="text-sm text-gray-400 mb-1">Active Users</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
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
              <div key={contract.id} className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-blue-500 transition-colors">
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
                        <p className="font-semibold">{contract.contracts.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                        <p className="font-semibold">{contract.avgPrice}¢</p>
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
                      <button 
                        onClick={() => {
                          // Save purchase to localStorage
                          purchaseContract({
                            id: contract.id,
                            title: contract.title,
                            position: contract.position,
                            cost: contract.cost,
                            payout: contract.payout,
                            expiry: contract.expiry,
                            counterparty: contract.counterparty
                          })
                          
                          alert('✅ Smart contract deployed! Position added to your dashboard.')
                          setTimeout(() => router.push('/dashboard'), 1500)
                        }}
                        className="btn-primary"
                      >
                        Buy Now
                      </button>
                      <Link
                        href={`/negotiate/${contract.id}`}
                        className="btn-secondary"
                      >
                        Negotiate
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredContracts.length === 0 && (
            <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 text-center py-12">
              <p className="text-gray-400 mb-4">No contracts found matching your search.</p>
              <Link href="/create" className="btn-primary inline-block">
                Create Your Own Contract
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 card bg-slate-900/40 backdrop-blur-sm border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can&apos;t find what you need?</h3>
                <p className="text-gray-300">Create a custom contract and let AI handle the details</p>
              </div>
              <Link href="/create" className="btn-secondary bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer">
                Create Contract
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

