'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, DollarSign, Shield, CheckCircle } from 'lucide-react'

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState<'details' | 'deposit' | 'confirmed'>('details')

  // Mock contract data - in real app this would come from API
  const contract = {
    id: params.id,
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    category: 'Commodities',
    counterparty: 'Sugar Refinery',
    location: 'Louisiana',
    position: 'YES',
    contracts: 100,
    avgPrice: 0.45,
    cost: 450,
    payout: 1000,
    expiry: 'May 31, 2026',
    oracle: 'USDA Agricultural Prices API',
    currentPrice: 0.48,
    strikePrice: 0.55,
    description: 'This contract protects against sugar price increases. If sugar exceeds $0.55/lb by May 2026, YES holders receive $1,000 per contract.',
  }

  const handleBuy = () => {
    setStep('deposit')
  }

  const handleConfirmDeposit = () => {
    // Simulate blockchain transaction
    setTimeout(() => {
      setStep('confirmed')
    }, 2000)
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {step === 'details' && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <span>Marketplace</span>
                  <span>→</span>
                  <span>{contract.category}</span>
                  <span>→</span>
                  <span className="text-white">Contract Details</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{contract.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-blue-600/20 text-blue-400">
                    {contract.category}
                  </span>
                  <span className={`px-3 py-1 rounded ${
                    contract.position === 'YES' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {contract.position}
                  </span>
                  <span className="text-gray-400">
                    Offered by {contract.counterparty} ({contract.location})
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  {/* Overview */}
                  <div className="card">
                    <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                    <p className="text-gray-300 mb-6">{contract.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <p className="text-sm text-gray-400">Current Price</p>
                        </div>
                        <p className="text-2xl font-bold">${contract.currentPrice}/lb</p>
                      </div>
                      <div className="bg-navy-700/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                          <p className="text-sm text-gray-400">Strike Price</p>
                        </div>
                        <p className="text-2xl font-bold">${contract.strikePrice}/lb</p>
                      </div>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="card">
                    <h2 className="text-2xl font-semibold mb-4">How Settlement Works</h2>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          1
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Deposit Collateral</p>
                          <p className="text-sm text-gray-400">
                            You deposit ${contract.cost} (10% of protection amount) into smart contract escrow
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          2
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Counterparty Matches</p>
                          <p className="text-sm text-gray-400">
                            {contract.counterparty} takes the opposite position and deposits their collateral
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          3
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Oracle Reports Price</p>
                          <p className="text-sm text-gray-400">
                            At expiry, {contract.oracle} reports the actual sugar price
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          4
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Automatic Payout</p>
                          <p className="text-sm text-gray-400">
                            Smart contract calculates winner and transfers funds—completely trustless
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Disclosure */}
                  <div className="card bg-yellow-600/10 border-yellow-500">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      Risk Disclosure
                    </h3>
                    <p className="text-sm text-yellow-100">
                      Event contracts involve risk. You could lose your entire deposit if the price condition 
                      is not met. Only invest what you can afford to lose. This is not financial advice.
                    </p>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Purchase Card */}
                  <div className="card sticky top-24">
                    <h3 className="text-xl font-semibold mb-4">Purchase Contract</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={contract.contracts}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {contract.contracts} available
                        </p>
                      </div>

                      <div className="bg-navy-700/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Price per contract</span>
                          <span className="font-medium">${contract.cost}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Quantity</span>
                          <span className="font-medium">×{quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Platform fee (1%)</span>
                          <span className="font-medium">${Math.round(contract.cost * quantity * 0.01)}</span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between">
                          <span className="font-semibold">Total Cost</span>
                          <span className="font-bold text-xl">${(contract.cost * quantity) + Math.round(contract.cost * quantity * 0.01)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-600">
                          <span className="font-semibold text-green-400">Potential Payout</span>
                          <span className="font-bold text-xl text-green-400">${(contract.payout * quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleBuy} className="btn-primary w-full">
                      Buy Contract
                    </button>
                  </div>

                  {/* Contract Details */}
                  <div className="card">
                    <h3 className="font-semibold mb-3">Contract Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expiry Date</span>
                        <span className="font-medium">{contract.expiry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Oracle</span>
                        <span className="font-medium text-right">{contract.oracle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available</span>
                        <span className="font-medium">{contract.contracts} contracts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Price</span>
                        <span className="font-medium">{(contract.avgPrice * 100).toFixed(0)}¢</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'deposit' && (
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <h2 className="text-2xl font-semibold mb-6">Confirm & Deposit</h2>
                
                <div className="bg-slate-700/50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract</span>
                      <span className="font-medium text-right">{contract.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position</span>
                      <span className={`font-medium ${
                        contract.position === 'YES' ? 'text-green-400' : 'text-red-400'
                      }`}>{contract.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="font-medium">{quantity} contracts</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-600">
                      <span className="font-semibold">Total Deposit</span>
                      <span className="font-bold text-xl">${(contract.cost * quantity) + Math.round(contract.cost * quantity * 0.01)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-100">
                    Your funds will be held in a smart contract escrow. They will be automatically 
                    returned or paid out based on the oracle result at contract expiry.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('details')} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button onClick={handleConfirmDeposit} className="btn-primary flex-1">
                    Confirm & Deposit
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="max-w-2xl mx-auto">
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Contract Purchased!</h2>
                <p className="text-gray-300 mb-8">
                  Your deposit of ${(contract.cost * quantity) + Math.round(contract.cost * quantity * 0.01)} has been 
                  successfully locked in the smart contract escrow.
                </p>

                <div className="bg-slate-700/50 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-semibold mb-4">What Happens Next?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                        ✓
                      </div>
                      <p className="text-gray-300">
                        Your position is now active. You can view it in your dashboard.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                        2
                      </div>
                      <p className="text-gray-300">
                        At expiry ({contract.expiry}), the oracle will report the sugar price.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                        3
                      </div>
                      <p className="text-gray-300">
                        If sugar exceeds ${contract.strikePrice}/lb, you'll receive ${contract.payout * quantity} automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={() => router.push('/dashboard')} className="btn-secondary">
                    View Dashboard
                  </button>
                  <button onClick={() => router.push('/marketplace')} className="btn-primary">
                    Browse More Contracts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

