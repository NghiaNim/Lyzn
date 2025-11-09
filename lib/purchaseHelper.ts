interface Contract {
  id: string
  title: string
  position: 'YES' | 'NO'
  cost: number
  payout: number
  expiry: string
  counterparty: string
}

export function purchaseContract(contract: Contract) {
  // Get existing positions
  const stored = localStorage.getItem('purchasedPositions')
  const positions = stored ? JSON.parse(stored) : []
  
  // Add new position
  positions.push({
    id: contract.id,
    title: contract.title,
    position: contract.position,
    cost: contract.cost,
    payout: contract.payout,
    expiry: contract.expiry,
    counterparty: contract.counterparty,
    purchasedAt: new Date().toISOString()
  })
  
  // Save back to localStorage
  localStorage.setItem('purchasedPositions', JSON.stringify(positions))
}

