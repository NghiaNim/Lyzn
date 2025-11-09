'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Contract {
  id: string
  title: string
  category: string
  counterparty: string
  location: string
  position: 'YES' | 'NO'
  contracts: number
  avgPrice: number
  cost: number
  payout: number
  expiry: string
  volume24h: number
}

interface ContractContextType {
  contracts: Contract[]
  purchaseContract: (contractId: string, quantity: number) => void
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

const initialContracts: Contract[] = [
  {
    id: 'sugar-1',
    title: 'Will sugar exceed $0.55/lb by May 2026?',
    category: 'Commodities',
    counterparty: 'Sugar Refinery',
    location: 'Louisiana',
    position: 'YES',
    contracts: 10000,
    avgPrice: 45,
    cost: 4500,
    payout: 1000,
    expiry: 'May 2026',
    volume24h: 12500
  },
  {
    id: 'sugar-2',
    title: 'Will sugar exceed $0.60/lb by Aug 2026?',
    category: 'Commodities',
    counterparty: 'Candy Manufacturer',
    location: 'Ohio',
    position: 'YES',
    contracts: 5000,
    avgPrice: 32,
    cost: 1600,
    payout: 5000,
    expiry: 'Aug 2026',
    volume24h: 8200
  },
  {
    id: 'wheat-1',
    title: 'Will wheat exceed $8/bushel by Jun 2026?',
    category: 'Commodities',
    counterparty: 'Wheat Farmer',
    location: 'Kansas',
    position: 'YES',
    contracts: 75,
    avgPrice: 0.52,
    cost: 520,
    payout: 1000,
    expiry: 'Jun 2026',
    volume24h: 15600
  },
  {
    id: 'eur-1',
    title: 'Will EUR/USD exceed 1.15 by Dec 2025?',
    category: 'Currency',
    counterparty: 'EU Importer',
    location: 'Germany',
    position: 'NO',
    contracts: 200,
    avgPrice: 0.58,
    cost: 580,
    payout: 1000,
    expiry: 'Dec 2025',
    volume24h: 28400
  },
  {
    id: 'oil-1',
    title: 'Will oil exceed $90/barrel by Mar 2026?',
    category: 'Energy',
    counterparty: 'Construction Co.',
    location: 'Texas',
    position: 'YES',
    contracts: 150,
    avgPrice: 0.48,
    cost: 480,
    payout: 1000,
    expiry: 'Mar 2026',
    volume24h: 19800
  },
  {
    id: 'coffee-1',
    title: 'Will coffee exceed $2.50/lb by Jul 2026?',
    category: 'Commodities',
    counterparty: 'Coffee Roaster',
    location: 'Oregon',
    position: 'YES',
    contracts: 80,
    avgPrice: 0.41,
    cost: 410,
    payout: 1000,
    expiry: 'Jul 2026',
    volume24h: 11200
  }
]

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts)

  const purchaseContract = (contractId: string, quantity: number) => {
    setContracts(prevContracts => 
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          const newQuantity = contract.contracts - quantity
          // If no contracts left, return null and filter out
          if (newQuantity <= 0) {
            return { ...contract, contracts: 0 }
          }
          return { ...contract, contracts: newQuantity }
        }
        return contract
      }).filter(contract => contract.contracts > 0) // Remove contracts with 0 availability
    )
  }

  return (
    <ContractContext.Provider value={{ contracts, purchaseContract }}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractProvider')
  }
  return context
}

