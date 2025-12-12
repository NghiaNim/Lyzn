'use client'

import Navigation from '@/components/Navigation'
import { Users, Target, Lightbulb } from 'lucide-react'

export default function AboutPage() {
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
      
      <div className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center">About Parity</h1>
          <p className="text-xl text-gray-300 text-center mb-16">
            Bringing institutional hedging to Main Street
          </p>

          <div className="space-y-12">
            <section className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-gray-300 leading-relaxed">
                    33.2 million US small businesses (99.9% of all businesses) face trillions in unhedged risk. 
                    The $600 trillion derivatives market is built for institutions, not them. Parity exists to change that.
                    We&apos;re building a peer-to-peer marketplace where businesses can protect themselves from price 
                    volatility—just like Fortune 500 companies do.
                  </p>
                </div>
              </div>
            </section>

            <section className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">How We&apos;re Different</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Traditional derivatives require $100K+ minimums, complex financial expertise, and expensive 
                    legal agreements. Parity uses AI to match businesses with natural counterparties and automates 
                    everything with smart contracts.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>No minimums - protect any amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>AI handles complexity - no financial expertise needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Automatic settlement - trustless smart contracts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>1% fee vs 2-5% traditional derivatives desks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="card bg-slate-900/40 backdrop-blur-sm border-slate-800">
              <h2 className="text-2xl font-bold mb-3">Why Now?</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Three technologies converged to make Parity possible:
              </p>
              <div className="space-y-3 text-gray-300">
                <div className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <div>
                    <strong>LLMs</strong> - Can translate &ldquo;my sugar costs are killing me&rdquo; into structured financial contracts
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <div>
                    <strong>Smart Contracts</strong> - Provide trustless escrow at near-zero cost
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <div>
                    <strong>Regulatory Clarity</strong> - Kalshi&apos;s 2024 court victory legitimized event contracts
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

