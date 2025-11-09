'use client'

import Navigation from '@/components/Navigation'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you understand and manage your business risks. To get started, can you tell me a bit about your business? What type of business do you run?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)

  const conversationFlow = [
    {
      trigger: () => true,
      response: "Great! I'd love to understand your business better. What are your main ingredients, supplies, or operating costs?"
    },
    {
      trigger: (msg: string) => msg.length > 10,
      response: "Got it. How much do you typically spend on these each month? And which costs worry you the most?"
    },
    {
      trigger: (msg: string) => msg.length > 10,
      response: "I understand—price volatility can really impact your business. Let me analyze your risk profile...",
      action: () => {
        setTimeout(() => {
          router.push('/risks')
        }, 2000)
      }
    }
  ]

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI typing delay
    setTimeout(() => {
      if (step < conversationFlow.length) {
        const flow = conversationFlow[step]
        const assistantMessage: Message = {
          role: 'assistant',
          content: flow.response
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        setStep(step + 1)
        
        if (flow.action) {
          flow.action()
        }
      }
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">AI Risk Assessment</h1>
            <p className="text-gray-400">Let&apos;s understand your business risks together</p>
          </div>

          {/* Chat Container */}
          <div className="card h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-100'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          AI
                        </div>
                        <span className="text-xs text-gray-400">LYZN Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-400">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="input-field"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="mt-6 card">
            <h3 className="font-semibold mb-3 text-sm text-gray-400">Example responses:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInput("I run a bakery in Brooklyn")}
                className="text-sm px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                I run a bakery in Brooklyn
              </button>
              <button
                onClick={() => setInput("We use a lot of sugar, wheat flour, and butter. Also diesel for delivery.")}
                className="text-sm px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Our main costs are sugar, flour, and fuel
              </button>
              <button
                onClick={() => setInput("Sugar costs about $2,000/month. Last year prices spiked 40% and we almost went under.")}
                className="text-sm px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Sugar price spikes are killing us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

