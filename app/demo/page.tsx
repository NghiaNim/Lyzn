'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'

type Step = 'intro' | 'business' | 'risks' | 'contract' | 'generating' | 'review' | 'deploying' | 'complete'

interface ContractParams {
  strikePrice: string
  protectionAmount: string
  expiry: string
  commodity: string
}

export default function DemoPage() {
  const [step, setStep] = useState<Step>('intro')
  const [progress, setProgress] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [hasAdjusted, setHasAdjusted] = useState(false)
  const [contractParams, setContractParams] = useState<ContractParams>({
    strikePrice: '0.55',
    protectionAmount: '5000',
    expiry: '2026-05',
    commodity: 'sugar'
  })

  const getCommodityEmoji = (commodity: string) => {
    const emojis: Record<string, string> = {
      sugar: '🍬',
      wheat: '🌾',
      coffee: '☕',
      corn: '🌽'
    }
    return emojis[commodity] || '📦'
  }

  // Auto-advance only for later steps (intro and business now have manual buttons)
  useEffect(() => {
    // Removed auto-advance for intro and business steps - now manual with buttons
  }, [step])

  // Progress bar animation
  useEffect(() => {
    if (step === 'generating') {
      let current = 0
      const interval = setInterval(() => {
        current += 5
        setProgress(current)
        if (current >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep('review'), 500)
        }
      }, 100)
      return () => clearInterval(interval)
    }
    if (step === 'deploying') {
      let current = 0
      const interval = setInterval(() => {
        current += 8
        setProgress(current)
        if (current >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep('complete'), 500)
        }
      }, 150)
      return () => clearInterval(interval)
    }
  }, [step])

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          {step === 'intro' && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="text-5xl font-bold mb-4">LYZN Demo</h1>
              <p className="text-xl text-gray-300 mb-8">
                Watch how we help a Brooklyn bakery hedge their sugar price risk
              </p>
              <button 
                onClick={() => setStep('business')}
                className="btn-primary inline-flex items-center gap-2"
              >
                Start Demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Business Profile */}
          {step === 'business' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Meet Sweet Treats Bakery</h2>
                <p className="text-gray-400">Brooklyn, New York</p>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Business Profile</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Business Type:</span>
                    <span className="font-medium">Commercial Bakery</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Revenue:</span>
                    <span className="font-medium">$45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Main Ingredients:</span>
                    <span className="font-medium">Sugar, Flour, Butter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sugar Spend:</span>
                    <span className="font-medium text-yellow-400">$2,000/month</span>
                  </div>
                </div>
              </div>

              <div className="card bg-yellow-600/10 border-yellow-500">
                <p className="text-yellow-100">
                  <strong>Pain Point:</strong> Last year, sugar prices spiked 40%. Their margins dropped from 25% to just 8%. They almost went out of business.
                </p>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setStep('risks')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Analyze Risks
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Risk Analysis */}
          {step === 'risks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold mb-2">AI Risk Analysis</h2>
                <p className="text-gray-400">Identifying key exposures...</p>
              </div>

              <div className="card border-blue-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-2xl">
                    🍬
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Critical Risk: Sugar Price Volatility</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">Exposure: <strong className="text-red-400">$24,000/year</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">Historical volatility: <strong className="text-red-400">40% spike in 2024</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">Current price: <strong>$0.48/lb</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/20 border border-blue-500 p-4 rounded-lg">
                  <p className="text-blue-100">
                    <strong>AI Recommendation:</strong> Hedge against sugar prices exceeding $0.55/lb. 
                    This would protect your business from the same crisis that hit last year.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setStep('contract')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Create Protection Contract
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Contract Details */}
          {step === 'contract' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Your Custom Contract
                  {hasAdjusted && (
                    <span className="ml-3 text-sm px-3 py-1 bg-green-600 text-green-100 rounded-full">
                      ✓ Customized
                    </span>
                  )}
                </h2>
                <p className="text-gray-400">
                  {hasAdjusted ? 'Updated with your custom parameters' : 'Pre-configured based on your risk profile'}
                </p>
              </div>

              {!isEditing ? (
                <div className="card border-green-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-3xl">{getCommodityEmoji(contractParams.commodity)}</div>
                    <h3 className="text-2xl font-bold">
                      Will {contractParams.commodity} exceed ${contractParams.strikePrice}/lb by {new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?
                    </h3>
                  </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Your Position:</span>
                      <span className="font-semibold text-green-400">YES (you get paid if {contractParams.commodity} rises)</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      If {contractParams.commodity} exceeds ${contractParams.strikePrice}/lb by {new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, you receive the full protection amount
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Protection Amount</p>
                      <p className="text-3xl font-bold text-green-400">${parseInt(contractParams.protectionAmount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Your payout if conditions met</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Your Cost</p>
                      <p className="text-3xl font-bold text-blue-400">${Math.round(parseInt(contractParams.protectionAmount) * 0.1).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">10% deposit locked in escrow</p>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Oracle:</span>
                      <span className="font-medium">USDA Agricultural Prices API</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Settlement:</span>
                      <span className="font-medium">Automatic via smart contract</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expiry Date:</span>
                      <span className="font-medium">{new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract Type:</span>
                      <span className="font-medium">Binary Event Contract</span>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500 p-4 rounded-lg">
                    <p className="text-sm text-blue-100 mb-3">
                      <strong>How it protects you:</strong>
                    </p>
                    <ul className="text-sm text-blue-100 space-y-1">
                      <li>• If {contractParams.commodity} hits ${contractParams.strikePrice}/lb: You receive ${parseInt(contractParams.protectionAmount).toLocaleString()} ({Math.round(parseInt(contractParams.protectionAmount) / (parseInt(contractParams.protectionAmount) * 0.1))}x return)</li>
                      <li>• This covers approximately {(parseInt(contractParams.protectionAmount) / 2000).toFixed(1)} months of {contractParams.commodity} purchases at higher prices</li>
                      <li>• Automatic payout - no claims process needed</li>
                      <li>• Funds held in trustless smart contract escrow</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setStep('generating')
                      setProgress(0)
                    }}
                    className="btn-primary flex-1 text-lg"
                  >
                    Post Contract to Marketplace
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                  >
                    Adjust Terms
                  </button>
                </div>
              </div>
              ) : (
                <div className="card border-blue-500 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold">Adjust Contract Terms</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Commodity
                      </label>
                      <select
                        value={contractParams.commodity}
                        onChange={(e) => setContractParams({ ...contractParams, commodity: e.target.value })}
                        className="input-field"
                      >
                        <option value="sugar">Sugar</option>
                        <option value="wheat">Wheat</option>
                        <option value="coffee">Coffee</option>
                        <option value="corn">Corn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Strike Price ($/lb)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={contractParams.strikePrice}
                        onChange={(e) => setContractParams({ ...contractParams, strikePrice: e.target.value })}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        The price threshold that triggers your payout
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Protection Amount ($)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={contractParams.protectionAmount}
                        onChange={(e) => setContractParams({ ...contractParams, protectionAmount: e.target.value })}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Your payout if the strike price is reached. Your deposit will be ${Math.round(parseInt(contractParams.protectionAmount || '0') * 0.1).toLocaleString()} (10%)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="month"
                        value={contractParams.expiry}
                        onChange={(e) => setContractParams({ ...contractParams, expiry: e.target.value })}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        When the contract expires and settles
                      </p>
                    </div>

                    <div className="bg-blue-600/20 border border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-100 mb-2">
                        <strong>Updated Contract Summary:</strong>
                      </p>
                      <div className="text-sm text-blue-100 space-y-1">
                        <p>• Position: YES (you get paid if {contractParams.commodity} rises)</p>
                        <p>• Strike Price: ${contractParams.strikePrice}/lb</p>
                        <p>• Protection: ${parseInt(contractParams.protectionAmount || '0').toLocaleString()}</p>
                        <p>• Your Cost: ${Math.round(parseInt(contractParams.protectionAmount || '0') * 0.1).toLocaleString()}</p>
                        <p>• Expires: {new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false)
                        setHasAdjusted(true)
                      }}
                      className="btn-primary flex-1"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generating */}
          {step === 'generating' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Generating Smart Contract</h2>
                <p className="text-gray-400">Please wait while we create your contract...</p>
              </div>

              <div className="card">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Validating contract parameters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Configuring oracle data feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress >= 50 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-gray-300">Generating payout logic</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                    )}
                    <span className="text-gray-300">Finalizing smart contract code</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Generated Contract */}
          {step === 'review' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Smart Contract Generated</h2>
                <p className="text-gray-400">Review before deployment</p>
              </div>

              <div className="card border-green-500">
                <h3 className="text-xl font-semibold mb-4">Contract Code Preview</h3>
                
                <div className="bg-slate-900 p-6 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <pre className="text-green-400">{`// LYZN Event Contract
// Auto-generated by AI

contract ${contractParams.commodity.charAt(0).toUpperCase() + contractParams.commodity.slice(1)}PriceProtection {
  address public bakery = 0x742d35Cc6634C0532...;
  uint256 public strikePrice = ${Math.round(parseFloat(contractParams.strikePrice) * 100)}; // cents per lb
  uint256 public protectionAmount = ${contractParams.protectionAmount}; // USD
  uint256 public expiryDate = ${Math.floor(new Date(contractParams.expiry).getTime() / 1000)}; // ${new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
  
  Oracle public oracle = USDA_Agricultural_Prices;
  
  function settle() external {
    require(block.timestamp >= expiryDate);
    uint256 finalPrice = oracle.getPrice("${contractParams.commodity.toUpperCase()}_USD_LB");
    
    if (finalPrice >= strikePrice) {
      payable(bakery).transfer(protectionAmount);
    }
  }
}`}</pre>
                </div>

                <div className="bg-green-600/20 border border-green-500 p-4 rounded-lg mb-4">
                  <p className="text-green-100">
                    <strong>✓ Contract Validated:</strong> All parameters verified. Oracle configured. 
                    Payout logic tested. Ready for deployment.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setStep('deploying')
                    setProgress(0)
                  }}
                  className="btn-primary w-full text-lg"
                >
                  Deploy Smart Contract
                </button>
              </div>
            </div>
          )}

          {/* Deploying */}
          {step === 'deploying' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Deploying to Blockchain</h2>
                <p className="text-gray-400">Creating immutable smart contract...</p>
              </div>

              <div className="card">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Deployment Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Contract deployed to blockchain</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress >= 40 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-gray-300">Initializing escrow wallet</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress >= 70 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                    )}
                    <span className="text-gray-300">Configuring oracle connection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {progress >= 100 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                    )}
                    <span className="text-gray-300">Posting to marketplace</span>
                  </div>
                </div>

                <div className="mt-6 bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
                  <p className="font-mono text-xs text-blue-400 break-all">
                    0x8f5e9d7c4b2a1e6f8d9c5b3a7e4f2d1c8b5a9e6f3d2c1b8a7e5f4d3c2b1a9e8f
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-5xl font-bold mb-4">Contract Live! 🎉</h1>
                <p className="text-xl text-gray-300">
                  Smart contract deployed and ready for matching
                </p>
              </div>

              <div className="card border-green-500">
                <h3 className="text-2xl font-semibold mb-4">Contract Successfully Created</h3>
                
                <div className="bg-green-600/20 border border-green-500 p-6 rounded-lg mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-green-300 mb-1">Contract Address</p>
                      <p className="font-mono text-xs text-green-100 break-all">
                        0x742d35Cc6634C05329e38...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-300 mb-1">Status</p>
                      <p className="font-semibold text-green-100">
                        ✓ Active & Listed on Marketplace
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-lg">What Happens Next?</h4>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Your Contract is Now Public</p>
                      <p className="text-sm text-gray-400">
                        Other businesses (like sugar refineries) can discover your contract and take the opposite position
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Counterparty Matches</p>
                      <p className="text-sm text-gray-400">
                        When matched, both parties' deposits are locked in escrow
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Automatic Settlement</p>
                      <p className="text-sm text-gray-400">
                        On {new Date(contractParams.expiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, the oracle reports {contractParams.commodity} prices and smart contract pays out automatically
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/20 border border-blue-500 p-4 rounded-lg mb-6">
                  <p className="text-blue-100">
                    <strong>Protection Active:</strong> If {contractParams.commodity} prices spike and reach ${contractParams.strikePrice}/lb, 
                    you'll receive ${parseInt(contractParams.protectionAmount).toLocaleString()} automatically - enough to cover approximately {(parseInt(contractParams.protectionAmount) / 2000).toFixed(1)} months of {contractParams.commodity} at higher prices. 
                    Your bakery is now protected! 🛡️
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => window.location.href = '/marketplace'}
                    className="btn-primary flex-1"
                  >
                    View in Marketplace
                  </button>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn-secondary"
                  >
                    Back to Home
                  </button>
                </div>
              </div>

              <div className="card bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-3">Ready to Protect Your Business?</h3>
                  <p className="text-blue-100 mb-4">
                    Join Sweet Treats Bakery and thousands of other SMEs hedging their risks with LYZN
                  </p>
                  <button 
                    onClick={() => window.location.href = '/chat'}
                    className="btn-secondary bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Start Your Risk Assessment
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

