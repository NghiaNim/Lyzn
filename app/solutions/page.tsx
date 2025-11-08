'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Coffee, Wheat, Fuel, DollarSign, TrendingUp, Building } from 'lucide-react'

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center">Solutions by Industry</h1>
          <p className="text-xl text-gray-300 text-center mb-16">
            Tailored risk management for every business type
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Food & Beverage */}
            <div className="card">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Coffee className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Food & Beverage</h2>
              <p className="text-gray-300 mb-4">
                Hedge against commodity price spikes for ingredients like sugar, coffee, wheat, and dairy.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Bakeries hedge sugar and wheat prices</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Coffee shops protect against coffee price volatility</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Restaurants manage multiple ingredient costs</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>

            {/* Agriculture */}
            <div className="card">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Wheat className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Agriculture</h2>
              <p className="text-gray-300 mb-4">
                Protect farm revenues from commodity price drops and input cost increases.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Farmers lock in minimum prices for crops</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Hedge against fertilizer and seed cost spikes</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Manage weather-related price volatility</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>

            {/* Transportation */}
            <div className="card">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Fuel className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Transportation & Logistics</h2>
              <p className="text-gray-300 mb-4">
                Lock in fuel costs and protect margins from oil price fluctuations.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Trucking companies hedge diesel prices</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Delivery services stabilize fuel budgets</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Fleet operators manage energy costs</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>

            {/* Import/Export */}
            <div className="card">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Import/Export</h2>
              <p className="text-gray-300 mb-4">
                Manage currency risk and stabilize international transaction costs.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Importers hedge against currency appreciation</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Exporters protect from currency depreciation</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">E-commerce businesses manage FX exposure</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>

            {/* Manufacturing */}
            <div className="card">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Manufacturing</h2>
              <p className="text-gray-300 mb-4">
                Stabilize input costs for metals, plastics, energy, and raw materials.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Hedge steel and aluminum price volatility</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Lock in electricity and natural gas rates</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Protect margins from input cost spikes</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>

            {/* Construction */}
            <div className="card">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Construction</h2>
              <p className="text-gray-300 mb-4">
                Manage lumber, steel, and fuel costs for better project budgeting.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Lock in material costs at contract signing</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Hedge fuel for equipment and transport</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-300">Protect project profitability</span>
                </div>
              </div>
              <Link href="/chat" className="btn-primary inline-block">
                Get Started
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="card bg-gradient-to-r from-blue-600 to-blue-800 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See Your Industry?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Our AI can identify and hedge risks for any business type
            </p>
            <Link href="/chat" className="btn-secondary bg-white text-blue-600 hover:bg-gray-100 inline-block">
              Chat with AI to Explore Your Options
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

