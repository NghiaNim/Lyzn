'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

type NegotiationStep = 'propose' | 'waiting' | 'received' | 'counter' | 'accepted' | 'rejected'

interface NegotiationOffer {
  strikePrice: string
  protectionAmount: string
  cost: string
  expiry: string
  reasoning: string
}

export default function NegotiatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [step, setStep] = useState<NegotiationStep>('propose')
  const [offer, setOffer] = useState<NegotiationOffer>({
    strikePrice: '0.55',
    protectionAmount: '5000',
    cost: '500',
    expiry: '2026-05',
    reasoning: ''
  })
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

  const handleSendProposal = () => {
    // Simulate sending to counterparty
    setTimeout(() => {
      setStep('waiting')
      // Simulate counterparty response after 6 seconds (slower for better processing)
      setTimeout(() => {
        // Random: accept, reject, or counter
        const response = Math.random()
        if (response < 0.33) {
          setStep('accepted')
        } else if (response < 0.66) {
          setStep('rejected')
        } else {
          setCounterOffer({
            strikePrice: '0.57',
            protectionAmount: '4500',
            cost: '475',
            expiry: '2026-04',
            reasoning: 'We can agree to these terms with a slightly higher strike price of $0.57/lb and April expiry to reduce our risk exposure. This still provides you good protection.'
          })
          setStep('received')
        }
      }, 6000)
    }, 500)
  }

  const handleCounterResponse = (action: 'accept' | 'reject' | 'counter') => {
    if (action === 'accept') {
      setStep('accepted')
    } else if (action === 'reject') {
      setStep('rejected')
    } else {
      setStep('counter')
    }
  }

  const handleSendCounter = () => {
    setStep('waiting')
    setTimeout(() => {
      setStep('accepted')
    }, 5000)
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

          {/* Propose Terms */}
          {step === 'propose' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card">
                <h2 className="text-2xl font-semibold mb-4">Propose Your Terms</h2>
                <p className="text-gray-400 mb-6">
                  Submit a counter-offer to {contract.counterparty}. They will review and can accept, reject, or send a counter-proposal.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Strike Price ($/lb)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={offer.strikePrice}
                      onChange={(e) => setOffer({ ...offer, strikePrice: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Original: ${contract.originalStrikePrice}/lb</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Protection Amount ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={offer.protectionAmount}
                      onChange={(e) => setOffer({ ...offer, protectionAmount: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Original: ${contract.originalPayout}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Cost ($)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={offer.cost}
                      onChange={(e) => setOffer({ ...offer, cost: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Original: ${contract.originalCost}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="month"
                      value={offer.expiry}
                      onChange={(e) => setOffer({ ...offer, expiry: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Original: {contract.expiry}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reasoning (Optional)
                    </label>
                    <textarea
                      value={offer.reasoning}
                      onChange={(e) => setOffer({ ...offer, reasoning: e.target.value })}
                      className="input-field"
                      rows={4}
                      placeholder="Explain why these terms work better for your business..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendProposal}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Proposal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Response */}
          {step === 'waiting' && (
            <div className="card text-center animate-fade-in">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Proposal Sent</h2>
              <p className="text-gray-400 mb-6">
                Waiting for {contract.counterparty} to review your proposal...
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleCounterResponse('reject')}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleCounterResponse('counter')}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Counter Again
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

          {/* Send Counter-Counter */}
          {step === 'counter' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card">
                <h2 className="text-2xl font-semibold mb-4">Send Counter-Proposal</h2>
                <p className="text-gray-400 mb-6">
                  Make another counter-offer with your preferred terms and explain your reasoning.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Strike Price ($/lb)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={offer.strikePrice}
                      onChange={(e) => setOffer({ ...offer, strikePrice: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Protection Amount ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={offer.protectionAmount}
                      onChange={(e) => setOffer({ ...offer, protectionAmount: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Cost ($)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={offer.cost}
                      onChange={(e) => setOffer({ ...offer, cost: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reasoning
                    </label>
                    <textarea
                      value={offer.reasoning}
                      onChange={(e) => setOffer({ ...offer, reasoning: e.target.value })}
                      className="input-field"
                      rows={4}
                      placeholder="Explain why these terms work better..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setStep('received')}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSendCounter}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Counter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accepted */}
          {step === 'accepted' && (
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

