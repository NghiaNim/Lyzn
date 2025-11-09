'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Sparkles, CheckCircle, ArrowRight, TrendingUp, Send, Loader2, DollarSign, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useContracts } from '@/contexts/ContractContext'

type Step = 'intro' | 'business' | 'chat' | 'risks' | 'contract' | 'generating' | 'review' | 'deploying' | 'complete'

interface ContractParams {
  strikePrice: string
  protectionAmount: string
  expiry: string
  commodity: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RiskOption {
  id: string
  commodity: string
  title: string
  description: string
  exposure: string
  impact: string
  icon: string
}

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

function AvailableContractsStep({ 
  riskType, 
  allContracts,
  onSelectContract, 
  onCreateNew 
}: { 
  riskType: string
  allContracts: Contract[]
  onSelectContract: (contractId: string) => void
  onCreateNew: () => void
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const contractsPerPage = 3

  const getRiskTitle = (type: string) => {
    const titles: Record<string, string> = {
      sugar: 'Sugar Price Volatility',
      wheat: 'Wheat Flour Price Risk',
      butter: 'Butter Cost Exposure'
    }
    return titles[type] || 'Price Risk'
  }

  const getRiskIcon = (type: string) => {
    const icons: Record<string, string> = {
      sugar: '🍬',
      wheat: '🌾',
      butter: '🧈'
    }
    return icons[type] || '📦'
  }

  // Filter contracts based on risk type - match by category or title keywords
  const relevantContracts = allContracts.filter(contract => {
    const searchTerm = riskType.toLowerCase()
    return contract.title.toLowerCase().includes(searchTerm) || 
           contract.category.toLowerCase().includes(searchTerm)
  })

  // Paginate contracts
  const startIndex = currentPage * contractsPerPage
  const displayedContracts = relevantContracts.slice(startIndex, startIndex + contractsPerPage)
  const hasMore = startIndex + contractsPerPage < relevantContracts.length
  const totalPages = Math.ceil(relevantContracts.length / contractsPerPage)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getRiskIcon(riskType)}</div>
        <h2 className="text-3xl font-bold mb-2">Available Contracts for {getRiskTitle(riskType)}</h2>
        <p className="text-gray-400">Choose a contract to protect your business</p>
      </div>

      {relevantContracts.length > 0 ? (
        <>
          <div className="space-y-4">
            {displayedContracts.map((contract) => (
              <div key={contract.id} className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-blue-500 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getRiskIcon(riskType)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-white">{contract.title}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Position</p>
                        <p className="text-white font-medium">{contract.position} · {contract.counterparty}</p>
                        <p className="text-sm text-gray-400">{contract.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Contracts Available</p>
                        <p className="text-white font-medium">{contract.contracts} contracts</p>
                        <p className="text-sm text-gray-400">Avg Price: {contract.avgPrice.toFixed(2)}¢</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Cost</p>
                        <p className="text-2xl font-bold text-yellow-400">${contract.cost}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Payout if right</p>
                        <p className="text-2xl font-bold text-green-400">${contract.payout.toLocaleString()}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Expires</p>
                        <p className="text-white font-medium">{contract.expiry}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onSelectContract(contract.id)}
                        className="btn-primary flex-1"
                      >
                        Buy Now
                      </button>
                      <Link
                        href={`/negotiate/${contract.id}`}
                        className="btn-secondary flex-1 text-center"
                      >
                        Negotiate Terms
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse More / Pagination */}
          {relevantContracts.length > contractsPerPage && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <div className="text-gray-400">
                Page {currentPage + 1} of {totalPages} ({relevantContracts.length} contracts)
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasMore}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse More →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 text-center py-12">
          <p className="text-gray-400 mb-4">No existing contracts found for this risk.</p>
        </div>
      )}

      <div className="text-center pt-8 border-t border-slate-800">
        <button
          onClick={onCreateNew}
          className="btn-primary inline-flex items-center gap-2"
        >
          + Create Your Own {riskType.charAt(0).toUpperCase() + riskType.slice(1)} Contract
        </button>
      </div>
    </div>
  )
}

function ContractAdjustmentChat({
  initialParams,
  onSave,
  onCancel
}: {
  initialParams: ContractParams
  onSave: (params: ContractParams) => void
  onCancel: () => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [updatedParams, setUpdatedParams] = useState<ContractParams>(initialParams)

  const conversationFlow = useMemo(() => [
    {
      assistant: "I can help you customize this contract. What would you like to adjust?",
      user: "I'd like to change some of the terms to better fit my needs.",
      delay: 1500
    },
    {
      assistant: "Great! Let's start with the strike price. The current threshold is $" + initialParams.strikePrice + "/lb. Would you like to raise or lower it?",
      user: "I think $0.60/lb would be more appropriate for my risk tolerance.",
      delay: 2000,
      action: () => {
        setUpdatedParams(prev => ({ ...prev, strikePrice: '0.60' }))
      }
    },
    {
      assistant: "Perfect, I've updated the strike price to $0.60/lb. Now, how about the protection amount? It's currently set at $" + initialParams.protectionAmount + ". Does that work for you?",
      user: "Actually, I'd like to increase it to $7,500 to have more coverage.",
      delay: 2000,
      action: () => {
        setUpdatedParams(prev => ({ ...prev, protectionAmount: '7500' }))
      }
    },
    {
      assistant: "Got it - $7,500 protection amount. That means your deposit would be $750 (10%). Finally, the expiry date is currently " + new Date(initialParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ". Would you like to change that?",
      user: "Can we extend it to August 2026?",
      delay: 2000,
      action: () => {
        setUpdatedParams(prev => ({ ...prev, expiry: '2026-08' }))
      }
    },
    {
      assistant: "All set! I've updated your contract with the new terms. Your protection is now $7,500 with a strike price of $0.60/lb, expiring August 2026. Your deposit would be $750. Would you like to save these changes?",
      user: null,
      delay: 1500,
      action: () => {
        setShowButtons(true)
      }
    }
  ], [initialParams.strikePrice, initialParams.protectionAmount, initialParams.expiry])

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const startConversation = async () => {
      for (let i = 0; i < conversationFlow.length; i++) {
        const step = conversationFlow[i]
        
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        setIsTyping(false)
        
        setMessages(prev => [...prev, { role: 'assistant', content: step.assistant }])
        await new Promise(resolve => setTimeout(resolve, step.delay))
        
        if (step.user) {
          setMessages(prev => [...prev, { role: 'user', content: step.user! }])
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (step.action) {
          step.action()
        }
      }
    }

    startConversation()
  }, [conversationFlow])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Chat Container */}
      <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Updated Contract Summary */}
      {showButtons && (
        <div className="card bg-blue-600/10 border-blue-500 backdrop-blur-sm animate-fade-in">
          <p className="text-sm text-blue-100 mb-4">
            <strong>Updated Contract Summary:</strong>
          </p>
          <div className="text-sm text-blue-100 space-y-2 mb-6">
            <p>• Position: YES (you get paid if {updatedParams.commodity} rises)</p>
            <p>• Strike Price: ${updatedParams.strikePrice}/lb</p>
            <p>• Protection: ${parseInt(updatedParams.protectionAmount).toLocaleString()}</p>
            <p>• Your Cost: ${Math.round(parseInt(updatedParams.protectionAmount) * 0.1).toLocaleString()}</p>
            <p>• Expires: {new Date(updatedParams.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onSave(updatedParams)}
              className="btn-primary flex-1"
            >
              Save Changes
            </button>
            <button 
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChatDemoStep({ onComplete }: { onComplete: (riskType: string) => void }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showRisks, setShowRisks] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
  const [confirmedRisk, setConfirmedRisk] = useState(false)

  const riskOptions: RiskOption[] = [
    {
      id: 'sugar',
      commodity: 'Sugar',
      title: 'Sugar Price Volatility',
      description: 'Protect against sugar price spikes that directly impact your ingredient costs',
      exposure: '$24,000/year',
      impact: '40% price spike could reduce margins from 25% to 8%',
      icon: '🍬'
    },
    {
      id: 'wheat',
      commodity: 'Wheat',
      title: 'Wheat Flour Price Risk',
      description: 'Hedge against flour price increases that affect your bread and pastry production',
      exposure: '$18,000/year',
      impact: '30% price increase could cut profits by $5,400 annually',
      icon: '🌾'
    },
    {
      id: 'butter',
      commodity: 'Butter',
      title: 'Butter Cost Exposure',
      description: 'Manage butter price fluctuations that impact your premium baked goods',
      exposure: '$12,000/year',
      impact: '25% price rise could reduce monthly margins by $250',
      icon: '🧈'
    }
  ]

  const conversationFlow = useMemo(() => [
    {
      assistant: "Hi! I'm here to help protect your business from unexpected price increases. Can you tell me a bit about your business?",
      user: "I run a bakery in Brooklyn.",
      delay: 1800
    },
    {
      assistant: "Great! I'd love to understand your business better. What are your main ingredients and supplies?",
      user: "We use a lot of sugar, wheat flour, and butter. Also diesel for our delivery trucks.",
      delay: 2200
    },
    {
      assistant: "Got it. How much do you typically spend on these each month?",
      user: "Sugar is about $2,000/month, flour $1,500, butter $800.",
      delay: 2000
    },
    {
      assistant: "And how do price changes affect you? For example, what happens if sugar prices spike?",
      user: "Last year sugar went up 40% and we almost went under. We couldn't raise prices fast enough.",
      delay: 2500
    },
    {
      assistant: "I understand—that's a real risk. Let me show you some ways to protect against these price swings.",
      user: null,
      delay: 2000,
      action: () => {
        setTimeout(() => {
          setShowRisks(true)
        }, 2000)
      }
    }
  ], [])

  useEffect(() => {
    // Prevent duplicate conversations (React Strict Mode in dev)
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // Start conversation automatically
    const startConversation = async () => {
      for (let i = 0; i < conversationFlow.length; i++) {
        const step = conversationFlow[i]
        
        // Add assistant message
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        setIsTyping(false)
        
        setMessages(prev => [...prev, { role: 'assistant', content: step.assistant }])
        await new Promise(resolve => setTimeout(resolve, step.delay))
        
        // Add user message if exists
        if (step.user) {
          setMessages(prev => [...prev, { role: 'user', content: step.user! }])
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Execute action if exists
        if (step.action) {
          step.action()
        }
      }
    }

    startConversation()
  }, [conversationFlow])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleRiskSelect = (riskId: string) => {
    setSelectedRisk(riskId)
  }

  const handleConfirmRisk = () => {
    const risk = riskOptions.find(r => r.id === selectedRisk)
    setConfirmedRisk(true)
    
    setTimeout(() => {
      setMessages(prev => [...prev, 
        { role: 'user', content: `I'd like to protect against ${risk?.commodity.toLowerCase()} price increases.` },
        { role: 'assistant', content: `Perfect choice! ${risk?.commodity} price protection makes a lot of sense for your business. I've identified the key risks for your business.` }
      ])
    }, 500)
  }

  const handleChangeRisk = () => {
    setSelectedRisk(null)
    setConfirmedRisk(false)
  }

  return (
    <div className={`space-y-6 animate-fade-in transition-all duration-500 ${!showRisks ? 'flex flex-col items-center justify-center min-h-[60vh]' : ''}`}>
      {/* Skip Demo Button */}
      {!showRisks && (
        <div className="w-full max-w-3xl flex justify-end mb-2">
          <button
            onClick={() => setShowRisks(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors underline"
          >
            Skip Demo Chat →
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div className={`card bg-slate-900/50 backdrop-blur-sm border-slate-800 h-[400px] flex flex-col ${!showRisks ? 'max-w-3xl mx-auto w-full' : ''}`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Risk Options */}
      {showRisks && !confirmedRisk && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Identify Your Key Risks</h2>
            <p className="text-gray-400">Select the risk you&apos;d like to protect against:</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {riskOptions.map((risk) => (
              <div
                key={risk.id}
                onClick={() => handleRiskSelect(risk.id)}
                className={`card bg-slate-900/50 backdrop-blur-sm border-slate-800 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:scale-105 ${
                  selectedRisk === risk.id ? 'border-blue-500 bg-blue-500/10' : ''
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{risk.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{risk.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{risk.description}</p>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Exposure: <strong className="text-yellow-400">{risk.exposure}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300 text-xs">{risk.impact}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className={`text-sm py-2 text-center font-medium ${
                    selectedRisk === risk.id ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {selectedRisk === risk.id ? '✓ Selected' : 'Click to Select'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Step */}
          {selectedRisk && (
            <div className="text-center animate-fade-in mt-6">
              <div className="card bg-blue-600/10 border-blue-500 backdrop-blur-sm">
                <p className="text-blue-100 mb-4">
                  You selected <strong>{riskOptions.find(r => r.id === selectedRisk)?.title}</strong>. 
                  Is this the risk you&apos;d like to analyze?
                </p>
                <button 
                  onClick={handleConfirmRisk}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Yes, Confirm
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmedRisk && (
        <div className="text-center animate-fade-in">
          <div className="card bg-green-600/10 border-green-500 backdrop-blur-sm mb-4">
            <p className="text-green-100 mb-4">
              Great choice! Let me find available contracts to protect against this risk.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => onComplete(selectedRisk || 'sugar')}
                className="btn-primary inline-flex items-center gap-2"
              >
                View Available Contracts
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={handleChangeRisk}
                className="btn-secondary"
              >
                Change Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DemoPage() {
  const { contracts: allContracts } = useContracts()
  const [step, setStep] = useState<Step>('intro')
  const [progress, setProgress] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [hasAdjusted, setHasAdjusted] = useState(false)
  const [selectedRiskType, setSelectedRiskType] = useState<string>('sugar')
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

  // Auto-advance from intro to business after 2 seconds
  useEffect(() => {
    if (step === 'intro') {
      const timer = setTimeout(() => setStep('business'), 2000)
      return () => clearTimeout(timer)
    }
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
        {/* Grid pattern overlay for professional look */}
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

      {/* Decorative gradient overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative pt-24 pb-12 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          {step === 'intro' && (
            <div className="text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
              <div className="mb-8">
                <Image
                  src="/doughnuts-1868573_1280.jpg"
                  alt="Donuts"
                  width={200}
                  height={200}
                  className="rounded-full object-cover mx-auto"
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
              <h1 className="text-5xl font-bold mb-4 text-white">LYZN Demo</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Watch how we help a Brooklyn bakery hedge their sugar price risk
              </p>
              <p className="text-sm text-gray-500">Starting demo in a moment...</p>
            </div>
          )}

          {/* Business Profile */}
          {step === 'business' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Meet Sweet Treats Bakery</h2>
                <p className="text-gray-400 mb-6">Brooklyn, New York</p>
                <div className="flex justify-center mb-6">
                  <Image
                    src="/doughnuts-1868573_1280.jpg"
                    alt="Donuts"
                    width={150}
                    height={150}
                    className="rounded-full object-cover"
                    style={{ width: '150px', height: '150px' }}
                  />
                </div>
              </div>

              <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
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

              <div className="card bg-yellow-600/10 border-yellow-500 backdrop-blur-sm">
                <p className="text-yellow-100">
                  <strong>Pain Point:</strong> Last year, sugar prices spiked 40%. Their margins dropped from 25% to just 8%. They almost went out of business.
                </p>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setStep('chat')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Analyze Business
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Demo */}
          {step === 'chat' && (
            <ChatDemoStep onComplete={(riskType: string) => {
              setSelectedRiskType(riskType)
              setStep('risks')
            }} />
          )}

          {/* Available Contracts */}
          {step === 'risks' && (
            <AvailableContractsStep 
              riskType={selectedRiskType}
              allContracts={allContracts}
              onSelectContract={(contractId) => {
                // Navigate to contract detail page
                window.location.href = `/contract/${contractId}`
              }}
              onCreateNew={() => setStep('contract')}
            />
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

              {isEditing ? (
                <ContractAdjustmentChat
                  initialParams={contractParams}
                  onSave={(newParams) => {
                    setContractParams(newParams)
                    setHasAdjusted(true)
                    setIsEditing(false)
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="card border-green-500 bg-slate-900/50 backdrop-blur-sm">
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

              <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
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

              <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
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
              <div className="text-center mb-8 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-5xl font-bold mb-4">Contract Live! 🎉</h1>
                <p className="text-xl text-gray-300 max-w-md mx-auto">
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
                        When matched, both parties&apos; deposits are locked in escrow
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
                    you&apos;ll receive ${parseInt(contractParams.protectionAmount).toLocaleString()} automatically - enough to cover approximately {(parseInt(contractParams.protectionAmount) / 2000).toFixed(1)} months of {contractParams.commodity} at higher prices. 
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

              <div className="card bg-slate-900/40 backdrop-blur-sm border-slate-800">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-3">Ready to Protect Your Business?</h3>
                  <p className="text-gray-300 mb-4">
                    Join Sweet Treats Bakery and thousands of other SMEs hedging their risks with LYZN
                  </p>
                  <button 
                    onClick={() => window.location.href = '/chat'}
                    className="btn-secondary bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all duration-300"
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

