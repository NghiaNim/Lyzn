'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle, XCircle, MessageSquare, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
  const [negotiatedOffer, setNegotiatedOffer] = useState<NegotiationOffer>({
    strikePrice: '0.60',
    protectionAmount: '6000',
    cost: '600',
    expiry: '2026-06',
    reasoning: ''
  })

  const conversationFlow = useMemo(() => [
    {
      assistant: `I'll help you negotiate better terms with ${contract.counterparty}. Let's start with the strike price. The current contract offers $${contract.originalStrikePrice}/lb. What strike price would work better for your business?`,
      user: "I'd like to propose $0.60/lb instead. That gives me better protection against price spikes.",
      delay: 2000,
      action: () => {
        setNegotiatedOffer(prev => ({ ...prev, strikePrice: '0.60' }))
      }
    },
    {
      assistant: `Good choice at $0.60/lb. Now, what about the protection amount? The original contract offers $${contract.originalPayout}. Would you like to adjust this?`,
      user: "Yes, I'd like to increase it to $6,000 to cover more of my expenses.",
      delay: 2500,
      action: () => {
        setNegotiatedOffer(prev => ({ ...prev, protectionAmount: '6000', cost: '600' }))
      }
    },
    {
      assistant: "That means your cost would be around $600 (10% deposit). The original expiry is " + contract.expiry + ". Would you like to adjust the timeline?",
      user: "Can we extend it to June 2026? I need a longer protection window.",
      delay: 2000,
      action: () => {
        setNegotiatedOffer(prev => ({ ...prev, expiry: '2026-06' }))
      }
    },
    {
      assistant: `Perfect! I'll send your proposal to ${contract.counterparty}: $0.60/lb strike price, $6,000 protection, $600 cost, expiring June 2026. Let me submit this...`,
      user: null,
      delay: 1500,
      action: () => {
        setShowButtons(true)
      }
    }
  ], [contract.counterparty, contract.originalStrikePrice, contract.originalPayout, contract.expiry])

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
            strikePrice: '0.57',
            protectionAmount: '5500',
            cost: '550',
            expiry: '2026-05',
            reasoning: 'We can agree to these terms with a slightly adjusted strike price and amount.'
          }
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `${contract.counterparty} sent a counter-offer: $0.57/lb strike, $5,500 protection, $550 cost, May 2026 expiry. They said: "${counterOffer.reasoning}"` 
          }])
          setTimeout(() => onComplete(negotiatedOffer, 'counter', counterOffer), 2000)
        }
      }, 4000)
    }, 1000)
  }

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
            <p>• Strike Price: ${negotiatedOffer.strikePrice}/lb</p>
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
  const [step, setStep] = useState<NegotiationStep>('propose')
  const [offer, setOffer] = useState<NegotiationOffer | null>(null)
  const [counterOffer, setCounterOffer] = useState<NegotiationOffer | null>(null)
  
  // Mock contract data
  const contract = {
    id: params.id,
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    category: 'Commodities',
    counterparty: 'Sugar Refinery',
    location: 'Louisiana',
    originalStrikePrice: '0.55',
    originalCost: '450',
    originalPayout: '1000',
    expiry: 'May 2026'
  }

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
          {step === 'received' && counterOffer && (
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
                      <p className="text-xl font-semibold">${counterOffer.strikePrice}/lb</p>
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
                    <p className="text-xl font-semibold">${offer.strikePrice}/lb</p>
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
                  onClick={() => router.push(`/contract/${params.id}`)}
                  className="btn-primary"
                >
                  Proceed to Purchase
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

