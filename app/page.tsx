'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { TrendingUp, Shield, Users, Zap, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Peer-to-Peer Risk Management<br />
              <span className="text-blue-400">for Small Businesses</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Bringing Wall Street's hedging tools to Main Street through event contracts.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/demo" className="btn-primary text-lg inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Watch Demo
              </Link>
              <Link href="/chat" className="btn-secondary text-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center">The Problem</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 mb-6">
              Small businesses get crushed by price volatility they can't control. When a bakery's sugar costs spike 40%, their margins evaporate. When a restaurant's currency costs swing, they can't forecast expenses.
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Unlike Fortune 500 companies, SMEs have <span className="text-red-400 font-semibold">no way to protect themselves</span>:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span className="text-gray-300">Derivatives markets require $100K+ minimums</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span className="text-gray-300">Too complex—requires financial expertise they don't have</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span className="text-gray-300">No way to find natural counterparties</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✗</span>
                <span className="text-gray-300">Expensive legal costs for bilateral agreements</span>
              </li>
            </ul>
            <div className="card text-center">
              <p className="text-2xl font-semibold text-blue-400">
                33.2 million US SMEs face trillions in unhedged risk
              </p>
              <p className="text-gray-400 mt-2">
                The $600 trillion derivatives market is built for institutions, not them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">How LYZN Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. AI Risk Assessment</h3>
              <p className="text-gray-400">
                Chat with AI about your business. It identifies your key price exposures and suggests specific risks to hedge.
              </p>
            </div>
            
            <div className="card">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Browse Contracts</h3>
              <p className="text-gray-400">
                See contracts from other businesses that match your needs. Buy directly or negotiate better terms.
              </p>
            </div>
            
            <div className="card">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Create or Match</h3>
              <p className="text-gray-400">
                If no contract fits, create your own. AI handles structure, pricing, and oracle selection.
              </p>
            </div>
            
            <div className="card">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">4. Auto Settlement</h3>
              <p className="text-gray-400">
                Smart contracts hold funds in escrow and pay out automatically—no manual intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Protect Your Business?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of small businesses hedging their risks with LYZN
          </p>
          <Link href="/chat" className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
            Start Your Risk Assessment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-2">Built at HackPrinceton</p>
          <p>Team: Crystal Low, Angelina Yeh, Anna Zhang, Nghia Nim</p>
          <p className="mt-4">Contact: nghia.nim@columbia.edu</p>
        </div>
      </footer>
    </div>
  )
}

