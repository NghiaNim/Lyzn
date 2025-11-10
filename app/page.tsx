'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { TrendingUp, Shield, Users, Zap, Sparkles, ArrowRight, BarChart3, Lock, Globe } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const bgImageRef = useRef(null)

  useEffect(() => {
    // Hero animations
    const ctx = gsap.context(() => {
      // Background image reveal animation - curtain opening from center
      if (bgImageRef.current) {
        gsap.fromTo(bgImageRef.current,
          {
            clipPath: 'inset(0% 50% 0% 50%)'
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 3,
            ease: 'power2.inOut',
            delay: 0.3
          }
        )
      }
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2
      })

      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        delay: 0.5
      })

      gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.8
      })

      // Floating animation for decorative elements
      gsap.to('.float-element', {
        y: -20,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1
      })

      // Stats counter animation - smooth count up effect
      counterRefs.current.forEach((counter, index) => {
        if (!counter) return
        
        const target = parseInt(counter.getAttribute('data-target') || '0')
        const suffix = counter.getAttribute('data-suffix') || ''
        
        // Set initial value
        counter.innerHTML = '0' + suffix
        
        ScrollTrigger.create({
          trigger: counter,
          start: 'top 85%',
          onEnter: () => {
            const obj = { value: 0 }
            gsap.to(obj, {
              value: target,
              duration: 2.8,
              ease: 'expo.out',
              delay: index * 0.1,
              onUpdate: function() {
                const currentValue = Math.floor(obj.value)
                counter.innerHTML = currentValue.toLocaleString() + suffix
              }
            })
          },
          once: true
        })
      })

      // Fade in sections on scroll
      gsap.utils.toArray('.fade-in-section').forEach((section: any) => {
        gsap.from(section, {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })
      })

      // Card stagger animation
      gsap.utils.toArray('.stagger-card').forEach((card: any, i: number) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.15,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        })
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950" ref={heroRef}>
      <Navigation />
      
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          ref={bgImageRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/building-bg.jpg)',
            clipPath: 'inset(0% 50% 0% 50%)',
            willChange: 'clip-path'
          }}
        />
        <div className="absolute inset-0 bg-slate-950/30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/30"></div>
        {/* Grid pattern overlay for professional look */}
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

      {/* Decorative gradient overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl float-element"></div>
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float-element" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto relative z-10">
            <h1 className="hero-title text-7xl md:text-8xl font-normal mb-6 leading-tight tracking-tight">
              <span className="block text-white font-normal">Hedge Your</span>
              <span className="block text-white font-normal">
                Business Risk
              </span>
            </h1>
            
            <p className="hero-subtitle text-xl text-gray-300 mb-4 font-normal leading-relaxed max-w-3xl mx-auto tracking-wide italic">
              &ldquo;Risk Management Infrastructure for SMEs via Event Contracts&rdquo;
            </p>

            <p className="hero-subtitle text-xl text-gray-400 mb-16 font-light leading-relaxed max-w-3xl mx-auto">
              Bringing institutional-grade derivatives and hedging strategies to small and medium enterprises through AI-powered event contracts.
            </p>
            
            <div className="hero-cta flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center w-full max-w-2xl mx-auto px-4">
              <Link 
                href="/demo" 
                className="group relative px-6 sm:px-10 py-4 sm:py-5 bg-white text-slate-900 rounded-lg font-medium text-base sm:text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-blue-600 hover:text-white cursor-pointer text-center whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  View Demo
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              <Link 
                href="/chat" 
                className="group px-6 sm:px-10 py-4 sm:py-5 bg-slate-800/50 border border-slate-700 text-white rounded-lg font-medium text-base sm:text-lg backdrop-blur-sm transition-all duration-300 hover:bg-slate-800 hover:border-slate-600 text-center whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 fade-in-section z-10 bg-slate-900/40 backdrop-blur-sm" ref={statsRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/40"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 border-y border-slate-800 py-16">
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-3 tracking-tight">
                <span ref={el => { counterRefs.current[0] = el }} data-target="33" data-suffix="M+">0</span>
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-normal" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.15em' }}>US SMEs Unhedged</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-3 tracking-tight">
                $<span ref={el => { counterRefs.current[1] = el }} data-target="600" data-suffix="T">0</span>
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-normal" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.15em' }}>Global Derivatives Market</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-3 tracking-tight">
                <span ref={el => { counterRefs.current[2] = el }} data-target="99" data-suffix="%">0</span>
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-normal" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.15em' }}>Businesses Excluded</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-3 tracking-tight">
                <span ref={el => { counterRefs.current[3] = el }} data-target="1" data-suffix="%">0</span>
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-normal" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.15em' }}>Platform Fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative py-32 px-6 fade-in-section z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-normal text-white mb-6 tracking-tight">The Market Gap</h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Small businesses face trillions in unhedged risk, while the derivatives market remains exclusively institutional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="stagger-card bg-slate-900/50 border border-slate-800 rounded-2xl p-10 backdrop-blur-sm hover:border-slate-700 transition-all duration-300">
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <div className="text-3xl">⚠️</div>
              </div>
              <h3 className="text-2xl font-normal text-white mb-4">Traditional Barriers</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>$100,000+ minimum investment requirements</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>Complex financial instruments requiring expertise</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>No mechanism to discover natural counterparties</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>Expensive legal overhead for bilateral agreements</span>
                </li>
              </ul>
            </div>

            <div className="stagger-card bg-slate-900/50 border border-slate-800 rounded-2xl p-10 backdrop-blur-sm hover:border-slate-700 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-normal text-white mb-4">LYZN Solution</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>No minimums—protect any exposure amount</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>AI handles complexity and contract structuring</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>Automated counterparty matching via marketplace</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400">—</span>
                  <span>Smart contracts eliminate legal overhead</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="relative py-32 px-6 bg-slate-900/50 backdrop-blur-sm fade-in-section z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-normal text-white mb-6 tracking-tight">Platform Capabilities</h2>
            <p className="text-xl text-gray-400 font-light">
              Enterprise-grade risk management infrastructure for growing businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">AI Risk Assessment</h3>
                <p className="text-gray-400 leading-relaxed">
                  Advanced algorithms identify and quantify price exposures across commodities, currencies, and energy markets.
                </p>
              </div>
            </div>

            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Contract Marketplace</h3>
                <p className="text-gray-400 leading-relaxed">
                  Liquid secondary market with transparent pricing and automated counterparty discovery mechanisms.
                </p>
              </div>
            </div>

            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Smart Contract Escrow</h3>
                <p className="text-gray-400 leading-relaxed">
                  Trustless fund custody with automatic settlement via oracle-verified price feeds and blockchain execution.
                </p>
              </div>
            </div>

            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Global Coverage</h3>
                <p className="text-gray-400 leading-relaxed">
                  Multi-asset class hedging across commodities, FX, energy, and custom indices with 24/7 market access.
                </p>
              </div>
            </div>

            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Natural Counterparties</h3>
                <p className="text-gray-400 leading-relaxed">
                  Proprietary matching engine pairs businesses with offsetting exposures for optimal capital efficiency.
                </p>
              </div>
            </div>

            <div className="stagger-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Portfolio Analytics</h3>
                <p className="text-gray-400 leading-relaxed">
                  Real-time risk dashboards with P&L attribution, exposure management, and predictive modeling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 fade-in-section z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-16 backdrop-blur-sm">
            <h2 className="text-5xl font-normal text-white mb-6 tracking-tight">
              Ready to Hedge Your Risk?
            </h2>
            <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
              Join the next generation of risk management. Institutional-grade protection for businesses of all sizes.
            </p>
            <div className="flex gap-6 justify-center">
              <Link 
                href="/demo" 
                className="group px-10 py-5 bg-white text-slate-900 rounded-lg font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <span className="flex items-center gap-3">
                  View Demo
                  <Sparkles className="w-5 h-5" />
                </span>
              </Link>
              <Link 
                href="/chat" 
                className="px-10 py-5 bg-slate-800 border border-slate-700 text-white rounded-lg font-medium text-lg backdrop-blur-sm transition-all duration-300 hover:bg-slate-700 hover:border-slate-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-normal text-white mb-2 tracking-tight">LYZN</h3>
              <p className="text-gray-500 text-sm">Institutional Risk Management for SMEs</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-xs">Contact: nghia.nim@columbia.edu</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
