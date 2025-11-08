"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchProposalSchema = exports.ContractSchema = exports.CounterSchema = exports.OrderSchema = exports.Direction = exports.OrderType = exports.ContractStatus = exports.OrderStatus = void 0;
const zod_1 = require("zod");
// Order status
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["NEGOTIATING"] = "NEGOTIATING";
    OrderStatus["MATCHED"] = "MATCHED";
    OrderStatus["FUNDED"] = "FUNDED";
    OrderStatus["LIVE"] = "LIVE";
    OrderStatus["SETTLED"] = "SETTLED";
    OrderStatus["EXPIRED"] = "EXPIRED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// Contract status
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["INITIALIZED"] = "INITIALIZED";
    ContractStatus["FUNDED"] = "FUNDED";
    ContractStatus["LIVE"] = "LIVE";
    ContractStatus["SETTLED"] = "SETTLED";
    ContractStatus["EXPIRED"] = "EXPIRED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
// Order type
var OrderType;
(function (OrderType) {
    OrderType["HEDGE"] = "HEDGE";
    OrderType["SPECULATIVE"] = "SPECULATIVE";
})(OrderType || (exports.OrderType = OrderType = {}));
// Direction
var Direction;
(function (Direction) {
    Direction["LONG"] = "LONG";
    Direction["SHORT"] = "SHORT";
})(Direction || (exports.Direction = Direction = {}));
// Order schema
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string(),
    orderType: zod_1.z.nativeEnum(OrderType),
    direction: zod_1.z.nativeEnum(Direction),
    underlying: zod_1.z.string(), // e.g., "BTC", "ETH"
    strike: zod_1.z.number().positive(),
    expiry: zod_1.z.string().datetime(),
    notional: zod_1.z.number().positive(),
    status: zod_1.z.nativeEnum(OrderStatus),
    termsHash: zod_1.z.string().optional(), // hash of agreed terms
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Counter proposal schema
exports.CounterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    orderId: zod_1.z.string().uuid(),
    proposerId: zod_1.z.string(),
    strike: zod_1.z.number().positive(),
    expiry: zod_1.z.string().datetime(),
    notional: zod_1.z.number().positive(),
    termsHash: zod_1.z.string(), // hash of these terms
    signature: zod_1.z.string().optional(), // client signature if non-custodial
    createdAt: zod_1.z.string().datetime(),
});
// Contract schema
exports.ContractSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    orderId: zod_1.z.string().uuid(),
    counterId: zod_1.z.string().uuid(),
    partyA: zod_1.z.string(), // user ID
    partyB: zod_1.z.string(), // user ID
    underlying: zod_1.z.string(),
    strike: zod_1.z.number().positive(),
    expiry: zod_1.z.string().datetime(),
    notional: zod_1.z.number().positive(),
    termsHash: zod_1.z.string(),
    status: zod_1.z.nativeEnum(ContractStatus),
    partyASignature: zod_1.z.string(),
    partyBSignature: zod_1.z.string(),
    onChainAddress: zod_1.z.string().optional(), // Solana PDA address
    settlementPrice: zod_1.z.number().optional(),
    winner: zod_1.z.string().optional(), // user ID
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Match proposal schema
exports.MatchProposalSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    matchedOrderId: zod_1.z.string().uuid(),
    strike: zod_1.z.number().positive(),
    expiry: zod_1.z.string().datetime(),
    notional: zod_1.z.number().positive(),
    termsHash: zod_1.z.string(),
});
