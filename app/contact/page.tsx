'use client'

import Navigation from '@/components/Navigation'
import { Mail, MessageSquare, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center">Get in Touch</h1>
          <p className="text-xl text-gray-300 text-center mb-16">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Email Us</h2>
              <p className="text-gray-400 mb-4">
                Get in touch with our team
              </p>
              <a href="mailto:nghia.nim@columbia.edu" className="text-blue-400 hover:text-blue-300">
                nghia.nim@columbia.edu
              </a>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start a Conversation</h2>
              <p className="text-gray-400 mb-4">
                Try our AI risk assessment
              </p>
              <a href="/chat" className="text-blue-400 hover:text-blue-300">
                Chat with AI →
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Type
                </label>
                <select className="input-field">
                  <option>Select your industry...</option>
                  <option>Food & Beverage</option>
                  <option>Agriculture</option>
                  <option>Transportation</option>
                  <option>Manufacturing</option>
                  <option>Import/Export</option>
                  <option>Construction</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell us about your business and what you'd like to protect..."
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>

          <div className="card bg-blue-600/10 border-blue-500 mt-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Built at HackPrinceton</h3>
                <p className="text-sm text-blue-100">
                  LYZN was created by Crystal Low, Angelina Yeh, Anna Zhang, and Nghia Nim as part of 
                  our mission to bring institutional hedging tools to small businesses everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

