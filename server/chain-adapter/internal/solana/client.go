package solana

import (
	"context"
	"encoding/base64"
	"fmt"
	"math"
	"strings"
	"time"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"go.uber.org/zap"
	"github.com/lyzn/chain-adapter/internal/config"
)

type Client struct {
	rpcPrimary   *rpc.Client
	rpcFallback  *rpc.Client
	logger       *zap.Logger
	programID    solana.PublicKey
	usdcMint     solana.PublicKey
	pythFeeds    map[string]solana.PublicKey
	nonCustodial bool
	signer       *solana.PrivateKey
}

func NewClient(logger *zap.Logger, cfg *config.Config) (*Client, error) {
	programID, err := solana.PublicKeyFromBase58(cfg.ProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid program ID: %w", err)
	}

	usdcMint, err := solana.PublicKeyFromBase58(cfg.USDCMint)
	if err != nil {
		return nil, fmt.Errorf("invalid USDC mint: %w", err)
	}

	// Parse Pyth feeds
	pythFeeds := make(map[string]solana.PublicKey)
	for asset, feedStr := range cfg.PythFeeds {
		feed, err := solana.PublicKeyFromBase58(feedStr)
		if err != nil {
			logger.Warn("Invalid Pyth feed", zap.String("asset", asset), zap.Error(err))
			continue
		}
		pythFeeds[asset] = feed
	}

	client := &Client{
		rpcPrimary:   rpc.New(cfg.RPCPrimary),
		logger:       logger,
		programID:    programID,
		usdcMint:     usdcMint,
		pythFeeds:    pythFeeds,
		nonCustodial: cfg.NonCustodial,
	}

	if cfg.RPCFallback != "" {
		client.rpcFallback = rpc.New(cfg.RPCFallback)
	}

	// Load signer if in custodial mode
	if !cfg.NonCustodial && cfg.SignerKeypairPath != "" {
		// TODO: Load keypair from file or KMS
		logger.Warn("Custodial mode requires signer keypair - not implemented yet")
	}

	return client, nil
}

// DeriveContractPDA derives the contract PDA from terms hash
func (c *Client) DeriveContractPDA(termsHash string) (solana.PublicKey, uint8, error) {
	seedBytes := []byte("contract")
	termsHashBytes := []byte(termsHash)
	seeds := [][]byte{seedBytes, termsHashBytes}
	return solana.FindProgramAddress(seeds, c.programID)
}

// DeriveEscrowPDA derives the escrow PDA for a contract
func (c *Client) DeriveEscrowPDA(contractPDA solana.PublicKey) (solana.PublicKey, uint8, error) {
	seedBytes := []byte("escrow")
	contractBytes := contractPDA.Bytes()
	seeds := [][]byte{seedBytes, contractBytes}
	return solana.FindProgramAddress(seeds, c.programID)
}

// GetRPCClient returns the primary RPC client with fallback support
func (c *Client) GetRPCClient() *rpc.Client {
	return c.rpcPrimary
}

// CallRPCWithRetry calls RPC with exponential backoff and fallback
func (c *Client) CallRPCWithRetry(ctx context.Context, fn func(*rpc.Client) error) error {
	maxRetries := 3
	backoff := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		// Try primary RPC
		err := fn(c.rpcPrimary)
		if err == nil {
			return nil
		}

		// Check if it's a rate limit or timeout error
		if isRetryableError(err) && c.rpcFallback != nil {
			c.logger.Warn("Primary RPC failed, trying fallback",
				zap.Error(err),
				zap.Int("attempt", attempt+1),
			)
			err = fn(c.rpcFallback)
			if err == nil {
				return nil
			}
		}

		if attempt < maxRetries-1 {
			time.Sleep(backoff)
			backoff *= 2 // Exponential backoff
		}
	}

	return fmt.Errorf("RPC call failed after %d attempts", maxRetries)
}

func isRetryableError(err error) bool {
	// Check for rate limit (429) or timeout errors
	errStr := err.Error()
	return strings.Contains(errStr, "429") || strings.Contains(errStr, "timeout") || strings.Contains(errStr, "rate limit")
}

// ConfirmTransaction waits for transaction confirmation
func (c *Client) ConfirmTransaction(ctx context.Context, sig solana.Signature) error {
	maxAttempts := 30
	interval := 2 * time.Second

	for attempt := 0; attempt < maxAttempts; attempt++ {
		var status *rpc.SignatureStatusesResult
		err := c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
			var err error
			status, err = client.GetSignatureStatuses(ctx, false, sig)
			return err
		})

		if err != nil {
			c.logger.Warn("Failed to get signature status", zap.Error(err))
			time.Sleep(interval)
			continue
		}

		if len(status.Value) > 0 && status.Value[0] != nil {
			if status.Value[0].Err != nil {
				return fmt.Errorf("transaction failed: %v", status.Value[0].Err)
			}
			if status.Value[0].ConfirmationStatus != nil {
				if *status.Value[0].ConfirmationStatus == rpc.ConfirmationStatusFinalized {
					return nil
				}
			}
		}

		time.Sleep(interval)
	}

	return fmt.Errorf("transaction not confirmed after %d attempts", maxAttempts)
}

// InitializeContractParams for contract initialization
type InitializeContractParams struct {
	ContractID  string
	TermsHash   string
	PartyA      solana.PublicKey
	PartyB      solana.PublicKey
	Underlying  string
	Strike      float64
	Expiry      int64
	Notional    float64
	OracleFeed  solana.PublicKey
}

// InitializeContractResponse response from initialization
type InitializeContractResponse struct {
	ContractPDA solana.PublicKey `json:"contractPda"`
	EscrowPDA   solana.PublicKey `json:"escrowPda"`
	TxSig       solana.Signature `json:"txSig"`
	UnsignedTx  string           `json:"unsignedTx,omitempty"` // Base64 encoded for non-custodial
}

// InitializeContract creates Contract PDA and Escrow USDC PDA
func (c *Client) InitializeContract(ctx context.Context, params InitializeContractParams) (*InitializeContractResponse, error) {
	c.logger.Info("Initializing contract on-chain",
		zap.String("contractID", params.ContractID),
		zap.String("termsHash", params.TermsHash),
	)

	// Derive PDAs
	contractPDA, _, err := c.DeriveContractPDA(params.TermsHash)
	if err != nil {
		return nil, fmt.Errorf("failed to derive contract PDA: %w", err)
	}

	escrowPDA, _, err := c.DeriveEscrowPDA(contractPDA)
	if err != nil {
		return nil, fmt.Errorf("failed to derive escrow PDA: %w", err)
	}

	// Get recent blockhash
	var recentBlockhash solana.Hash
	err = c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		recentBlockhash, err = client.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Build transaction
	// TODO: Build actual Anchor instruction
	// For now, create a placeholder transaction structure
	tx, err := solana.NewTransaction(
		[]solana.Instruction{
			// Placeholder - in production, build the actual initialize_contract instruction
		},
		recentBlockhash,
		solana.TransactionPayer(params.PartyA),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to build transaction: %w", err)
	}

	// In non-custodial mode, return unsigned transaction
	if c.nonCustodial {
		txBytes, err := tx.MarshalBinary()
		if err != nil {
			return nil, fmt.Errorf("failed to marshal transaction: %w", err)
		}
		return &InitializeContractResponse{
			ContractPDA: contractPDA,
			EscrowPDA:   escrowPDA,
			UnsignedTx:  base64.StdEncoding.EncodeToString(txBytes),
		}, nil
	}

	// In custodial mode, sign and submit
	if c.signer == nil {
		return nil, fmt.Errorf("signer not configured for custodial mode")
	}

	tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(c.signer.PublicKey()) {
			return c.signer
		}
		return nil
	})

	var sig solana.Signature
	err = c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		sig, err = client.SendTransaction(ctx, tx)
		return err
	})

	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	return &InitializeContractResponse{
		ContractPDA: contractPDA,
		EscrowPDA:   escrowPDA,
		TxSig:       sig,
	}, nil
}

// FundContractParams for funding
type FundContractParams struct {
	ContractID string
	EscrowPDA  solana.PublicKey
	Payer      solana.PublicKey
	Amount     uint64 // USDC amount in smallest unit (6 decimals)
}

// FundContractResponse response from funding
type FundContractResponse struct {
	TxSig      solana.Signature `json:"txSig,omitempty"`
	UnsignedTx string           `json:"unsignedTx,omitempty"` // Base64 encoded for non-custodial
}

// FundContract builds fund transaction
func (c *Client) FundContract(ctx context.Context, params FundContractParams) (*FundContractResponse, error) {
	c.logger.Info("Funding contract",
		zap.String("contractID", params.ContractID),
		zap.String("payer", params.Payer.String()),
		zap.Uint64("amount", params.Amount),
	)

	// Get recent blockhash
	var recentBlockhash solana.Hash
	err := c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		recentBlockhash, err = client.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// TODO: Build actual SPL token transfer instruction to escrow PDA
	// For now, placeholder
	tx, err := solana.NewTransaction(
		[]solana.Instruction{
			// Placeholder - build SPL token transfer
		},
		recentBlockhash,
		solana.TransactionPayer(params.Payer),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to build transaction: %w", err)
	}

	// In non-custodial mode, return unsigned transaction
	if c.nonCustodial {
		txBytes, err := tx.MarshalBinary()
		if err != nil {
			return nil, fmt.Errorf("failed to marshal transaction: %w", err)
		}
		return &FundContractResponse{
			UnsignedTx: base64.StdEncoding.EncodeToString(txBytes),
		}, nil
	}

	// In custodial mode, sign and submit
	if c.signer == nil {
		return nil, fmt.Errorf("signer not configured for custodial mode")
	}

	tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(c.signer.PublicKey()) {
			return c.signer
		}
		return nil
	})

	var sig solana.Signature
	err = c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		sig, err = client.SendTransaction(ctx, tx)
		return err
	})

	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	return &FundContractResponse{
		TxSig: sig,
	}, nil
}

// SettleContractParams for settlement
type SettleContractParams struct {
	ContractID     string
	ContractPDA    solana.PublicKey
	EscrowPDA      solana.PublicKey
	OracleFeed     solana.PublicKey
	SettlementPrice float64
}

// SettleContractResponse response from settlement
type SettleContractResponse struct {
	Price  float64         `json:"price"`
	Payout map[string]uint64 `json:"payout"` // party -> amount
	TxSig  solana.Signature `json:"txSig"`
}

// SettleContract settles the contract based on Pyth oracle price
func (c *Client) SettleContract(ctx context.Context, params SettleContractParams) (*SettleContractResponse, error) {
	c.logger.Info("Settling contract",
		zap.String("contractID", params.ContractID),
		zap.Float64("settlementPrice", params.SettlementPrice),
	)

	// Get recent blockhash
	var recentBlockhash solana.Hash
	err := c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		recentBlockhash, err = client.GetLatestBlockhash(ctx, rpc.CommitmentFinalized)
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// TODO: Build actual settle_contract instruction with Pyth price feed
	// For now, placeholder
	tx, err := solana.NewTransaction(
		[]solana.Instruction{
			// Placeholder - build settle_contract instruction
		},
		recentBlockhash,
		solana.TransactionPayer(solana.MustPublicKeyFromBase58("11111111111111111111111111111111")), // System program
	)

	if err != nil {
		return nil, fmt.Errorf("failed to build transaction: %w", err)
	}

	// Sign and submit (settlement is always server-side)
	if c.signer == nil {
		return nil, fmt.Errorf("signer not configured")
	}

	tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(c.signer.PublicKey()) {
			return c.signer
		}
		return nil
	})

	var sig solana.Signature
	err = c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		sig, err = client.SendTransaction(ctx, tx)
		return err
	})

	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	// Calculate payout (placeholder - actual calculation depends on contract terms)
	payout := make(map[string]uint64)
	// TODO: Calculate actual payout based on strike vs settlement price

	return &SettleContractResponse{
		Price:  params.SettlementPrice,
		Payout: payout,
		TxSig:  sig,
	}, nil
}

// GetPythPrice reads price from Pyth oracle
func (c *Client) GetPythPrice(ctx context.Context, feed solana.PublicKey) (float64, error) {
	var accountInfo *rpc.GetAccountInfoResult
	err := c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		accountInfo, err = client.GetAccountInfo(ctx, feed)
		return err
	})
	if err != nil {
		return 0, fmt.Errorf("failed to fetch Pyth account: %w", err)
	}

	if accountInfo.Value == nil {
		return 0, fmt.Errorf("Pyth account not found")
	}

	data := accountInfo.Value.Data.GetBinary()
	if len(data) < 200 {
		return 0, fmt.Errorf("invalid Pyth account data: too short")
	}

	// Parse Pyth price feed account structure
	// Price exponent (i32, 4 bytes) at offset 9
	expo := int32(int32(data[9]) | int32(data[10])<<8 | int32(data[11])<<16 | int32(data[12])<<24)

	// Price (i64, 8 bytes) at offset 13
	price := int64(int64(data[13]) |
		int64(data[14])<<8 |
		int64(data[15])<<16 |
		int64(data[16])<<24 |
		int64(data[17])<<32 |
		int64(data[18])<<40 |
		int64(data[19])<<48 |
		int64(data[20])<<56)

	// Confidence (u64, 8 bytes) at offset 21
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
	if status != 1 { // 1 = Trading
		return 0, fmt.Errorf("Pyth price feed not in trading status: %d", status)
	}

	// Publish timestamp (i64, 8 bytes) at offset 63
	publishTime := int64(int64(data[63]) |
		int64(data[64])<<8 |
		int64(data[65])<<16 |
		int64(data[66])<<24 |
		int64(data[67])<<32 |
		int64(data[68])<<40 |
		int64(data[69])<<48 |
		int64(data[70])<<56)

	// Verify freshness (60 seconds max staleness)
	currentTime := time.Now().Unix()
	if currentTime-publishTime > 60 {
		return 0, fmt.Errorf("Pyth price feed is stale: %d seconds old", currentTime-publishTime)
	}

	// Verify confidence threshold
	const maxConfidence = uint64(1000000)
	if conf > maxConfidence {
		return 0, fmt.Errorf("Pyth price feed confidence too high: %d", conf)
	}

	// Convert price to float64: price * 10^expo
	priceFloat := float64(price) * math.Pow10(int(expo))

	c.logger.Debug("Read Pyth price",
		zap.String("feed", feed.String()),
		zap.Float64("price", priceFloat),
		zap.Int32("expo", expo),
		zap.Uint64("confidence", conf),
		zap.Int64("publishTime", publishTime),
	)

	return priceFloat, nil
}

// SubmitSignedTransaction submits a signed transaction (for non-custodial flow)
func (c *Client) SubmitSignedTransaction(ctx context.Context, signedTxBase64 string) (solana.Signature, error) {
	txBytes, err := base64.StdEncoding.DecodeString(signedTxBase64)
	if err != nil {
		return solana.Signature{}, fmt.Errorf("failed to decode transaction: %w", err)
	}

	var tx solana.Transaction
	if err := tx.UnmarshalBinary(txBytes); err != nil {
		return solana.Signature{}, fmt.Errorf("failed to unmarshal transaction: %w", err)
	}

	var sig solana.Signature
	err = c.CallRPCWithRetry(ctx, func(client *rpc.Client) error {
		var err error
		sig, err = client.SendTransaction(ctx, &tx)
		return err
	})

	if err != nil {
		return solana.Signature{}, fmt.Errorf("failed to send transaction: %w", err)
	}

	return sig, nil
}
