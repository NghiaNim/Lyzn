package scheduler

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gagliardetto/solana-go"
	"go.uber.org/zap"

	"github.com/lyzn/chain-adapter/internal/config"
	"github.com/lyzn/chain-adapter/internal/solana"
)

type Scheduler struct {
	logger       *zap.Logger
	solanaClient *solana.Client
	config       *config.Config
	stopCh       chan struct{}
}

func NewScheduler(logger *zap.Logger, solanaClient *solana.Client, cfg *config.Config) *Scheduler {
	return &Scheduler{
		logger:       logger,
		solanaClient: solanaClient,
		config:       cfg,
		stopCh:       make(chan struct{}),
	}
}

func (s *Scheduler) Start(ctx context.Context) {
	// Expiry scanner - runs every minute
	expiryTicker := time.NewTicker(1 * time.Minute)
	defer expiryTicker.Stop()

	// Retry queue - runs every 30 seconds
	retryTicker := time.NewTicker(30 * time.Second)
	defer retryTicker.Stop()

	// Funding watch - runs every 10 seconds
	fundingTicker := time.NewTicker(10 * time.Second)
	defer fundingTicker.Stop()

	s.logger.Info("Scheduler started")

	for {
		select {
		case <-s.stopCh:
			s.logger.Info("Scheduler stopped")
			return
		case <-ctx.Done():
			s.logger.Info("Scheduler context cancelled")
			return
		case <-expiryTicker.C:
			s.processExpiredContracts(ctx)
		case <-retryTicker.C:
			s.processRetryQueue(ctx)
		case <-fundingTicker.C:
			s.processFundingWatch(ctx)
		}
	}
}

func (s *Scheduler) Stop() {
	close(s.stopCh)
}

// processExpiredContracts queries web API for contracts due for settlement
func (s *Scheduler) processExpiredContracts(ctx context.Context) {
	s.logger.Debug("Processing expired contracts")

	// Query web API for contracts due for settlement
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequestWithContext(ctx, "GET", s.config.WebAPIURL+"/api/contracts/due", nil)
	if err != nil {
		s.logger.Error("Failed to create request", zap.Error(err))
		return
	}

	// Add HMAC auth
	timestamp := strconv.FormatInt(time.Now().UnixMilli(), 10)
	payload := ""
	signature := s.generateHMAC(payload, timestamp)
	req.Header.Set("X-Timestamp", timestamp)
	req.Header.Set("X-Signature", signature)

	resp, err := client.Do(req)
	if err != nil {
		s.logger.Error("Failed to query due contracts", zap.Error(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.logger.Warn("Failed to get due contracts", zap.Int("status", resp.StatusCode))
		return
	}

	var result struct {
		Contracts []ContractDue `json:"contracts"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		s.logger.Error("Failed to decode response", zap.Error(err))
		return
	}

	for _, contract := range result.Contracts {
		s.settleContract(ctx, contract)
	}
}

type ContractDue struct {
	ID            string `json:"id"`
	ContractPDA   string `json:"contractPda"`
	EscrowPDA     string `json:"escrowPda"`
	OracleFeed    string `json:"oracleFeed"`
	Underlying    string `json:"underlying"`
}

func (s *Scheduler) settleContract(ctx context.Context, contract ContractDue) {
	s.logger.Info("Settling contract", zap.String("contractID", contract.ID))

	// Get Pyth price
	oracleFeed, err := solana.PublicKeyFromBase58(contract.OracleFeed)
	if err != nil {
		s.logger.Error("Invalid oracle feed", zap.Error(err))
		return
	}

	price, err := s.solanaClient.GetPythPrice(ctx, oracleFeed)
	if err != nil {
		s.logger.Error("Failed to get Pyth price", zap.Error(err))
		return
	}

	contractPDA, err := solana.PublicKeyFromBase58(contract.ContractPDA)
	if err != nil {
		s.logger.Error("Invalid contract PDA", zap.Error(err))
		return
	}

	escrowPDA, err := solana.PublicKeyFromBase58(contract.EscrowPDA)
	if err != nil {
		s.logger.Error("Invalid escrow PDA", zap.Error(err))
		return
	}

	params := solana.SettleContractParams{
		ContractID:      contract.ID,
		ContractPDA:    contractPDA,
		EscrowPDA:      escrowPDA,
		OracleFeed:     oracleFeed,
		SettlementPrice: price,
	}

	result, err := s.solanaClient.SettleContract(ctx, params)
	if err != nil {
		s.logger.Error("Failed to settle contract", zap.Error(err))
		// Add to retry queue
		return
	}

	// Callback webhook
	s.callbackWebhook(contract.ID, result.TxSig.String(), "CONFIRMED", map[string]interface{}{
		"price":  result.Price,
		"payout": result.Payout,
	})
}

// processRetryQueue retries failed transactions
func (s *Scheduler) processRetryQueue(ctx context.Context) {
	s.logger.Debug("Processing retry queue")
	// TODO: Implement retry queue with exponential backoff
	// For now, this is a placeholder
}

// processFundingWatch confirms funding transactions
func (s *Scheduler) processFundingWatch(ctx context.Context) {
	s.logger.Debug("Processing funding watch")
	// TODO: Query pending funding transactions and confirm them
	// For now, this is a placeholder
}

func (s *Scheduler) callbackWebhook(contractID, sig, status string, meta map[string]interface{}) {
	payload := map[string]interface{}{
		"contractId": contractID,
		"sig":        sig,
		"kind":       "SETTLE",
		"status":     status,
		"meta":       meta,
	}

	payloadBytes, _ := json.Marshal(payload)
	timestamp := strconv.FormatInt(time.Now().UnixMilli(), 10)
	signature := s.generateHMAC(string(payloadBytes), timestamp)

	req, err := http.NewRequest("POST", s.config.WebAPIURL+"/api/webhooks/tx", bytes.NewReader(payloadBytes))
	if err != nil {
		s.logger.Error("Failed to create webhook request", zap.Error(err))
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Timestamp", timestamp)
	req.Header.Set("X-Signature", signature)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		s.logger.Error("Failed to send webhook", zap.Error(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.logger.Warn("Webhook returned non-200 status", zap.Int("status", resp.StatusCode))
	}
}

func (s *Scheduler) generateHMAC(payload, timestamp string) string {
	mac := hmac.New(sha256.New, []byte(s.config.HMACSecret))
	mac.Write([]byte(fmt.Sprintf("%s.%s", timestamp, payload)))
	return hex.EncodeToString(mac.Sum(nil))
}
