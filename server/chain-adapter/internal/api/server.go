package api

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"

	"github.com/lyzn/chain-adapter/internal/config"
	"github.com/lyzn/chain-adapter/internal/solana"
)

type Server struct {
	logger       *zap.Logger
	solanaClient *solana.Client
	config       *config.Config
}

func NewServer(logger *zap.Logger, solanaClient *solana.Client, cfg *config.Config) *Server {
	return &Server{
		logger:       logger,
		solanaClient: solanaClient,
		config:       cfg,
	}
}

func (s *Server) RegisterRoutes(r chi.Router) {
	r.Route("/v1", func(r chi.Router) {
		r.Use(s.hmacMiddleware)
		r.Post("/contracts/initialize", s.handleInitializeContract)
		r.Post("/contracts/{id}/fund", s.handleFundContract)
		r.Post("/contracts/{id}/settle", s.handleSettleContract)
		r.Post("/contracts/{id}/submit-signed", s.handleSubmitSigned)
		r.Get("/health", s.handleHealth)
	})
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) handleInitializeContract(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ContractID string  `json:"contractId"`
		TermsHash  string  `json:"termsHash"`
		PartyA     string  `json:"partyA"`
		PartyB      string  `json:"partyB"`
		Underlying  string  `json:"underlying"`
		Strike      float64 `json:"strike"`
		Expiry      int64   `json:"expiry"`
		Notional    float64 `json:"notional"`
		OracleFeed  string  `json:"oracleFeed"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	partyA, err := solana.PublicKeyFromBase58(req.PartyA)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid partyA public key")
		return
	}

	partyB, err := solana.PublicKeyFromBase58(req.PartyB)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid partyB public key")
		return
	}

	oracleFeed, err := solana.PublicKeyFromBase58(req.OracleFeed)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid oracle feed")
		return
	}

	params := solana.InitializeContractParams{
		ContractID: req.ContractID,
		TermsHash:  req.TermsHash,
		PartyA:     partyA,
		PartyB:     partyB,
		Underlying: req.Underlying,
		Strike:     req.Strike,
		Expiry:     req.Expiry,
		Notional:   req.Notional,
		OracleFeed: oracleFeed,
	}

	result, err := s.solanaClient.InitializeContract(r.Context(), params)
	if err != nil {
		s.logger.Error("Failed to initialize contract", zap.Error(err))
		s.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	s.respondJSON(w, http.StatusOK, result)
}

func (s *Server) handleFundContract(w http.ResponseWriter, r *http.Request) {
	contractID := chi.URLParam(r, "id")

	var req struct {
		EscrowPDA string `json:"escrowPda"`
		Payer     string `json:"payer"`
		Amount    uint64 `json:"amount"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	escrowPDA, err := solana.PublicKeyFromBase58(req.EscrowPDA)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid escrow PDA")
		return
	}

	payer, err := solana.PublicKeyFromBase58(req.Payer)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid payer public key")
		return
	}

	params := solana.FundContractParams{
		ContractID: contractID,
		EscrowPDA:  escrowPDA,
		Payer:      payer,
		Amount:     req.Amount,
	}

	result, err := s.solanaClient.FundContract(r.Context(), params)
	if err != nil {
		s.logger.Error("Failed to fund contract", zap.Error(err))
		s.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	s.respondJSON(w, http.StatusOK, result)
}

func (s *Server) handleSettleContract(w http.ResponseWriter, r *http.Request) {
	contractID := chi.URLParam(r, "id")

	var req struct {
		ContractPDA    string  `json:"contractPda"`
		EscrowPDA      string  `json:"escrowPda"`
		OracleFeed     string  `json:"oracleFeed"`
		SettlementPrice float64 `json:"settlementPrice"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	contractPDA, err := solana.PublicKeyFromBase58(req.ContractPDA)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid contract PDA")
		return
	}

	escrowPDA, err := solana.PublicKeyFromBase58(req.EscrowPDA)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid escrow PDA")
		return
	}

	oracleFeed, err := solana.PublicKeyFromBase58(req.OracleFeed)
	if err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid oracle feed")
		return
	}

	params := solana.SettleContractParams{
		ContractID:      contractID,
		ContractPDA:     contractPDA,
		EscrowPDA:       escrowPDA,
		OracleFeed:      oracleFeed,
		SettlementPrice: req.SettlementPrice,
	}

	result, err := s.solanaClient.SettleContract(r.Context(), params)
	if err != nil {
		s.logger.Error("Failed to settle contract", zap.Error(err))
		s.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	s.respondJSON(w, http.StatusOK, result)
}

func (s *Server) handleSubmitSigned(w http.ResponseWriter, r *http.Request) {
	contractID := chi.URLParam(r, "id")

	var req struct {
		SignedTx string `json:"signedTx"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	sig, err := s.solanaClient.SubmitSignedTransaction(r.Context(), req.SignedTx)
	if err != nil {
		s.logger.Error("Failed to submit signed transaction", zap.Error(err))
		s.respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Callback to web API
	go s.callbackWebhook(contractID, sig.String(), "CONFIRMED", nil)

	s.respondJSON(w, http.StatusOK, map[string]string{
		"txSig": sig.String(),
	})
}

func (s *Server) callbackWebhook(contractID, sig, status string, meta map[string]interface{}) {
	payload := map[string]interface{}{
		"contractId": contractID,
		"sig":        sig,
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

func (s *Server) generateHMAC(payload, timestamp string) string {
	mac := hmac.New(sha256.New, []byte(s.config.HMACSecret))
	mac.Write([]byte(fmt.Sprintf("%s.%s", timestamp, payload)))
	return hex.EncodeToString(mac.Sum(nil))
}

func (s *Server) hmacMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip health check
		if r.URL.Path == "/v1/health" {
			next.ServeHTTP(w, r)
			return
		}

		timestamp := r.Header.Get("X-Timestamp")
		signature := r.Header.Get("X-Signature")

		if timestamp == "" || signature == "" {
			s.respondError(w, http.StatusUnauthorized, "Missing HMAC headers")
			return
		}

		// Verify timestamp is recent (within 5 minutes)
		ts, err := strconv.ParseInt(timestamp, 10, 64)
		if err != nil {
			s.respondError(w, http.StatusBadRequest, "Invalid timestamp")
			return
		}

		if time.Now().UnixMilli()-ts > 5*60*1000 {
			s.respondError(w, http.StatusUnauthorized, "Request expired")
			return
		}

		// Read body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			s.respondError(w, http.StatusBadRequest, "Failed to read body")
			return
		}

		// Restore body for next handler
		r.Body = io.NopCloser(bytes.NewBuffer(body))

		// Verify signature
		mac := hmac.New(sha256.New, []byte(s.config.HMACSecret))
		mac.Write([]byte(fmt.Sprintf("%s.%s", timestamp, string(body))))
		expectedSignature := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedSignature)) {
			s.respondError(w, http.StatusUnauthorized, "Invalid signature")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (s *Server) respondError(w http.ResponseWriter, status int, message string) {
	s.respondJSON(w, status, map[string]string{"error": message})
}
