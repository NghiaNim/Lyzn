export declare const FEATURE_FLAGS: {
    readonly CUSTODIAL_MODE: boolean;
};
export declare const API_ENDPOINTS: {
    readonly ORDERS: "/api/orders";
    readonly COUNTERS: "/api/counters";
    readonly CONTRACTS: "/api/contracts";
    readonly MATCHES: "/api/matches";
};
export declare const SOLANA_CONFIG: {
    readonly DEVNET_PROGRAM_ID: "11111111111111111111111111111111";
    readonly MAINNET_PROGRAM_ID: "";
    readonly CLUSTER: string;
};
export declare const PYTH_FEED_IDS: {
    readonly BTC_USD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
    readonly ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
    readonly SOL_USD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
};
export declare const PYTH_PROGRAM_ID = "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s";
export declare function getPythFeedId(feed: 'BTC_USD' | 'ETH_USD' | 'SOL_USD'): string;
export declare const SETTLEMENT_CONFIG: {
    readonly SETTLEMENT_DELAY_SECONDS: 60;
    readonly MAX_RETRIES: 3;
    readonly RETRY_DELAY_MS: 5000;
};
export declare const USDC_MINT: {
    readonly DEVNET: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    readonly MAINNET: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
};
