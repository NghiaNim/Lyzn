use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111"); // Replace with actual program ID

#[program]
pub mod risk_exchange {
    use super::*;

    /// Initialize a contract on-chain
    /// Creates Contract PDA and Escrow USDC PDA; state=INIT
    pub fn initialize_contract(
        ctx: Context<InitializeContract>,
        underlying_id: u8,
        strike: i64, // Fixed-point price
        expiry_ts: i64,
        notional: u64,
    ) -> Result<()> {
        let contract = &mut ctx.accounts.contract;
        contract.underlying_id = underlying_id;
        contract.strike = strike;
        contract.expiry_ts = expiry_ts;
        contract.notional = notional;
        contract.oracle = ctx.accounts.oracle.key();
        contract.usdc_mint = ctx.accounts.usdc_mint.key();
        contract.state = ContractState::Init;
        contract.funded_a = false;
        contract.funded_b = false;
        contract.party_a = ctx.accounts.party_a.key();
        contract.party_b = ctx.accounts.party_b.key();
        contract.bump = ctx.bumps.contract;

        msg!("Contract initialized: {}", contract.key());
        emit!(ContractInitialized {
            contract: contract.key(),
            underlying_id,
            strike,
            expiry_ts,
            notional,
        });

        Ok(())
    }

    /// Fund the contract escrow with USDC
    /// State transitions: INIT → PARTIALLY_FUNDED → LIVE
    pub fn fund_contract(
        ctx: Context<FundContract>,
        side: FundingSide,
        amount: u64,
    ) -> Result<()> {
        let contract = &mut ctx.accounts.contract;

        require!(
            contract.state == ContractState::Init || contract.state == ContractState::PartiallyFunded,
            ErrorCode::InvalidContractStatus
        );

        // Transfer USDC to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update funding flags
        match side {
            FundingSide::A => {
                require!(!contract.funded_a, ErrorCode::AlreadyFunded);
                contract.funded_a = true;
            }
            FundingSide::B => {
                require!(!contract.funded_b, ErrorCode::AlreadyFunded);
                contract.funded_b = true;
            }
        }

        // Update state
        if contract.funded_a && contract.funded_b {
            contract.state = ContractState::Live;
            msg!("Contract is now LIVE");
            emit!(ContractLive {
                contract: contract.key(),
            });
        } else {
            contract.state = ContractState::PartiallyFunded;
            msg!("Contract is PARTIALLY_FUNDED");
        }

        emit!(ContractFunded {
            contract: contract.key(),
            side: side as u8,
            amount,
        });

        Ok(())
    }

    /// Settle the contract based on Pyth oracle price
    /// Reads Pyth price, verifies freshness/status/confidence, calculates payoff, pays winner
    pub fn settle_contract(ctx: Context<SettleContract>) -> Result<()> {
        let contract = &mut ctx.accounts.contract;

        require!(
            contract.state == ContractState::Live,
            ErrorCode::InvalidContractStatus
        );

        require!(
            Clock::get()?.unix_timestamp >= contract.expiry_ts,
            ErrorCode::ContractNotExpired
        );

        // Read and verify Pyth price feed
        let price_data = pyth::read_price_feed(
            &ctx.accounts.oracle,
            Clock::get()?.unix_timestamp,
        )?;

        // Calculate payoff
        let delta = price_data.price - contract.strike;
        
        // Determine which party is LONG and which is SHORT
        // For simplicity, assume party_a is LONG and party_b is SHORT
        // In production, you'd store this in the contract
        let long_party = contract.party_a;
        let short_party = contract.party_b;

        let long_payoff = if delta > 0 {
            // LONG wins: max(0, delta) * units
            // Convert delta (fixed-point) to notional units
            // Assuming strike and price are in same fixed-point format
            let payoff_amount = (delta as u64)
                .checked_mul(contract.notional)
                .and_then(|x| x.checked_div(contract.strike.abs() as u64))
                .unwrap_or(0);
            payoff_amount
        } else {
            0
        };

        let short_payoff = if delta < 0 {
            // SHORT wins: max(0, -delta) * units
            let abs_delta = (-delta) as u64;
            let payoff_amount = abs_delta
                .checked_mul(contract.notional)
                .and_then(|x| x.checked_div(contract.strike.abs() as u64))
                .unwrap_or(0);
            payoff_amount
        } else {
            0
        };

        // Get escrow balance
        let escrow_balance = ctx.accounts.escrow_token_account.amount;
        
        // Calculate total required payout
        let total_payout = long_payoff + short_payoff;
        
        // Cap payout to escrow balance
        let long_payout = long_payoff.min(escrow_balance);
        let short_payout = if long_payout < escrow_balance {
            short_payoff.min(escrow_balance - long_payout)
        } else {
            0
        };

        // Transfer to winner(s)
        if long_payout > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.long_token_account.to_account_info(),
                authority: ctx.accounts.contract.to_account_info(),
            };
            let seeds = &[
                b"escrow",
                contract.key().as_ref(),
                &[ctx.bumps.escrow],
            ];
            let signer = &[&seeds[..]];
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, long_payout)?;
        }

        if short_payout > 0 {
            let remaining_balance = escrow_balance
                .checked_sub(long_payout)
                .unwrap_or(0);
            let actual_short_payout = short_payout.min(remaining_balance);
            
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.short_token_account.to_account_info(),
                authority: ctx.accounts.contract.to_account_info(),
            };
            let seeds = &[
                b"escrow",
                contract.key().as_ref(),
                &[ctx.bumps.escrow],
            ];
            let signer = &[&seeds[..]];
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, actual_short_payout)?;
        }

        // Refund remainder (if any)
        let final_balance = ctx.accounts.escrow_token_account.amount;
        if final_balance > 0 {
            // Split remainder between parties (or refund to one party)
            // For simplicity, refund to party_a
            let refund_a = final_balance / 2;
            let refund_b = final_balance - refund_a;

            if refund_a > 0 {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.long_token_account.to_account_info(),
                    authority: ctx.accounts.contract.to_account_info(),
                };
                let seeds = &[
                    b"escrow",
                    contract.key().as_ref(),
                    &[ctx.bumps.escrow],
                ];
                let signer = &[&seeds[..]];
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, refund_a)?;
            }

            if refund_b > 0 {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.short_token_account.to_account_info(),
                    authority: ctx.accounts.contract.to_account_info(),
                };
                let seeds = &[
                    b"escrow",
                    contract.key().as_ref(),
                    &[ctx.bumps.escrow],
                ];
                let signer = &[&seeds[..]];
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, refund_b)?;
            }
        }

        // Close escrow account
        let close_accounts = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.payer.to_account_info(),
            authority: ctx.accounts.contract.to_account_info(),
        };
        let seeds = &[
            b"escrow",
            contract.key().as_ref(),
            &[ctx.bumps.escrow],
        ];
        let signer = &[&seeds[..]];
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, close_accounts, signer);
        token::close_account(cpi_ctx)?;

        // Update contract state
        contract.state = ContractState::Settled;
        contract.settlement_price = Some(price_data.price);
        contract.settlement_confidence = Some(price_data.conf);

        msg!("Contract settled: price = {}, confidence = {}", price_data.price, price_data.conf);

        emit!(ContractSettled {
            contract: contract.key(),
            price: price_data.price,
            confidence: price_data.conf,
            timestamp: Clock::get()?.unix_timestamp,
            long_payout,
            short_payout,
        });

        Ok(())
    }

    /// Cancel unfunded contract after funding deadline
    /// Refunds the funded side
    pub fn cancel_unfunded(ctx: Context<CancelUnfunded>) -> Result<()> {
        let contract = &mut ctx.accounts.contract;

        require!(
            contract.state == ContractState::Init || contract.state == ContractState::PartiallyFunded,
            ErrorCode::InvalidContractStatus
        );

        // Check if funding deadline has passed
        let funding_deadline = contract.expiry_ts - 7 * 24 * 60 * 60; // 7 days before expiry
        require!(
            Clock::get()?.unix_timestamp >= funding_deadline,
            ErrorCode::FundingDeadlineNotPassed
        );

        // Refund funded side
        let escrow_balance = ctx.accounts.escrow_token_account.amount;
        
        if escrow_balance > 0 {
            if contract.funded_a {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.party_a_token_account.to_account_info(),
                    authority: ctx.accounts.contract.to_account_info(),
                };
                let seeds = &[
                    b"escrow",
                    contract.key().as_ref(),
                    &[ctx.bumps.escrow],
                ];
                let signer = &[&seeds[..]];
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, escrow_balance)?;
            } else if contract.funded_b {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.party_b_token_account.to_account_info(),
                    authority: ctx.accounts.contract.to_account_info(),
                };
                let seeds = &[
                    b"escrow",
                    contract.key().as_ref(),
                    &[ctx.bumps.escrow],
                ];
                let signer = &[&seeds[..]];
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, escrow_balance)?;
            }
        }

        // Close escrow
        let close_accounts = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.payer.to_account_info(),
            authority: ctx.accounts.contract.to_account_info(),
        };
        let seeds = &[
            b"escrow",
            contract.key().as_ref(),
            &[ctx.bumps.escrow],
        ];
        let signer = &[&seeds[..]];
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, close_accounts, signer);
        token::close_account(cpi_ctx)?;

        contract.state = ContractState::Cancelled;

        emit!(ContractCancelled {
            contract: contract.key(),
            refunded_amount: escrow_balance,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(underlying_id: u8, strike: i64, expiry_ts: i64, notional: u64)]
pub struct InitializeContract<'info> {
    #[account(
        init,
        payer = party_a,
        space = 8 + Contract::LEN,
        seeds = [b"contract", underlying_id.to_le_bytes().as_ref(), strike.to_le_bytes().as_ref(), expiry_ts.to_le_bytes().as_ref()],
        bump
    )]
    pub contract: Account<'info, Contract>,

    #[account(
        init,
        payer = party_a,
        token::mint = usdc_mint,
        token::authority = contract,
        seeds = [b"escrow", contract.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub party_a: Signer<'info>,

    /// CHECK: Party B signature verified off-chain
    pub party_b: AccountInfo<'info>,

    /// CHECK: Pyth price feed account
    pub oracle: AccountInfo<'info>,

    pub usdc_mint: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundContract<'info> {
    #[account(mut)]
    pub contract: Account<'info, Contract>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub payer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SettleContract<'info> {
    #[account(mut)]
    pub contract: Account<'info, Contract>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// CHECK: Pyth price feed account
    pub oracle: AccountInfo<'info>,

    #[account(mut)]
    pub long_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub short_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelUnfunded<'info> {
    #[account(mut)]
    pub contract: Account<'info, Contract>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub party_a_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub party_b_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Contract {
    pub underlying_id: u8,
    pub strike: i64, // Fixed-point price
    pub expiry_ts: i64,
    pub notional: u64,
    pub oracle: Pubkey,
    pub usdc_mint: Pubkey,
    pub state: ContractState,
    pub funded_a: bool,
    pub funded_b: bool,
    pub party_a: Pubkey,
    pub party_b: Pubkey,
    pub settlement_price: Option<i64>,
    pub settlement_confidence: Option<u64>,
    pub bump: u8,
}

impl Contract {
    pub const LEN: usize = 1 + 8 + 8 + 8 + 32 + 32 + 1 + 1 + 1 + 32 + 32 + 1 + 9 + 9 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ContractState {
    Init,
    PartiallyFunded,
    Live,
    Settled,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum FundingSide {
    A = 0,
    B = 1,
}

// Events
#[event]
pub struct ContractInitialized {
    pub contract: Pubkey,
    pub underlying_id: u8,
    pub strike: i64,
    pub expiry_ts: i64,
    pub notional: u64,
}

#[event]
pub struct ContractFunded {
    pub contract: Pubkey,
    pub side: u8,
    pub amount: u64,
}

#[event]
pub struct ContractLive {
    pub contract: Pubkey,
}

#[event]
pub struct ContractSettled {
    pub contract: Pubkey,
    pub price: i64,
    pub confidence: u64,
    pub timestamp: i64,
    pub long_payout: u64,
    pub short_payout: u64,
}

#[event]
pub struct ContractCancelled {
    pub contract: Pubkey,
    pub refunded_amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid contract status")]
    InvalidContractStatus,
    #[msg("Contract has not expired yet")]
    ContractNotExpired,
    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,
    #[msg("Already funded")]
    AlreadyFunded,
    #[msg("Funding deadline has not passed")]
    FundingDeadlineNotPassed,
    #[msg("Pyth price feed error")]
    PythPriceFeedError,
}

// Pyth helper module
mod pyth {
    use super::*;
    use anchor_lang::solana_program::program_error::ProgramError;

    const MAX_STALENESS: i64 = 60; // 60 seconds
    const MAX_CONFIDENCE_THRESHOLD: u64 = 1000000; 
    // Pyth uses a different account structure - we'll parse it more flexibly

    // Pyth price account structure offsets
    const MAGIC_OFFSET: usize = 0;
    const VERSION_OFFSET: usize = 4;
    const PRICE_TYPE_OFFSET: usize = 5;
    const PRICE_EXP_OFFSET: usize = 9;
    const PRICE_OFFSET: usize = 13;
    const CONF_OFFSET: usize = 21;
    const STATUS_OFFSET: usize = 29;
    const CORP_STATUS_OFFSET: usize = 30;
    const PUB_SLOT_OFFSET: usize = 31;
    const PREV_PUB_SLOT_OFFSET: usize = 39;
    const PREV_PRICE_OFFSET: usize = 47;
    const PREV_CONF_OFFSET: usize = 55;
    const PREV_TIMESTAMP_OFFSET: usize = 63;
    const DRV1_OFFSET: usize = 71;
    const DRV2_OFFSET: usize = 79;
    const DRV3_OFFSET: usize = 87;
    const PRODUCT_ACCOUNT_KEY_OFFSET: usize = 95;
    const NEXT_ACCOUNT_KEY_OFFSET: usize = 127;
    const PREV_ACCOUNT_KEY_OFFSET: usize = 159;
    const PRICE_ACCOUNT_KEY_OFFSET: usize = 191;

    #[derive(PartialEq, Eq)]
    enum PriceStatus {
        Unknown = 0,
        Trading = 1,
        Halted = 2,
        Auction = 3,
    }

    pub struct PriceData {
        pub price: i64,
        pub conf: u64,
        pub expo: i32,
    }

    pub fn read_price_feed(
        oracle_account: &AccountInfo,
        current_timestamp: i64,
    ) -> Result<PriceData> {
        let data = oracle_account.try_borrow_data()?;
        
        // Verify minimum size
        require!(
            data.len() >= 200,
            ErrorCode::PythPriceFeedError
        );

        // Pyth price accounts have a specific structure
        // We'll parse the price data directly from known offsets
        // The account should be at least 200 bytes for a valid price feed

        // Parse price exponent
        let expo = i32::from_le_bytes([
            data[PRICE_EXP_OFFSET],
            data[PRICE_EXP_OFFSET + 1],
            data[PRICE_EXP_OFFSET + 2],
            data[PRICE_EXP_OFFSET + 3],
        ]);

        // Parse price (i64, 8 bytes)
        let price = i64::from_le_bytes([
            data[PRICE_OFFSET],
            data[PRICE_OFFSET + 1],
            data[PRICE_OFFSET + 2],
            data[PRICE_OFFSET + 3],
            data[PRICE_OFFSET + 4],
            data[PRICE_OFFSET + 5],
            data[PRICE_OFFSET + 6],
            data[PRICE_OFFSET + 7],
        ]);

        // Parse confidence (u64, 8 bytes)
        let conf = u64::from_le_bytes([
            data[CONF_OFFSET],
            data[CONF_OFFSET + 1],
            data[CONF_OFFSET + 2],
            data[CONF_OFFSET + 3],
            data[CONF_OFFSET + 4],
            data[CONF_OFFSET + 5],
            data[CONF_OFFSET + 6],
            data[CONF_OFFSET + 7],
        ]);

        // Parse status
        let status = data[STATUS_OFFSET];
        require!(
            status == PriceStatus::Trading as u8,
            ErrorCode::PythPriceFeedError
        );

        // Parse publish timestamp (i64, 8 bytes)
        let publish_time = i64::from_le_bytes([
            data[PREV_TIMESTAMP_OFFSET],
            data[PREV_TIMESTAMP_OFFSET + 1],
            data[PREV_TIMESTAMP_OFFSET + 2],
            data[PREV_TIMESTAMP_OFFSET + 3],
            data[PREV_TIMESTAMP_OFFSET + 4],
            data[PREV_TIMESTAMP_OFFSET + 5],
            data[PREV_TIMESTAMP_OFFSET + 6],
            data[PREV_TIMESTAMP_OFFSET + 7],
        ]);

        // Verify freshness
        require!(
            current_timestamp - publish_time <= MAX_STALENESS,
            ErrorCode::PythPriceFeedError
        );

        // Verify confidence threshold
        require!(
            conf <= MAX_CONFIDENCE_THRESHOLD,
            ErrorCode::PythPriceFeedError
        );

        // Normalize price to fixed-point format (with -8 exponent for consistency)
        // Price is already in the format: price * 10^expo
        // We'll keep it as-is but ensure it's in a consistent format
        let normalized_price = if expo != -8 {
            // Convert to -8 exponent format
            // price * 10^expo = normalized_price * 10^-8
            // normalized_price = price * 10^(expo + 8)
            let expo_diff = expo + 8;
            if expo_diff > 0 {
                price.checked_mul(10i64.pow(expo_diff as u32))
                    .ok_or(ErrorCode::PythPriceFeedError)?
            } else if expo_diff < 0 {
                price.checked_div(10i64.pow((-expo_diff) as u32))
                    .ok_or(ErrorCode::PythPriceFeedError)?
            } else {
                price
            }
        } else {
            price
        };

        Ok(PriceData {
            price: normalized_price,
            conf,
            expo: -8, // Normalized to -8
        })
    }
}
