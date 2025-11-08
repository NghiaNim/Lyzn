package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

// Simple Pyth price reader for testing
func readPythPrice(ctx context.Context, rpcURL string, feedAddress string) error {
	client := rpc.New(rpcURL)
	
	feed, err := solana.PublicKeyFromBase58(feedAddress)
	if err != nil {
		return fmt.Errorf("invalid feed address: %w", err)
	}

	accountInfo, err := client.GetAccountInfo(ctx, feed)
	if err != nil {
		return fmt.Errorf("failed to fetch account: %w", err)
	}

	if accountInfo.Value == nil {
		return fmt.Errorf("account not found")
	}

	data := accountInfo.Value.Data.GetBinary()
	if len(data) < 200 {
		return fmt.Errorf("account data too short: %d bytes", len(data))
	}

	// Parse price exponent (i32, 4 bytes) at offset 9
	expo := int32(int32(data[9]) | int32(data[10])<<8 | int32(data[11])<<16 | int32(data[12])<<24)

	// Parse price (i64, 8 bytes) at offset 13
	price := int64(int64(data[13]) |
		int64(data[14])<<8 |
		int64(data[15])<<16 |
		int64(data[16])<<24 |
		int64(data[17])<<32 |
		int64(data[18])<<40 |
		int64(data[19])<<48 |
		int64(data[20])<<56)

	// Parse confidence (u64, 8 bytes) at offset 21
	conf := uint64(uint64(data[21]) |
		uint64(data[22])<<8 |
		uint64(data[23])<<16 |
		uint64(data[24])<<24 |
		uint64(data[25])<<32 |
		uint64(data[26])<<40 |
		uint64(data[27])<<48 |
		uint64(data[28])<<56)

	// Status (u8) at offset 29
	status := data[29]

	// Publish timestamp (i64, 8 bytes) at offset 63
	publishTime := int64(int64(data[63]) |
		int64(data[64])<<8 |
		int64(data[65])<<16 |
		int64(data[66])<<24 |
		int64(data[67])<<32 |
		int64(data[68])<<40 |
		int64(data[69])<<48 |
		int64(data[70])<<56)

	// Convert to float: price * 10^expo
	priceFloat := float64(price)
	if expo != 0 {
		multiplier := 1.0
		if expo > 0 {
			for i := 0; i < int(expo); i++ {
				multiplier *= 10
			}
			priceFloat *= multiplier
		} else {
			for i := 0; i < int(-expo); i++ {
				multiplier *= 10
			}
			priceFloat /= multiplier
		}
	}

	fmt.Printf("Pyth Price Feed: %s\n", feedAddress)
	fmt.Printf("  Price: $%.2f\n", priceFloat)
	fmt.Printf("  Raw Price: %d\n", price)
	fmt.Printf("  Exponent: %d\n", expo)
	fmt.Printf("  Confidence: %d\n", conf)
	fmt.Printf("  Status: %d (1=Trading)\n", status)
	fmt.Printf("  Publish Time: %d (Unix timestamp)\n", publishTime)
	
	if status == 1 {
		fmt.Printf("  ✓ Status: Trading\n")
	} else {
		fmt.Printf("  ✗ Status: Not Trading\n")
	}

	return nil
}

func main() {
	rpcURL := os.Getenv("RPC_URL")
	if rpcURL == "" {
		rpcURL = "https://api.devnet.solana.com"
		fmt.Printf("Using default RPC: %s\n", rpcURL)
	}

	// Test BTC/USD feed (devnet)
	btcFeed := "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"
	fmt.Println("\n=== Testing BTC/USD Feed ===")
	if err := readPythPrice(context.Background(), rpcURL, btcFeed); err != nil {
		log.Fatalf("BTC/USD test failed: %v", err)
	}

	// Test ETH/USD feed (devnet)
	ethFeed := "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB"
	fmt.Println("\n=== Testing ETH/USD Feed ===")
	if err := readPythPrice(context.Background(), rpcURL, ethFeed); err != nil {
		log.Fatalf("ETH/USD test failed: %v", err)
	}

	fmt.Println("\n✓ All Pyth feeds verified successfully!")
}

