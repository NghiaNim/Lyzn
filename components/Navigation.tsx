'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            LYZN
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/solutions" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Solutions
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <div className="h-8 w-px bg-gray-700" />
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

