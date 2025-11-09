'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Info, Loader2, Send, CheckCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ContractData {
  commodity: string
  strikePrice: string
  expiry: string
  position: 'YES' | 'NO'
  protectionAmount: string
}

function ContractCreationChat({ 
  onComplete, 
  initialRisk 
}: { 
  onComplete: (data: ContractData) => void
  initialRisk: string
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [contractData, setContractData] = useState<ContractData>({
    commodity: initialRisk === 'sugar' ? 'Sugar' : initialRisk === 'wheat' ? 'Wheat' : '',
    strikePrice: '',
    expiry: '',
    position: 'YES',
    protectionAmount: ''
  })

  const conversationFlow = useMemo(() => [
    {
      assistant: initialRisk 
        ? `I see you're interested in hedging ${initialRisk} price risk. Let me help you create a custom contract. What strike price would you like to set?`
        : "I'll help you create a custom hedge contract. First, what commodity or risk would you like to protect against?",
      user: initialRisk ? "I'd like to set the strike at $0.60 per pound." : "I need to hedge against sugar price increases.",
      delay: 2000,
      action: () => {
        if (!initialRisk) {
          setContractData(prev => ({ ...prev, commodity: 'Sugar' }))
        } else {
          setContractData(prev => ({ ...prev, strikePrice: '0.60' }))
        }
      }
    },
    {
      assistant: initialRisk 
        ? "Great! $0.60/lb for the strike price. Now, when would you like this contract to expire?"
        : "Perfect, sugar it is. What strike price threshold works for your business? This is the price point that triggers the payout.",
      user: initialRisk ? "Let's set it to expire in June 2026." : "I think $0.60 per pound would work well.",
      delay: 2000,
      action: () => {
        if (initialRisk) {
          setContractData(prev => ({ ...prev, expiry: '2026-06' }))
        } else {
          setContractData(prev => ({ ...prev, strikePrice: '0.60' }))
        }
      }
    },
    {
      assistant: initialRisk 
        ? "June 2026 expiry noted. Now, would you like a YES position (get paid if price goes above $0.60) or NO position (get paid if it stays below)?"
        : "Good choice at $0.60/lb. When should this contract expire?",
      user: initialRisk ? "I'll take the YES position—I want protection if prices rise." : "June 2026 would be ideal for my planning cycle.",
      delay: 2500,
      action: () => {
        if (initialRisk) {
          setContractData(prev => ({ ...prev, position: 'YES' }))
        } else {
          setContractData(prev => ({ ...prev, expiry: '2026-06' }))
        }
      }
    },
    {
      assistant: initialRisk 
        ? "YES position selected. Finally, what protection amount do you need? This is how much you'd receive if the price exceeds $0.60."
        : "Perfect. Do you want a YES position (paid if price rises above strike) or NO position (paid if it stays below)?",
      user: initialRisk ? "I'd like $8,000 in protection to cover my exposure." : "YES position—I need protection against price increases.",
      delay: 2000,
      action: () => {
        if (initialRisk) {
          setContractData(prev => ({ ...prev, protectionAmount: '8000' }))
        } else {
          setContractData(prev => ({ ...prev, position: 'YES' }))
        }
      }
    },
    {
      assistant: initialRisk 
        ? "Excellent! I've got all the details. Let me generate your contract..."
        : "Great choice. And what protection amount do you need? This is your potential payout if conditions are met.",
      user: initialRisk ? null : "I'd like $8,000 in coverage.",
      delay: initialRisk ? 1500 : 2000,
      action: () => {
        if (!initialRisk) {
          setContractData(prev => ({ ...prev, protectionAmount: '8000' }))
        }
        if (initialRisk) {
          setShowButtons(true)
        }
      }
    },
    ...(initialRisk ? [] : [{
      assistant: "Perfect! I have everything I need. Let me generate your custom contract...",
      user: null,
      delay: 1500,
      action: () => {
        setShowButtons(true)
      }
    }])
  ], [initialRisk])

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

  const handleGenerate = () => {
    onComplete(contractData)
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

      {/* Contract Summary */}
      {showButtons && (
        <div className="card bg-blue-600/10 border-blue-500 backdrop-blur-sm animate-fade-in">
          <p className="text-sm text-blue-100 mb-4">
            <strong>Your Contract Details:</strong>
          </p>
          <div className="text-sm text-blue-100 space-y-2 mb-6">
            <p>• Commodity: {contractData.commodity}</p>
            <p>• Strike Price: ${contractData.strikePrice}/lb</p>
            <p>• Position: {contractData.position} (Get paid if price {contractData.position === 'YES' ? 'rises above' : 'stays below'} strike)</p>
            <p>• Protection Amount: ${parseInt(contractData.protectionAmount).toLocaleString()}</p>
            <p>• Your Cost: ${Math.round(parseInt(contractData.protectionAmount) * 0.1).toLocaleString()} (10% deposit)</p>
            <p>• Expiry: {new Date(contractData.expiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <button 
            onClick={handleGenerate}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Contract with AI
          </button>
        </div>
      )}
    </div>
  )
}

function CreateContractForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const risk = searchParams.get('risk') || ''

  const [step, setStep] = useState<'chat' | 'review'>('chat')
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [generatedContract, setGeneratedContract] = useState<any>(null)

  const handleChatComplete = (data: ContractData) => {
    setContractData(data)
    // Simulate AI generation
    const contract = {
      title: `Will ${data.commodity.toLowerCase()} exceed $${data.strikePrice} by ${data.expiry}?`,
      position: data.position,
      protectionAmount: data.protectionAmount,
      cost: Math.round(parseFloat(data.protectionAmount) * 0.1),
      oracle: data.commodity === 'Sugar' ? 'USDA Agricultural Prices API' : 
              data.commodity === 'Wheat' ? 'CME Group Market Data' : 
              'Chainlink Price Feed',
      settlement: 'Automatic via smart contract',
      collateral: Math.round(parseFloat(data.protectionAmount) * 0.15),
    }
    setGeneratedContract(contract)
    setStep('review')
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

          {step === 'chat' && (
            <ContractCreationChat 
              onComplete={handleChatComplete}
              initialRisk={risk}
            />
          )}

          {step === 'review' && generatedContract && (
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
                      <li>At expiry, oracle reports the actual {contractData?.commodity} price</li>
                      <li>Smart contract automatically calculates and transfers payout</li>
                      <li>No manual intervention needed—100% trustless</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('chat')} className="btn-secondary flex-1">
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

export default function CreateContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Create Custom Contract</h1>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CreateContractForm />
    </Suspense>
  )
}

