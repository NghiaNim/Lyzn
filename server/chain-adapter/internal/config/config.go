package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port              string
	RPCPrimary        string
	RPCFallback       string
	ProgramID         string
	USDCMint          string
	PythFeeds         map[string]string // asset -> feed address
	HMACSecret        string
	NonCustodial      bool
	SignerKeypairPath string
	WebAPIURL         string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		RPCPrimary:        getEnv("RPC_PRIMARY", "https://api.devnet.solana.com"),
		RPCFallback:       getEnv("RPC_FALLBACK", ""),
		ProgramID:          getEnv("PROGRAM_ID", "11111111111111111111111111111111"),
		USDCMint:          getEnv("USDC_MINT", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
		HMACSecret:        getEnv("HMAC_SECRET", ""),
		NonCustodial:      getEnv("NON_CUSTODIAL", "true") == "true",
		SignerKeypairPath: getEnv("SIGNER_KEYPAIR_PATH", ""),
		WebAPIURL:         getEnv("WEB_API_URL", "http://localhost:3000"),
		PythFeeds:         make(map[string]string),
	}

	// Load Pyth feeds from environment
	// Format: PYTH_FEED_BTC=..., PYTH_FEED_ETH=...
	for _, env := range os.Environ() {
		if len(env) > 10 && env[:10] == "PYTH_FEED_" {
			key := env[10:]
			// Find the = sign
			for i := 0; i < len(key); i++ {
				if key[i] == '=' {
					asset := key[:i]
					feed := key[i+1:]
					cfg.PythFeeds[asset] = feed
					break
				}
			}
		}
	}

	// Set defaults if not provided
	if cfg.PythFeeds["BTC"] == "" {
		cfg.PythFeeds["BTC"] = "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"
	}
	if cfg.PythFeeds["ETH"] == "" {
		cfg.PythFeeds["ETH"] = "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB"
	}

	if cfg.HMACSecret == "" {
		return nil, fmt.Errorf("HMAC_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

