'use client'

import Navigation from '@/components/Navigation'
import { Users, Target, Lightbulb } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center">About LYZN</h1>
          <p className="text-xl text-gray-300 text-center mb-16">
            Bringing institutional hedging to Main Street
          </p>

          <div className="space-y-12">
            <section className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-gray-300 leading-relaxed">
                    33.2 million US small businesses (99.9% of all businesses) face trillions in unhedged risk. 
                    The $600 trillion derivatives market is built for institutions, not them. LYZN exists to change that.
                    We're building a peer-to-peer marketplace where businesses can protect themselves from price 
                    volatility—just like Fortune 500 companies do.
                  </p>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">How We're Different</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Traditional derivatives require $100K+ minimums, complex financial expertise, and expensive 
                    legal agreements. LYZN uses AI to match businesses with natural counterparties and automates 
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

            <section className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Team</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Built at HackPrinceton by a team passionate about financial inclusion:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="font-semibold">Crystal Low</p>
                      <p className="text-sm text-gray-400">Co-founder</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="font-semibold">Angelina Yeh</p>
                      <p className="text-sm text-gray-400">Co-founder</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="font-semibold">Anna Zhang</p>
                      <p className="text-sm text-gray-400">Co-founder</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="font-semibold">Nghia Nim</p>
                      <p className="text-sm text-gray-400">Co-founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card bg-gradient-to-r from-blue-600 to-blue-800">
              <h2 className="text-2xl font-bold mb-3">Why Now?</h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                Three technologies converged to make LYZN possible:
              </p>
              <div className="space-y-3 text-blue-100">
                <div className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <div>
                    <strong>LLMs</strong> - Can translate "my sugar costs are killing me" into structured financial contracts
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
                    <strong>Regulatory Clarity</strong> - Kalshi's 2024 court victory legitimized event contracts
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

