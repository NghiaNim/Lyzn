'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle, XCircle, MessageSquare, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useContracts } from '@/contexts/ContractContext'
import { purchaseContract } from '@/lib/purchaseHelper'

type NegotiationStep = 'propose' | 'waiting' | 'received' | 'counter' | 'accepted' | 'rejected'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface NegotiationOffer {
  strikePrice: string
  protectionAmount: string
  cost: string
  expiry: string
  reasoning: string
}

interface ContractConfig {
  unit: string
  getStrikePrice: (title: string) => string
  getDefaultStrikePrice: (original: string) => string
  getDefaultProtection: (original: number) => string
  getDefaultCost: (protection: string) => string
  getDefaultExpiry: (original: string) => string
}

// Helper function to extract strike price from title
function extractStrikePrice(title: string): string {
  const match = title.match(/\$([\d.]+)/)
  return match ? match[1] : '0.55'
}

// Helper function to parse expiry date
function parseExpiryToDate(expiry: string): string {
  const monthMap: Record<string, string> = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  }
  
  const match = expiry.match(/(\w+)\s+(\d{4})/)
  if (match) {
    const month = monthMap[match[1]] || '01'
    return `${match[2]}-${month}`
  }
  return '2026-05'
}

// Get contract configuration based on contract ID
function getContractConfig(contractId: string, title: string): ContractConfig {
  if (contractId.startsWith('sugar')) {
    return {
      unit: '/lb',
      getStrikePrice: (title) => extractStrikePrice(title),
      getDefaultStrikePrice: (original) => {
        const originalNum = parseFloat(original)
        return (originalNum + 0.05).toFixed(2)
      },
      getDefaultProtection: (original) => {
        const originalNum = parseInt(original.toString())
        return (originalNum + 2000).toLocaleString()
      },
      getDefaultCost: (protection) => {
        const protectionNum = parseInt(protection.replace(/,/g, ''))
        return Math.round(protectionNum * 0.1).toString()
      },
      getDefaultExpiry: (original) => {
        const date = parseExpiryToDate(original)
        const [year, month] = date.split('-')
        const nextMonth = parseInt(month) + 1
        return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
      }
    }
  } else if (contractId.startsWith('wheat')) {
    return {
      unit: '/bushel',
      getStrikePrice: (title) => extractStrikePrice(title),
      getDefaultStrikePrice: (original) => {
        const originalNum = parseFloat(original)
        return (originalNum + 0.50).toFixed(2)
      },
      getDefaultProtection: (original) => {
        const originalNum = parseInt(original.toString())
        return (originalNum + 1500).toLocaleString()
      },
      getDefaultCost: (protection) => {
        const protectionNum = parseInt(protection.replace(/,/g, ''))
        return Math.round(protectionNum * 0.1).toString()
      },
      getDefaultExpiry: (original) => {
        const date = parseExpiryToDate(original)
        const [year, month] = date.split('-')
        const nextMonth = parseInt(month) + 1
        return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
      }
    }
  } else if (contractId.startsWith('eur')) {
    return {
      unit: '',
      getStrikePrice: (title) => extractStrikePrice(title),
      getDefaultStrikePrice: (original) => {
        const originalNum = parseFloat(original)
        return (originalNum + 0.02).toFixed(2)
      },
      getDefaultProtection: (original) => {
        const originalNum = parseInt(original.toString())
        return (originalNum + 500).toLocaleString()
      },
      getDefaultCost: (protection) => {
        const protectionNum = parseInt(protection.replace(/,/g, ''))
        return Math.round(protectionNum * 0.1).toString()
      },
      getDefaultExpiry: (original) => {
        const date = parseExpiryToDate(original)
        const [year, month] = date.split('-')
        const nextMonth = parseInt(month) + 1
        return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
      }
    }
  } else if (contractId.startsWith('oil')) {
    return {
      unit: '/barrel',
      getStrikePrice: (title) => extractStrikePrice(title),
      getDefaultStrikePrice: (original) => {
        const originalNum = parseFloat(original)
        return (originalNum + 5).toFixed(2)
      },
      getDefaultProtection: (original) => {
        const originalNum = parseInt(original.toString())
        return (originalNum + 500).toLocaleString()
      },
      getDefaultCost: (protection) => {
        const protectionNum = parseInt(protection.replace(/,/g, ''))
        return Math.round(protectionNum * 0.1).toString()
      },
      getDefaultExpiry: (original) => {
        const date = parseExpiryToDate(original)
        const [year, month] = date.split('-')
        const nextMonth = parseInt(month) + 1
        return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
      }
    }
  } else if (contractId.startsWith('coffee')) {
    return {
      unit: '/lb',
      getStrikePrice: (title) => extractStrikePrice(title),
      getDefaultStrikePrice: (original) => {
        const originalNum = parseFloat(original)
        return (originalNum + 0.10).toFixed(2)
      },
      getDefaultProtection: (original) => {
        const originalNum = parseInt(original.toString())
        return (originalNum + 500).toLocaleString()
      },
      getDefaultCost: (protection) => {
        const protectionNum = parseInt(protection.replace(/,/g, ''))
        return Math.round(protectionNum * 0.1).toString()
      },
      getDefaultExpiry: (original) => {
        const date = parseExpiryToDate(original)
        const [year, month] = date.split('-')
        const nextMonth = parseInt(month) + 1
        return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
      }
    }
  }
  
  // Default fallback
  return {
    unit: '/lb',
    getStrikePrice: (title) => extractStrikePrice(title),
    getDefaultStrikePrice: (original) => (parseFloat(original) + 0.05).toFixed(2),
    getDefaultProtection: (original) => (parseInt(original.toString()) + 2000).toLocaleString(),
    getDefaultCost: (protection) => {
      const protectionNum = parseInt(protection.replace(/,/g, ''))
      return Math.round(protectionNum * 0.1).toString()
    },
    getDefaultExpiry: (original) => {
      const date = parseExpiryToDate(original)
      const [year, month] = date.split('-')
      const nextMonth = parseInt(month) + 1
      return nextMonth > 12 ? `${parseInt(year) + 1}-01` : `${year}-${nextMonth.toString().padStart(2, '0')}`
    }
  }
}

// Generate conversation flow based on contract
function generateConversationFlow(contract: any, config: ContractConfig) {
  const originalStrike = config.getStrikePrice(contract.title)
  const defaultStrike = config.getDefaultStrikePrice(originalStrike)
  const defaultProtection = config.getDefaultProtection(contract.payout)
  const defaultCost = config.getDefaultCost(defaultProtection)
  const defaultExpiry = config.getDefaultExpiry(contract.expiry)
  const unit = config.unit

  // Customize user responses based on contract type
  let strikeResponse = `I'd like to propose $${defaultStrike}${unit} instead. That gives me better protection against price spikes.`
  let protectionResponse = `Yes, I'd like to increase it to $${defaultProtection} to cover more of my expenses.`
  let expiryResponse = `Can we extend it to ${new Date(defaultExpiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}? I need a longer protection window.`

  if (contract.id.startsWith('wheat')) {
    strikeResponse = `I'd like to propose $${defaultStrike}${unit} instead. That provides better coverage for my flour costs.`
    protectionResponse = `Yes, I'd like to increase it to $${defaultProtection} to better protect my bakery operations.`
  } else if (contract.id.startsWith('eur')) {
    strikeResponse = `I'd like to propose ${defaultStrike} instead. That gives me better protection against currency fluctuations.`
    protectionResponse = `Yes, I'd like to increase it to $${defaultProtection} to cover more of my international transactions.`
  } else if (contract.id.startsWith('oil')) {
    strikeResponse = `I'd like to propose $${defaultStrike}${unit} instead. That provides better protection for my fuel costs.`
    protectionResponse = `Yes, I'd like to increase it to $${defaultProtection} to better cover my transportation expenses.`
  } else if (contract.id.startsWith('coffee')) {
    strikeResponse = `I'd like to propose $${defaultStrike}${unit} instead. That gives me better protection against coffee price volatility.`
    protectionResponse = `Yes, I'd like to increase it to $${defaultProtection} to cover more of my coffee purchasing needs.`
  }

  return [
    {
      assistant: `I'll help you negotiate better terms with ${contract.counterparty}. Let's start with the strike price. The current contract offers $${originalStrike}${unit}. What strike price would work better for your business?`,
      user: strikeResponse,
      delay: 2000,
      action: (setOffer: any) => {
        setOffer((prev: NegotiationOffer) => ({ ...prev, strikePrice: defaultStrike }))
      }
    },
    {
      assistant: `Good choice at $${defaultStrike}${unit}. Now, what about the protection amount? The original contract offers $${contract.payout.toLocaleString()}. Would you like to adjust this?`,
      user: protectionResponse,
      delay: 2500,
      action: (setOffer: any) => {
        setOffer((prev: NegotiationOffer) => ({ ...prev, protectionAmount: defaultProtection.replace(/,/g, ''), cost: defaultCost }))
      }
    },
    {
      assistant: `That means your cost would be around $${defaultCost} (10% deposit). The original expiry is ${contract.expiry}. Would you like to adjust the timeline?`,
      user: expiryResponse,
      delay: 2000,
      action: (setOffer: any) => {
        setOffer((prev: NegotiationOffer) => ({ ...prev, expiry: defaultExpiry }))
      }
    },
    {
      assistant: `Perfect! I'll send your proposal to ${contract.counterparty}: $${defaultStrike}${unit} strike price, $${defaultProtection} protection, $${defaultCost} cost, expiring ${new Date(defaultExpiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Let me submit this...`,
      user: null,
      delay: 1500,
      action: (setShowButtons: any) => {
        setShowButtons(true)
      }
    }
  ]
}

function NegotiationChatFlow({ 
  contract,
  onComplete 
}: { 
  contract: any
  onComplete: (offer: NegotiationOffer, outcome: 'accepted' | 'rejected' | 'counter', counterOffer?: NegotiationOffer) => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  
  const config = getContractConfig(contract.id, contract.title)
  const originalStrike = config.getStrikePrice(contract.title)
  const defaultStrike = config.getDefaultStrikePrice(originalStrike)
  const defaultProtection = config.getDefaultProtection(contract.payout)
  const defaultCost = config.getDefaultCost(defaultProtection)
  const defaultExpiry = config.getDefaultExpiry(contract.expiry)

  const [negotiatedOffer, setNegotiatedOffer] = useState<NegotiationOffer>({
    strikePrice: defaultStrike,
    protectionAmount: defaultProtection.replace(/,/g, ''),
    cost: defaultCost,
    expiry: defaultExpiry,
    reasoning: ''
  })

  const conversationFlow = useMemo(() => {
    return generateConversationFlow(contract, config)
  }, [contract, config])

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
          step.action(setNegotiatedOffer)
          if (i === conversationFlow.length - 1) {
            step.action(setShowButtons)
          }
        }
      }
    }

    startConversation()
  }, [conversationFlow])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendProposal = () => {
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: 'Sending proposal to ' + contract.counterparty + '...' 
    }])
    setShowButtons(false)

    // Simulate sending and waiting for response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Waiting for response...' 
      }])
      
      // Simulate counterparty decision after 4 seconds
      setTimeout(() => {
        const response = Math.random()
        const unit = config.unit
        const counterStrike = (parseFloat(defaultStrike) - 0.02).toFixed(2)
        const counterProtection = (parseInt(defaultProtection.replace(/,/g, '')) - 500).toString()
        const counterCost = Math.round(parseInt(counterProtection) * 0.1).toString()
        
        if (response < 0.33) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Great news! ${contract.counterparty} accepted your proposal. The contract is ready to proceed.` 
          }])
          setTimeout(() => onComplete(negotiatedOffer, 'accepted'), 2000)
        } else if (response < 0.66) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Unfortunately, ${contract.counterparty} rejected your proposal. You can try negotiating again with different terms.` 
          }])
          setTimeout(() => onComplete(negotiatedOffer, 'rejected'), 2000)
        } else {
          const counterOffer: NegotiationOffer = {
            strikePrice: counterStrike,
            protectionAmount: counterProtection,
            cost: counterCost,
            expiry: defaultExpiry,
            reasoning: 'We can agree to these terms with a slightly adjusted strike price and amount.'
          }
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `${contract.counterparty} sent a counter-offer: $${counterStrike}${unit} strike, $${parseInt(counterProtection).toLocaleString()} protection, $${counterCost} cost, ${new Date(defaultExpiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} expiry. They said: "${counterOffer.reasoning}"` 
          }])
          setTimeout(() => onComplete(negotiatedOffer, 'counter', counterOffer), 2000)
        }
      }, 4000)
    }, 1000)
  }

  const unit = config.unit
  const displayUnit = contract.id.startsWith('eur') ? '' : unit

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
                    : message.role === 'system'
                    ? 'bg-yellow-600/20 text-yellow-100 border border-yellow-500/30'
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

      {/* Proposal Summary */}
      {showButtons && (
        <div className="card bg-blue-600/10 border-blue-500 backdrop-blur-sm animate-fade-in">
          <p className="text-sm text-blue-100 mb-4">
            <strong>Your Proposal:</strong>
          </p>
          <div className="text-sm text-blue-100 space-y-2 mb-6">
            <p>• Strike Price: ${negotiatedOffer.strikePrice}{displayUnit}</p>
            <p>• Protection Amount: ${parseInt(negotiatedOffer.protectionAmount).toLocaleString()}</p>
            <p>• Your Cost: ${negotiatedOffer.cost}</p>
            <p>• Expiry: {new Date(negotiatedOffer.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <button 
            onClick={handleSendProposal}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Proposal to {contract.counterparty}
          </button>
        </div>
      )}
    </div>
  )
}

export default function NegotiatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { contracts } = useContracts()
  const [step, setStep] = useState<NegotiationStep>('propose')
  const [offer, setOffer] = useState<NegotiationOffer | null>(null)
  const [counterOffer, setCounterOffer] = useState<NegotiationOffer | null>(null)
  
  // Find the contract from context
  const contract = contracts.find(c => c.id === params.id)
  
  if (!contract) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center">
              <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
              <p className="text-gray-400 mb-6">The contract you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/marketplace" className="btn-primary">
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const config = getContractConfig(contract.id, contract.title)
  const unit = config.unit
  const displayUnit = contract.id.startsWith('eur') ? '' : unit

  const handleNegotiationComplete = (
    negotiatedOffer: NegotiationOffer, 
    outcome: 'accepted' | 'rejected' | 'counter',
    counter?: NegotiationOffer
  ) => {
    setOffer(negotiatedOffer)
    setStep(outcome)
    if (counter) {
      setCounterOffer(counter)
    }
  }

  const handleCounterResponse = (action: 'accept' | 'reject') => {
    if (action === 'accept') {
      // Update offer to use counter-offer values when accepting
      if (counterOffer) {
        setOffer(counterOffer)
      }
      setStep('accepted')
    } else {
      setStep('rejected')
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/marketplace" 
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <h1 className="text-4xl font-bold mb-2">Negotiate Contract Terms</h1>
            <p className="text-gray-400">{contract.title}</p>
            <p className="text-sm text-gray-500">Counterparty: {contract.counterparty} ({contract.location})</p>
          </div>

          {/* Propose Terms with Chat Interface */}
          {step === 'propose' && (
            <NegotiationChatFlow 
              contract={contract}
              onComplete={handleNegotiationComplete}
            />
          )}

          {/* Received Counter-Offer */}
          {step === 'counter' && counterOffer && (
            <div className="space-y-6 animate-fade-in">
              <div className="card border-yellow-500">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-yellow-400" />
                  Counter-Offer Received
                </h2>
                <p className="text-gray-400 mb-6">
                  {contract.counterparty} has sent you a counter-proposal. Review the terms and decide how to respond.
                </p>

                <div className="bg-slate-700/50 p-6 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Proposed Terms:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Strike Price</p>
                      <p className="text-xl font-semibold">${counterOffer.strikePrice}{displayUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Protection Amount</p>
                      <p className="text-xl font-semibold">${parseInt(counterOffer.protectionAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Your Cost</p>
                      <p className="text-xl font-semibold text-red-400">${counterOffer.cost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expiry</p>
                      <p className="text-xl font-semibold">{new Date(counterOffer.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {counterOffer.reasoning && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-sm text-gray-400 mb-2">Their Reasoning:</p>
                      <p className="text-gray-300 italic">&ldquo;{counterOffer.reasoning}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCounterResponse('reject')}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleCounterResponse('accept')}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accepted */}
          {step === 'accepted' && offer && (
            <div className="card text-center border-green-500 animate-fade-in">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Agreement Reached! 🎉</h2>
              <p className="text-gray-300 mb-8">
                {contract.counterparty} has accepted your terms. The contract is now ready to be finalized.
              </p>

              <div className="bg-slate-700/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-4">Final Terms:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-gray-400">Strike Price</p>
                    <p className="text-xl font-semibold">${offer.strikePrice}{displayUnit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Protection Amount</p>
                    <p className="text-xl font-semibold">${parseInt(offer.protectionAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Your Cost</p>
                    <p className="text-xl font-semibold text-red-400">${offer.cost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Expiry</p>
                    <p className="text-xl font-semibold">{new Date(offer.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/marketplace')}
                  className="btn-secondary"
                >
                  Back to Marketplace
                </button>
                <button
                  onClick={() => {
                    // Calculate cost from the negotiated offer
                    const cost = offer ? parseInt(offer.cost) : contract.cost
                    const payout = offer ? parseInt(offer.protectionAmount) : contract.payout
                    const expiry = offer ? new Date(offer.expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : contract.expiry
                    
                    // Save purchase
                    purchaseContract({
                      id: contract.id,
                      title: contract.title,
                      position: contract.position,
                      cost: cost,
                      payout: payout,
                      expiry: expiry,
                      counterparty: contract.counterparty
                    })
                    
                    alert('✅ Smart contract deployed! Position added to your dashboard.')
                    setTimeout(() => router.push('/dashboard'), 1500)
                  }}
                  className="btn-primary"
                >
                  Execute Contract
                </button>
              </div>
            </div>
          )}

          {/* Rejected */}
          {step === 'rejected' && (
            <div className="card text-center border-red-500 animate-fade-in">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Negotiation Ended</h2>
              <p className="text-gray-300 mb-8">
                {contract.counterparty} has declined your proposal. You can try the original contract terms or look for other opportunities in the marketplace.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep('propose')}
                  className="btn-secondary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="btn-primary"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
