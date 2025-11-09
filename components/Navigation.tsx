'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-normal text-white hover:text-blue-400 transition-colors" style={{ fontFamily: "'Libre Baskerville', 'Baskerville', 'Georgia', serif", letterSpacing: '0.15em' }}>
            LYZN
          </Link>
          
          <div className="flex items-center gap-12">
            <Link 
              href="/about" 
              className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide"
            >
              About Us
            </Link>
            <Link 
              href="/solutions" 
              className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide"
            >
              Solutions
            </Link>
            <Link 
              href="/marketplace" 
              className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide"
            >
              Marketplace
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide"
            >
              Contact
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium px-6 py-2.5 bg-white text-slate-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

