import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RiskExchange } from "../target/types/risk_exchange";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { expect } from "chai";

describe("risk-exchange", () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RiskExchange as Program<RiskExchange>;
  
  let usdcMint: PublicKey;
  let partyA: Keypair;
  let partyB: Keypair;
  let partyATokenAccount: PublicKey;
  let partyBTokenAccount: PublicKey;
  let oracleFeed: Keypair; // Mock Pyth feed

  before(async () => {
    // Create test keypairs
    partyA = Keypair.generate();
    partyB = Keypair.generate();
    oracleFeed = Keypair.generate();

    // Airdrop SOL for fees
    await provider.connection.requestAirdrop(
      partyA.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      partyB.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    // Create USDC mint
    usdcMint = await createMint(
      provider.connection,
      partyA,
      partyA.publicKey,
      null,
      6 // 6 decimals for USDC
    );

    // Create token accounts
    partyATokenAccount = await createAccount(
      provider.connection,
      partyA,
      usdcMint,
      partyA.publicKey
    );
    partyBTokenAccount = await createAccount(
      provider.connection,
      partyB,
      usdcMint,
      partyB.publicKey
    );

    // Mint USDC to both parties
    await mintTo(
      provider.connection,
      partyA,
      usdcMint,
      partyATokenAccount,
      partyA,
      1000000000 // 1000 USDC
    );
    await mintTo(
      provider.connection,
      partyB,
      usdcMint,
      partyBTokenAccount,
      partyB,
      1000000000 // 1000 USDC
    );
  });

  it("Initializes a contract", async () => {
    const underlyingId = 1; // BTC
    const strike = 50000 * 1e8; // $50,000 in fixed-point
    const expiryTs = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const notional = 1000 * 1e6; // 1000 USDC

    // Derive contract PDA
    const [contractPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("contract"),
        Buffer.from([underlyingId]),
        Buffer.from(strike.toString()),
        Buffer.from(expiryTs.toString()),
      ],
      program.programId
    );

    // Derive escrow PDA
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), contractPDA.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .initializeContract(
          underlyingId,
          new anchor.BN(strike),
          new anchor.BN(expiryTs),
          new anchor.BN(notional)
        )
        .accounts({
          contract: contractPDA,
          escrowTokenAccount: escrowPDA,
          partyA: partyA.publicKey,
          partyB: partyB.publicKey,
          oracle: oracleFeed.publicKey,
          usdcMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([partyA])
        .rpc();

      console.log("Initialize transaction:", tx);

      // Fetch and verify contract
      const contract = await program.account.contract.fetch(contractPDA);
      expect(contract.underlyingId).to.equal(underlyingId);
      expect(contract.strike.toString()).to.equal(strike.toString());
      expect(contract.state.init).to.be.true;
    } catch (err) {
      console.error("Error initializing contract:", err);
      throw err;
    }
  });

  it("Funds contract (party A)", async () => {
    // This test would fund the contract
    // Implementation depends on the actual contract PDA from previous test
  });

  it("Settles contract after expiry", async () => {
    // This test would:
    // 1. Fast-forward time to after expiry
    // 2. Mock Pyth price feed
    // 3. Call settle_contract
    // 4. Verify payouts
  });

  it("Cancels unfunded contract", async () => {
    // This test would:
    // 1. Create a contract
    // 2. Fund only one side
    // 3. Fast-forward past funding deadline
    // 4. Call cancel_unfunded
    // 5. Verify refund
  });
});

