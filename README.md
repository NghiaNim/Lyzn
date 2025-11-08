# LYZN

**Peer-to-Peer Risk Management for Small Businesses**

> Bringing Wall Street's hedging tools to Main Street through event contracts.

---

## The Problem

Small businesses get crushed by price volatility they can't control. When a bakery's sugar costs spike 40%, their margins evaporate. When a restaurant's currency costs swing, they can't forecast expenses. Unlike Fortune 500 companies, SMEs have **no way to protect themselves**:

- Derivatives markets require $100K+ minimums
- Too complex—requires financial expertise they don't have
- No way to find natural counterparties (a bakery can't find a sugar refinery)
- Expensive legal costs for bilateral agreements

**The gap:** 33.2 million US SMEs (99.9% of businesses) face trillions in unhedged risk. The $600 trillion derivatives market is built for institutions, not them. [Illustrated in The Big Short.](https://www.youtube.com/watch?v=rN7BmmXfUiU)

---

## The Solution: LYZN

LYZN matches businesses whose risks naturally offset each other—then automates everything with AI and smart contracts.

### How It Works

1. **AI Risk Assessment** - Chat with AI about your business. It identifies your key price exposures (commodities, currency, fuel) and suggests specific risks to hedge.

2. **Browse Existing Contracts** - See contracts from other businesses that match your needs. If there's a good match, buy directly or negotiate better terms.

3. **Create New Contract (if needed)** - If no existing contract fits, create your own. AI handles everything: contract structure, payout logic, oracle selection, and pricing.

4. **Smart Contract Execution** - Both parties deposit collateral. Funds held in trustless escrow until expiry.

5. **Automatic Settlement** - Oracle reports the actual price at expiry. Smart contract pays out automatically—no manual intervention needed.

### Natural Counterparty Examples

- **Bakery ↔ Sugar Refinery:** One hedges rising prices, other falling
- **US Importer ↔ EU Exporter:** Opposite currency exposure
- **Construction Co. ↔ Solar Installer:** Oil prices affect them inversely

---

## Understanding Event Contracts & Regulation

### What Are Event Contracts?

Event contracts are classified as **swaps** under the Commodity Exchange Act (CEA):

> "A swap is an agreement, contract, or transaction that provides for payment dependent on the occurrence, nonoccurrence, or the extent of the occurrence of an event or contingency associated with a potential financial, economic, or commercial consequence."
> 
> — Commodity Exchange Act, 7 U.S.C. § 1a(47)

The CFTC views event contracts as **binary options**—contracts where the payout depends entirely on a yes/no proposition. Since binary options fit the legal definition of swaps, they fall under CFTC jurisdiction, [though without the price and complexity of certain famous swaps](https://www.youtube.com/watch?v=UqYGWXMJ78I)

### Why This Is Legal (Not Gambling)

Under the Commodity Exchange Act, derivatives exist outside gambling law because they serve an **economic purpose**: helping businesses manage legitimate risks. Airlines hedge jet fuel, coffee shops hedge coffee prices—LYZN brings this same risk management to all SMEs.

### Regulatory Path

- **Now (Hackathon):** Demo with no real money
- **Phase 2:** Apply for Designated Contract Market (DCM) registration
- **Phase 3:** Full compliance infrastructure: AML/KYC, market surveillance, customer fund segregation

The 2024 Kalshi v. CFTC court victory established that event contracts are permissible financial instruments. The court ruled that the CFTC overstepped its authority in blocking event contracts, creating momentum for innovation in this space.

---

## Demo Features

Our hackathon demo shows the complete flow:

**1. Chat with AI:** 
```
User: "I run a bakery in Brooklyn."

AI: "Great! I'd love to understand your business better. 
What are your main ingredients and supplies?"

User: "We use a lot of sugar, wheat flour, and butter. 
Also diesel for our delivery trucks."

AI: "Got it. How much do you typically spend on these each month?"

User: "Sugar is about $2,000/month, flour $1,500, butter $800."

AI: "And how do price changes affect you? For example, 
what happens if sugar prices spike?"

User: "Last year sugar went up 40% and we almost went under. 
We couldn't raise prices fast enough."

AI: "I understand—that's a real risk. Let me show you 
some ways to protect against these price swings."
```

**2. AI Suggests Risks with Available Contracts:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk #1: Sugar Prices Rising

Available Contracts:

┌─────────────────────────────────────────────────┐
│ 🍬 Will sugar exceed $0.55/lb by May 2026?      │
├─────────────────────────────────────────────────┤
│ Yes · Sugar Refinery (Louisiana)                │
│ Contracts: 100  Avg Price: 45¢  Cost: $450      │
│ Payout if right: $1,000                          │
│                                                  │
│ [Buy Now] [Negotiate Terms]                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🍬 Will sugar exceed $0.60/lb by Aug 2026?      │
├─────────────────────────────────────────────────┤
│ Yes · Candy Manufacturer (Ohio)                 │
│ Contracts: 50  Avg Price: 32¢  Cost: $320       │
│ Payout if right: $1,000                          │
│                                                  │
│ [Buy Now] [Negotiate Terms]                      │
└─────────────────────────────────────────────────┘

[+ Create Your Own Sugar Contract]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk #2: Wheat Flour Prices Rising

Available Contracts:

┌─────────────────────────────────────────────────┐
│ 🌾 Will wheat exceed $8/bushel by Jun 2026?     │
├─────────────────────────────────────────────────┤
│ Yes · Wheat Farmer (Kansas)                     │
│ Contracts: 75  Avg Price: 52¢  Cost: $520       │
│ Payout if right: $1,000                          │
│                                                  │
│ [Buy Now] [Negotiate Terms]                      │
└─────────────────────────────────────────────────┘

[+ Create Your Own Wheat Contract]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk #3: Diesel Fuel Costs (Delivery Trucks)

No existing contracts found.

[+ Create Your Own Diesel Contract]
```

**3. Create New Contract (If you choose "Create Your Own"):**
```
AI generates your custom contract:

┌─────────────────────────────────────────────────┐
│ 🍬 Will sugar exceed $0.55/lb by May 2026?      │
├─────────────────────────────────────────────────┤
│ Your Position: YES (you get paid if sugar rises)│
│ Protection Amount: $5,000                        │
│ Your Cost: $500 (10% deposit)                    │
│ Oracle: USDA Agricultural Prices API             │
│ Settlement: Automatic via smart contract         │
│                                                  │
│ [Post Contract] [Adjust Terms]                   │
└─────────────────────────────────────────────────┘

This contract will be visible to other businesses 
looking for the opposite hedge.
```

**4. Execution:** Both parties deposit funds into smart contract escrow

**5. Settlement:**
```
Contract Settled! 
Final sugar price: $0.60/lb (above strike of $0.55/lb)
Your payout: $5,000 (automatically transferred)
```  

---

## Business Model

**Revenue:** We take a 1% fee on each matched contract.

**Why 1%:** Traditional OTC derivatives desks charge 2-5%. We're cheaper because we cut out the middleman—peer-to-peer matching means lower costs.

**Example:** $10K contract → $100 platform fee

Simple, transparent, aligned with helping SMEs save money.

---

## Go-to-Market

**Target:** Start with food & beverage SMEs (bakeries, restaurants, cafes)
- Clear commodity risks (sugar, wheat, coffee)
- Easy to understand pain points
- Natural counterparties exist (farmers, processors, suppliers)

**Acquisition:**
1. Partner with trade associations (National Restaurant Association, American Bakers Association)
2. SME banking partnerships (offer as value-add to business account holders)
3. Content marketing: "How to protect your bakery from price spikes"
4. Referral program: Users bring their natural counterparties

---

## Why Now?

Three technologies converged to make this possible:

1. **LLMs** - Can translate "my sugar costs are killing me" into structured financial contracts
2. **Smart Contracts** - Provide trustless escrow at near-zero cost
3. **Regulatory Clarity** - Kalshi's 2024 court victory legitimized event contracts

---

## The Vision

The derivatives market is $600 trillion, but 99% of businesses are excluded.

**LYZN brings institutional hedging to Main Street.** A bakery in Brooklyn, a coffee shop in Seattle, a food truck in Austin—all can protect themselves like Fortune 500 companies do.

This isn't just a product. It's **financial inclusion for the 33 million SMEs that need it most**.

---

## Team & Contact

**Built at:** HackPrinceton
**Team:** Crystal (L)ow, Angelina (Y)eh, Anna (Z)hang, (N)ghia Nim
**Contact:** nghia.nim@columbia.edu

---

**Let's bring institutional hedging to Main Street.**
