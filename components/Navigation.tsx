'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-normal text-white hover:text-blue-400 transition-colors" style={{ fontFamily: "'Libre Baskerville', 'Baskerville', 'Georgia', serif", letterSpacing: '0.15em' }}>
            LYZN
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950 backdrop-blur-xl border-b border-slate-800/50 py-4 shadow-2xl">
            <div className="flex flex-col gap-4 px-4">
              <Link 
                href="/about" 
                className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide py-2"
              >
                About Us
              </Link>
              <Link 
                href="/solutions" 
                className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide py-2"
              >
                Solutions
              </Link>
              <Link 
                href="/marketplace" 
                className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide py-2"
              >
                Marketplace
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-normal text-gray-400 hover:text-white transition-colors tracking-wide py-2"
              >
                Contact
              </Link>
              <Link 
                href="/login" 
                className="text-sm font-medium px-6 py-2.5 bg-white text-slate-900 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 text-center mt-2"
              >
                Client Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

