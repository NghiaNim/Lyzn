import { z } from 'zod';

// Order status
export enum OrderStatus {
  PENDING = 'PENDING',
  NEGOTIATING = 'NEGOTIATING',
  MATCHED = 'MATCHED',
  FUNDED = 'FUNDED',
  LIVE = 'LIVE',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Contract status
export enum ContractStatus {
  INITIALIZED = 'INITIALIZED',
  FUNDED = 'FUNDED',
  LIVE = 'LIVE',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED',
}

// Order type
export enum OrderType {
  HEDGE = 'HEDGE',
  SPECULATIVE = 'SPECULATIVE',
}

// Direction
export enum Direction {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

// Order schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  orderType: z.nativeEnum(OrderType),
  direction: z.nativeEnum(Direction),
  underlying: z.string(), // e.g., "BTC", "ETH"
  strike: z.number().positive(),
  expiry: z.string().datetime(),
  notional: z.number().positive(),
  status: z.nativeEnum(OrderStatus),
  termsHash: z.string().optional(), // hash of agreed terms
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

// Counter proposal schema
export const CounterSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  proposerId: z.string(),
  strike: z.number().positive(),
  expiry: z.string().datetime(),
  notional: z.number().positive(),
  termsHash: z.string(), // hash of these terms
  signature: z.string().optional(), // client signature if non-custodial
  createdAt: z.string().datetime(),
});

export type Counter = z.infer<typeof CounterSchema>;

// Contract schema
export const ContractSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  counterId: z.string().uuid(),
  partyA: z.string(), // user ID
  partyB: z.string(), // user ID
  underlying: z.string(),
  strike: z.number().positive(),
  expiry: z.string().datetime(),
  notional: z.number().positive(),
  termsHash: z.string(),
  status: z.nativeEnum(ContractStatus),
  partyASignature: z.string(),
  partyBSignature: z.string(),
  onChainAddress: z.string().optional(), // Solana PDA address
  settlementPrice: z.number().optional(),
  winner: z.string().optional(), // user ID
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Contract = z.infer<typeof ContractSchema>;

// Match proposal schema
export const MatchProposalSchema = z.object({
  orderId: z.string().uuid(),
  matchedOrderId: z.string().uuid(),
  strike: z.number().positive(),
  expiry: z.string().datetime(),
  notional: z.number().positive(),
  termsHash: z.string(),
});

export type MatchProposal = z.infer<typeof MatchProposalSchema>;

// API request/response types
export interface CreateOrderRequest {
  orderType: OrderType;
  direction: Direction;
  underlying: string;
  strike: number;
  expiry: string;
  notional: number;
}

export interface CreateCounterRequest {
  orderId: string;
  strike: number;
  expiry: string;
  notional: number;
}

export interface AcceptCounterRequest {
  counterId: string;
  signature?: string; // required for non-custodial
}

export interface InitializeContractRequest {
  contractId: string;
  signature?: string; // required for non-custodial
}

// HMAC auth headers
export interface HMACHeaders {
  'x-timestamp': string;
  'x-signature': string;
}

