use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Token, Transfer, MintTo};

declare_id!("REaLEst8FrAct1on1111111111111111111111111");

pub const SCALE: u128 = 1_000_000_000u128; // 1e9 fixed-point

#[program]
pub mod real_estate_fractionalizer {
    use super::*;

    /// Initialize a property account. This stores property metadata and PDAs.
    /// NOTE: This instruction records the provided `fraction_mint` and creates
    /// the `PropertyAccount`. Creating the actual SPL mint and token accounts
    /// may be done in separate CPIs if desired (see TODOs).
    pub fn initialize_property(
        ctx: Context<InitializeProperty>,
        metadata_uri: String,
        total_fractions: u64,
        fraction_decimal: u8,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property_account;
        property.property_key = *property.to_account_info().key;
        property.authority = ctx.accounts.authority.key();
        property.nft_mint = ctx.accounts.nft_mint.key();
        property.fraction_mint = ctx.accounts.fraction_mint.key();
        property.total_fractions = total_fractions;
        property.fraction_decimal = fraction_decimal;
        property.cum_rent_per_share = 0u128;
        property.bump = *ctx.bumps.get("property_account").unwrap();
        property.metadata_uri = metadata_uri;

        // TODO: initialize fraction_mint account here via CPI to token program
        // and set its mint_authority to the program-derived PDA.

        Ok(())
    }

    /// Deposit the NFT into the escrow vault PDA. The client should transfer
    /// the NFT (SPL token with supply=1) into `nft_vault_account` which is
    /// owned by the `nft_vault` PDA. This instruction verifies ownership.
    pub fn deposit_nft_into_vault(ctx: Context<DepositNftIntoVault>) -> Result<()> {
        // Ensure the NFT mint matches property
        require_keys_eq!(ctx.accounts.property_account.nft_mint, ctx.accounts.nft_mint.key());

        // Ensure token account holds 1 NFT
        let vault_amount = ctx.accounts.nft_vault_account.amount;
        require!(vault_amount == 1, ErrorCode::InvalidNftVaultAmount);

        Ok(())
    }

    /// Mint fractions into owner token account. Only property authority may call.
    pub fn mint_fractions(ctx: Context<MintFractions>, amount: u64) -> Result<()> {
        let property = &ctx.accounts.property_account;
        require!(ctx.accounts.authority.key() == property.authority, ErrorCode::Unauthorized);

        // Mint fractions via CPI - expects mint_authority to be program PDA
        let cpi_accounts = MintTo {
            mint: ctx.accounts.fraction_mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.mint_authority.clone(),
        };
        let seeds: &[&[u8]] = &[b"mint_authority", &[ctx.accounts.mint_authority_bump]];
        let signer = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::mint_to(CpiContext::new_with_signer(cpi_program, cpi_accounts, signer), amount)?;

        Ok(())
    }

    /// Buy fractions: buyer pays `price` USDC to `seller_usdc_account`, and program
    /// transfers fraction tokens to buyer. Reward accounting is updated.
    pub fn buy_fractions(ctx: Context<BuyFractions>, fraction_amount: u64, price: u64) -> Result<()> {
        // Transfer USDC from buyer to seller (or property authority)
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_usdc.to_account_info(),
            to: ctx.accounts.seller_usdc.to_account_info(),
            authority: ctx.accounts.buyer.clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), price)?;

        // Update holder accounting: source is property authority (minted tokens)
        // Update destination holder PDA
        let dest_holder = &mut ctx.accounts.dest_holder;
        let before_balance = dest_holder.balance as u128;
        let add_balance = fraction_amount as u128;

        // pending = balance * cum_rent_per_share - reward_debt
        // update reward_debt to (new_balance * cum)
        let new_balance = before_balance.checked_add(add_balance).ok_or(ErrorCode::NumericOverflow)?;
        dest_holder.balance = new_balance as u64;
        dest_holder.reward_debt = new_balance.checked_mul(ctx.accounts.property_account.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;

        // Transfer fraction tokens via CPI (must go through program to enforce accounting)
        let cpi_accounts_f = Transfer {
            from: ctx.accounts.source_fraction_ata.to_account_info(),
            to: ctx.accounts.dest_fraction_ata.to_account_info(),
            authority: ctx.accounts.source_authority.clone(),
        };
        // source authority is a PDA; sign with its seeds
        let seeds: &[&[u8]] = &[b"fraction_authority", &[ctx.accounts.source_authority_bump]];
        let signer = &[&seeds[..]];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts_f, signer), fraction_amount)?;

        Ok(())
    }

    /// Deposit rent (USDC) into RentVault PDA and update cumulative rent per share.
    pub fn deposit_rent(ctx: Context<DepositRent>, amount: u64) -> Result<()> {
        let property = &mut ctx.accounts.property_account;
        // Transfer USDC from payer to rent vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_usdc.to_account_info(),
            to: ctx.accounts.rent_vault_ata.to_account_info(),
            authority: ctx.accounts.payer.clone(),
        };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts), amount)?;

        // cum_rent_per_share += (amount * SCALE) / total_fractions
        let amount_u128 = amount as u128;
        let total = property.total_fractions as u128;
        require!(total > 0, ErrorCode::NoFractions);
        let increment = amount_u128.checked_mul(SCALE).ok_or(ErrorCode::NumericOverflow)?.checked_div(total).ok_or(ErrorCode::NumericOverflow)?;
        property.cum_rent_per_share = property.cum_rent_per_share.checked_add(increment).ok_or(ErrorCode::NumericOverflow)?;

        Ok(())
    }

    /// Claim rent for a holder: calculate pending = (balance * cum) - reward_debt
    /// Transfer USDC from rent vault to holder and update reward_debt.
    pub fn claim_rent(ctx: Context<ClaimRent>) -> Result<()> {
        let holder = &mut ctx.accounts.holder_state;
        let property = &ctx.accounts.property_account;

        let balance_u128 = holder.balance as u128;
        let accrued = balance_u128.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;
        let pending = accrued.checked_sub(holder.reward_debt).ok_or(ErrorCode::NoPendingRewards)?;

        // pending is scaled by SCALE. Convert to token amount (u64)
        let payout_u128 = pending.checked_div(SCALE).ok_or(ErrorCode::NumericOverflow)?;
        let payout: u64 = payout_u128.try_into().map_err(|_| ErrorCode::NumericOverflow)?;

        if payout > 0 {
            // Transfer USDC from rent vault to user
            let cpi_accounts = Transfer {
                from: ctx.accounts.rent_vault_ata.to_account_info(),
                to: ctx.accounts.receiver_usdc.to_account_info(),
                authority: ctx.accounts.rent_vault_authority.clone(),
            };
            let seeds: &[&[u8]] = &[b"rent_vault", ctx.accounts.property_account.fraction_mint.as_ref(), &[ctx.accounts.rent_vault_bump]];
            let signer = &[&seeds[..]];
            token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer), payout)?;
        }

        // Update reward_debt to balance * cum
        holder.reward_debt = balance_u128.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;

        Ok(())
    }
}

// --------------------
// Accounts and Contexts
// --------------------

#[account]
pub struct PropertyAccount {
    pub property_key: Pubkey,
    pub authority: Pubkey,
    pub nft_mint: Pubkey,
    pub fraction_mint: Pubkey,
    pub total_fractions: u64,
    pub fraction_decimal: u8,
    pub cum_rent_per_share: u128,
    pub bump: u8,
    pub metadata_uri: String,
}

#[account]
pub struct HolderState {
    pub holder: Pubkey,
    pub property: Pubkey,
    pub balance: u64,
    pub reward_debt: u128,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(metadata_uri: String, total_fractions: u64, fraction_decimal: u8)]
pub struct InitializeProperty<'info> {
    #[account(init, payer = authority, space = 8 + 32*4 + 8 + 1 + 16 + 1 + 4 + metadata_uri.len())]
    pub property_account: Account<'info, PropertyAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: NFT mint pubkey reference
    pub nft_mint: AccountInfo<'info>,

    /// CHECK: Fraction mint (SPL) - will be stored in property. Creating the mint
    /// is left as a CPI in a follow-up instruction.
    pub fraction_mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositNftIntoVault<'info> {
    #[account(mut, has_one = nft_mint)]
    pub property_account: Account<'info, PropertyAccount>,

    /// CHECK: NFT mint
    pub nft_mint: AccountInfo<'info>,

    /// CHECK: Token account holding the NFT (must be owned by nft_vault PDA)
    pub nft_vault_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct MintFractions<'info> {
    #[account(mut, has_one = authority)]
    pub property_account: Account<'info, PropertyAccount>,
    #[account(mut)]
    pub fraction_mint: Account<'info, Mint>,
    /// CHECK: mint authority PDA
    pub mint_authority: AccountInfo<'info>,
    pub mint_authority_bump: u8,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyFractions<'info> {
    #[account(mut)]
    pub property_account: Account<'info, PropertyAccount>,

    /// CHECK: source authority (PDA) for fraction tokens
    pub source_authority: AccountInfo<'info>,
    pub source_authority_bump: u8,

    #[account(mut)]
    pub source_fraction_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub dest_fraction_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller_usdc: Account<'info, TokenAccount>,

    #[account(init_if_needed, payer = buyer, space = 8 + 32 + 32 + 8 + 16 + 1, seeds = [b"holder", buyer.key().as_ref(), property_account.key().as_ref()], bump)]
    pub dest_holder: Account<'info, HolderState>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositRent<'info> {
    #[account(mut)]
    pub property_account: Account<'info, PropertyAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub payer_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub rent_vault_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRent<'info> {
    #[account(mut)]
    pub property_account: Account<'info, PropertyAccount>,
    #[account(mut, has_one = property)]
    pub holder_state: Account<'info, HolderState>,
    #[account(mut)]
    pub rent_vault_ata: Account<'info, TokenAccount>,
    /// CHECK: rent_vault authority PDA
    pub rent_vault_authority: AccountInfo<'info>,
    pub rent_vault_bump: u8,
    #[account(mut)]
    pub receiver_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// --------------------
// Errors
// --------------------

#[error_code]
pub enum ErrorCode {
    #[msg("Numeric overflow occurred")]
    NumericOverflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid NFT vault amount")]
    InvalidNftVaultAmount,
    #[msg("No fractions minted")]
    NoFractions,
    #[msg("No pending rewards")]
    NoPendingRewards,
}
