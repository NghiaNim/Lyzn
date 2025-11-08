'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Info } from 'lucide-react'

export default function CreateContractPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const risk = searchParams.get('risk') || ''

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    commodity: risk === 'sugar' ? 'Sugar' : risk === 'wheat' ? 'Wheat' : '',
    strikePrice: '',
    expiry: '',
    position: 'YES',
    protectionAmount: '',
  })

  const [generatedContract, setGeneratedContract] = useState<any>(null)

  const handleGenerate = () => {
    // Simulate AI generation
    const contract = {
      title: `Will ${formData.commodity.toLowerCase()} exceed $${formData.strikePrice} by ${formData.expiry}?`,
      position: formData.position,
      protectionAmount: formData.protectionAmount,
      cost: Math.round(parseFloat(formData.protectionAmount) * 0.1),
      oracle: formData.commodity === 'Sugar' ? 'USDA Agricultural Prices API' : 
              formData.commodity === 'Wheat' ? 'CME Group Market Data' : 
              'Chainlink Price Feed',
      settlement: 'Automatic via smart contract',
      collateral: Math.round(parseFloat(formData.protectionAmount) * 0.15),
    }
    setGeneratedContract(contract)
    setStep(2)
  }

  const handlePost = () => {
    // Simulate posting
    setTimeout(() => {
      router.push('/marketplace')
    }, 1500)
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Custom Contract</h1>
            <p className="text-gray-400">AI will help you structure your hedge</p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold">Contract Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What risk do you want to hedge?
                    </label>
                    <select
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select commodity...</option>
                      <option value="Sugar">Sugar</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Coffee">Coffee</option>
                      <option value="Oil">Oil</option>
                      <option value="Diesel">Diesel</option>
                      <option value="EUR/USD">EUR/USD Currency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Strike Price (per unit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 0.55"
                      value={formData.strikePrice}
                      onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      The price threshold that triggers the payout
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="month"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Position
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, position: 'YES' })}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.position === 'YES'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-green-400 mb-1">YES (Long)</p>
                          <p className="text-sm text-gray-400">
                            Get paid if price goes above strike
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, position: 'NO' })}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.position === 'NO'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-red-400 mb-1">NO (Short)</p>
                          <p className="text-sm text-gray-400">
                            Get paid if price stays below strike
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Protection Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      value={formData.protectionAmount}
                      onChange={(e) => setFormData({ ...formData, protectionAmount: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      How much you want to protect (your potential payout)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!formData.commodity || !formData.strikePrice || !formData.expiry || !formData.protectionAmount}
                  className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Generate Contract with AI
                </button>
              </div>

              <div className="card bg-blue-600/10 border-blue-500">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-100">
                      <strong>How it works:</strong> Our AI will automatically generate the contract structure, 
                      select the appropriate price oracle, calculate fair pricing, and create the smart contract logic. 
                      You'll review everything before posting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && generatedContract && (
            <div className="space-y-6">
              <div className="card border-green-500">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold">AI-Generated Contract</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{generatedContract.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded ${
                        generatedContract.position === 'YES'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {generatedContract.position} Position
                      </span>
                      <span className="text-gray-400">
                        {generatedContract.position === 'YES' 
                          ? '(You get paid if price rises above strike)' 
                          : '(You get paid if price stays below strike)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Protection Amount</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${parseInt(generatedContract.protectionAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Your payout if conditions met</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Your Deposit (10%)</p>
                      <p className="text-2xl font-bold text-red-400">
                        ${generatedContract.cost.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Locked in smart contract</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Oracle Data Source:</span>
                      <span className="font-medium">{generatedContract.oracle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Settlement:</span>
                      <span className="font-medium">{generatedContract.settlement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Collateral Required:</span>
                      <span className="font-medium">${generatedContract.collateral.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee (1%):</span>
                      <span className="font-medium">${Math.round(generatedContract.cost * 0.01)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">How Settlement Works:</p>
                    <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Both parties deposit collateral into smart contract escrow</li>
                      <li>At expiry, oracle reports the actual {formData.commodity} price</li>
                      <li>Smart contract automatically calculates and transfers payout</li>
                      <li>No manual intervention needed—100% trustless</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Adjust Terms
                  </button>
                  <button onClick={handlePost} className="btn-primary flex-1">
                    Post Contract to Marketplace
                  </button>
                </div>
              </div>

              <div className="card bg-green-600/10 border-green-500">
                <p className="text-sm text-green-100">
                  <strong>✓ Contract validated:</strong> AI has verified the contract structure, 
                  pricing logic, and oracle configuration. Once posted, other businesses with opposite 
                  exposure can discover and match with your contract.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

