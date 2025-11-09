'use client'

import Navigation from '@/components/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Send, Loader2, TrendingUp, AlertCircle, DollarSign } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

export default function ChatDemoPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showRisks, setShowRisks] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
  const conversationStep = useRef(0)

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
      assistant: "Hi! I'm here to help you understand and protect your business from price risks. Can you tell me a bit about your business?",
      user: "We're Sweet Treats Bakery, a commercial bakery in Brooklyn. We make cupcakes, cookies, and other pastries.",
      delay: 2000
    },
    {
      assistant: "Nice to meet you, Sweet Treats! I'd love to understand your operations better. What are your biggest cost inputs?",
      user: "Our main costs are sugar, flour, and butter. We spend about $2,000 a month on sugar alone.",
      delay: 2500
    },
    {
      assistant: "That's a significant expense. How do price changes in sugar affect your margins?",
      user: "It's really tough. Last year when sugar prices spiked 40%, our margins dropped from 25% to just 8%. We almost went out of business.",
      delay: 3000
    },
    {
      assistant: "I understand how stressful that must have been. Price volatility can really threaten small businesses like yours. Let me analyze your risk profile...",
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
    const risk = riskOptions.find(r => r.id === riskId)
    
    setTimeout(() => {
      setMessages(prev => [...prev, 
        { role: 'user', content: `I'd like to protect against ${risk?.commodity.toLowerCase()} price increases.` },
        { role: 'assistant', content: `Perfect choice! ${risk?.commodity} price protection makes a lot of sense for your business. Let me create a custom contract for you...` }
      ])
      
      setTimeout(() => {
        router.push(`/create?risk=${riskId}`)
      }, 2000)
    }, 500)
  }

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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/doughnuts-1868573_1280.jpg"
                alt="Sweet Treats Bakery"
                width={120}
                height={120}
                className="rounded-full object-cover"
                style={{ width: '120px', height: '120px' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-white">Sweet Treats Bakery</h1>
            <p className="text-gray-400">Brooklyn, New York</p>
          </div>

          {/* Chat Container */}
          <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800 h-[500px] flex flex-col mb-6">
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
          {showRisks && !selectedRisk && (
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
                      <button className="w-full btn-primary text-sm py-2">
                        Select This Risk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRisk && (
            <div className="text-center animate-fade-in">
              <div className="card bg-green-600/10 border-green-500 backdrop-blur-sm">
                <p className="text-green-100">
                  Great choice! Redirecting you to create your protection contract...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

