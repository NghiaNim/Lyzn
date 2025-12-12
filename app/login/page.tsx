'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
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
        <div className="max-w-md mx-auto">
          <div className="card bg-slate-900/50 backdrop-blur-sm border-slate-800">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Business Login</h1>
              <p className="text-gray-400">Access your Parity dashboard</p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input-field pl-10"
                  />
                </div>
                <div className="text-right mt-2">
                  <a href="#" className="text-sm text-blue-400 hover:text-blue-300 italic">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded bg-slate-700 border-gray-600"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                  I&apos;m not a robot
                </label>
              </div>

              <button type="submit" className="btn-primary w-full">
                Login
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400 italic">
                Not registered?{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

