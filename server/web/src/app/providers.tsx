'use client'

import { ContractProvider } from '@/contexts/ContractContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ContractProvider>
      {children}
    </ContractProvider>
  )
}

