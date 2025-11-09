import { z } from 'zod';
export declare enum OrderStatus {
    PENDING = "PENDING",
    NEGOTIATING = "NEGOTIATING",
    MATCHED = "MATCHED",
    FUNDED = "FUNDED",
    LIVE = "LIVE",
    SETTLED = "SETTLED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare enum ContractStatus {
    INITIALIZED = "INITIALIZED",
    FUNDED = "FUNDED",
    LIVE = "LIVE",
    SETTLED = "SETTLED",
    EXPIRED = "EXPIRED"
}
export declare enum OrderType {
    HEDGE = "HEDGE",
    SPECULATIVE = "SPECULATIVE"
}
export declare enum Direction {
    LONG = "LONG",
    SHORT = "SHORT"
}
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    orderType: z.ZodNativeEnum<typeof OrderType>;
    direction: z.ZodNativeEnum<typeof Direction>;
    underlying: z.ZodString;
    strike: z.ZodNumber;
    expiry: z.ZodString;
    notional: z.ZodNumber;
    status: z.ZodNativeEnum<typeof OrderStatus>;
    termsHash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    orderType: OrderType;
    status: OrderStatus;
    direction: Direction;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    createdAt: string;
    updatedAt: string;
    termsHash?: string | undefined;
}, {
    id: string;
    userId: string;
    orderType: OrderType;
    status: OrderStatus;
    direction: Direction;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    createdAt: string;
    updatedAt: string;
    termsHash?: string | undefined;
}>;
export type Order = z.infer<typeof OrderSchema>;
export declare const CounterSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    proposerId: z.ZodString;
    strike: z.ZodNumber;
    expiry: z.ZodString;
    notional: z.ZodNumber;
    termsHash: z.ZodString;
    signature: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    createdAt: string;
    orderId: string;
    proposerId: string;
    signature?: string | undefined;
}, {
    id: string;
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    createdAt: string;
    orderId: string;
    proposerId: string;
    signature?: string | undefined;
}>;
export type Counter = z.infer<typeof CounterSchema>;
export declare const ContractSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    counterId: z.ZodString;
    partyA: z.ZodString;
    partyB: z.ZodString;
    underlying: z.ZodString;
    strike: z.ZodNumber;
    expiry: z.ZodString;
    notional: z.ZodNumber;
    termsHash: z.ZodString;
    status: z.ZodNativeEnum<typeof ContractStatus>;
    partyASignature: z.ZodString;
    partyBSignature: z.ZodString;
    onChainAddress: z.ZodOptional<z.ZodString>;
    settlementPrice: z.ZodOptional<z.ZodNumber>;
    winner: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: ContractStatus;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    counterId: string;
    partyA: string;
    partyB: string;
    partyASignature: string;
    partyBSignature: string;
    onChainAddress?: string | undefined;
    settlementPrice?: number | undefined;
    winner?: string | undefined;
}, {
    id: string;
    status: ContractStatus;
    underlying: string;
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    counterId: string;
    partyA: string;
    partyB: string;
    partyASignature: string;
    partyBSignature: string;
    onChainAddress?: string | undefined;
    settlementPrice?: number | undefined;
    winner?: string | undefined;
}>;
export type Contract = z.infer<typeof ContractSchema>;
export declare const MatchProposalSchema: z.ZodObject<{
    orderId: z.ZodString;
    matchedOrderId: z.ZodString;
    strike: z.ZodNumber;
    expiry: z.ZodString;
    notional: z.ZodNumber;
    termsHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    orderId: string;
    matchedOrderId: string;
}, {
    strike: number;
    expiry: string;
    notional: number;
    termsHash: string;
    orderId: string;
    matchedOrderId: string;
}>;
export type MatchProposal = z.infer<typeof MatchProposalSchema>;
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
    signature?: string;
}
export interface InitializeContractRequest {
    contractId: string;
    signature?: string;
}
export interface HMACHeaders {
    'x-timestamp': string;
    'x-signature': string;
}
