import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LYZN - Peer-to-Peer Risk Management for Small Businesses',
  description: 'Bringing Wall Street\'s hedging tools to Main Street through event contracts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

