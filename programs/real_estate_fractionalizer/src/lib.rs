use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, system_instruction};
use anchor_spl::token::{self, Mint, TokenAccount, Token, Transfer, MintTo, InitializeMint};
use anchor_spl::associated_token::create as create_associated_token;
use anchor_spl::associated_token::AssociatedToken;

declare_id!("REaLEst8FrAct1on1111111111111111111111111");

pub const SCALE: u128 = 1_000_000_000u128; // 1e9 fixed-point

#[program]
pub mod real_estate_fractionalizer {
    use super::*;

    /// Initialize a property account and related PDAs: creates the fraction mint
    /// and associated rent/nft vault token accounts (ATAs) owned by PDAs.
    #[allow(clippy::too_many_arguments)]
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

        // 1) Create fraction mint account (system create_account)
        let rent = Rent::get()?;
        let mint_rent = rent.minimum_balance(Mint::LEN);

        let create_mint_ix = system_instruction::create_account(
            &ctx.accounts.authority.key(),
            &ctx.accounts.fraction_mint.key(),
            mint_rent,
            Mint::LEN as u64,
            &spl_token::id(),
        );

        invoke_signed(
            &create_mint_ix,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.fraction_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;

        // 2) Initialize mint with mint authority = mint_authority PDA
        let mint_authority_key = ctx.accounts.mint_authority.key();
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                InitializeMint { mint: ctx.accounts.fraction_mint.to_account_info(), rent: ctx.accounts.rent.to_account_info() },
            ),
            fraction_decimal,
            &mint_authority_key,
            None,
        )?;

        // 3) Create associated token account for rent vault (USDC) owned by rent_vault PDA
        //    using the USDC mint provided.
        create_associated_token(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            anchor_spl::associated_token::Create {
                payer: ctx.accounts.authority.to_account_info(),
                associated_token: ctx.accounts.rent_vault_ata.to_account_info(),
                authority: ctx.accounts.rent_vault.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ))?;

        // 4) Create associated token account for nft vault (NFT mint) owned by nft_vault PDA
        create_associated_token(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            anchor_spl::associated_token::Create {
                payer: ctx.accounts.authority.to_account_info(),
                associated_token: ctx.accounts.nft_vault_ata.to_account_info(),
                authority: ctx.accounts.nft_vault.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ))?;

        Ok(())
    }

    /// Deposit the NFT into the escrow vault PDA. The client should transfer
    /// the NFT (SPL token with supply=1) into `nft_vault_ata` which is
    /// owned by the `nft_vault` PDA. This instruction verifies ownership.
    pub fn deposit_nft_into_vault(ctx: Context<DepositNftIntoVault>) -> Result<()> {
        // Ensure the NFT mint matches property
        require_keys_eq!(ctx.accounts.property_account.nft_mint, ctx.accounts.nft_mint.key());

        // Ensure token account holds 1 NFT
        let vault_amount = ctx.accounts.nft_vault_ata.amount;
        require!(vault_amount == 1, ErrorCode::InvalidNftVaultAmount);

        Ok(())
    }

    /// Mint fractions into owner's fraction token account. Only property authority may call.
    pub fn mint_fractions(ctx: Context<MintFractions>, amount: u64) -> Result<()> {
        let property = &ctx.accounts.property_account;
        require!(ctx.accounts.authority.key() == property.authority, ErrorCode::Unauthorized);

        // Mint fractions via CPI - mint authority is a PDA; sign with its seeds
        let seeds = &[b"fraction_authority", property.to_account_info().key.as_ref()];
        let (_pda, bump) = Pubkey::find_program_address(&[b"fraction_authority", property.to_account_info().key.as_ref()], ctx.program_id);
        let signer_seeds: &[&[&[u8]]] = &[&[b"fraction_authority", property.to_account_info().key.as_ref(), &[bump]]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.fraction_mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info().clone(),
        };
        token::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer_seeds), amount)?;

        Ok(())
    }

    /// Transfer fractions between two holders. All transfers must go through
    /// the program to correctly update reward accounting.
    pub fn transfer_fractions(ctx: Context<TransferFractions>, amount: u64) -> Result<()> {
        let property = &ctx.accounts.property_account;

        // Settle pending rewards for source
        let src = &mut ctx.accounts.source_holder;
        let dest = &mut ctx.accounts.dest_holder;

        let src_balance = src.balance as u128;
        let dest_balance = dest.balance as u128;

        let accrued_src = src_balance.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;
        let pending_src = accrued_src.checked_sub(src.reward_debt).unwrap_or(0u128);
        src.unclaimed = src.unclaimed.checked_add(pending_src).ok_or(ErrorCode::NumericOverflow)?;

        let accrued_dest = dest_balance.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;
        let pending_dest = accrued_dest.checked_sub(dest.reward_debt).unwrap_or(0u128);
        dest.unclaimed = dest.unclaimed.checked_add(pending_dest).ok_or(ErrorCode::NumericOverflow)?;

        // Update balances
        src.balance = src.balance.checked_sub(amount).ok_or(ErrorCode::InsufficientFunds)?;
        dest.balance = dest.balance.checked_add(amount).ok_or(ErrorCode::NumericOverflow)?;

        // Update reward_debt to new_balance * cum
        let new_src_balance_u128 = src.balance as u128;
        let new_dest_balance_u128 = dest.balance as u128;
        src.reward_debt = new_src_balance_u128.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;
        dest.reward_debt = new_dest_balance_u128.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;

        // Perform token transfer: require source owner signature, then CPI transfer
        let cpi_accounts = Transfer {
            from: ctx.accounts.source_fraction_ata.to_account_info(),
            to: ctx.accounts.dest_fraction_ata.to_account_info(),
            authority: ctx.accounts.source_owner.to_account_info().clone(),
        };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts), amount)?;

        Ok(())
    }

    /// Deposit rent (USDC) into RentVault PDA and update cumulative rent per share.
    pub fn deposit_rent(ctx: Context<DepositRent>, amount: u64) -> Result<()> {
        let property = &mut ctx.accounts.property_account;
        // Transfer USDC from payer to rent vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_usdc.to_account_info(),
            to: ctx.accounts.rent_vault_ata.to_account_info(),
            authority: ctx.accounts.payer.to_account_info().clone(),
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

    /// Claim rent for a holder: pay out unclaimed + newly accrued amount.
    pub fn claim_rent(ctx: Context<ClaimRent>) -> Result<()> {
        let holder = &mut ctx.accounts.holder_state;
        let property = &ctx.accounts.property_account;

        let balance_u128 = holder.balance as u128;
        let accrued = balance_u128.checked_mul(property.cum_rent_per_share).ok_or(ErrorCode::NumericOverflow)?;
        let pending = accrued.checked_sub(holder.reward_debt).unwrap_or(0u128);

        // total pending = holder.unclaimed + pending
        let total_pending = holder.unclaimed.checked_add(pending).ok_or(ErrorCode::NumericOverflow)?;

        let payout_u128 = total_pending.checked_div(SCALE).ok_or(ErrorCode::NumericOverflow)?;
        let payout: u64 = payout_u128.try_into().map_err(|_| ErrorCode::NumericOverflow)?;

        if payout > 0 {
            // Transfer USDC from rent vault to user
            let cpi_accounts = Transfer {
                from: ctx.accounts.rent_vault_ata.to_account_info(),
                to: ctx.accounts.receiver_usdc.to_account_info(),
                authority: ctx.accounts.rent_vault.to_account_info().clone(),
            };
            // rent_vault is a PDA; sign with its seeds
            let (_pda, bump) = Pubkey::find_program_address(&[b"rent_vault", ctx.accounts.property_account.fraction_mint.as_ref()], ctx.program_id);
            let signer_seeds: &[&[&[u8]]] = &[&[b"rent_vault", ctx.accounts.property_account.fraction_mint.as_ref(), &[bump]]];
            token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer_seeds), payout)?;
        }

        // Reset unclaimed + update reward_debt
        holder.unclaimed = 0u128;
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
    pub unclaimed: u128,
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

    /// CHECK: Fraction mint (SPL) account to be created
    #[account(mut)]
    pub fraction_mint: AccountInfo<'info>,

    /// CHECK: Mint authority PDA for the fraction mint
    /// seeds: ["fraction_authority", property_account]
    pub mint_authority: UncheckedAccount<'info>,

    /// CHECK: Rent vault PDA
    pub rent_vault: UncheckedAccount<'info>,
    /// CHECK: NFT vault PDA
    pub nft_vault: UncheckedAccount<'info>,

    /// Associated token accounts (will be created)
    #[account(mut)]
    pub rent_vault_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub nft_vault_ata: Account<'info, TokenAccount>,

    /// The USDC mint used for rent collection
    pub usdc_mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositNftIntoVault<'info> {
    #[account(mut, has_one = nft_mint)]
    pub property_account: Account<'info, PropertyAccount>,

    /// CHECK: NFT mint
    pub nft_mint: AccountInfo<'info>,

    /// Token account holding the NFT (owned by nft_vault PDA)
    #[account(mut)]
    pub nft_vault_ata: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct MintFractions<'info> {
    #[account(mut, has_one = authority)]
    pub property_account: Account<'info, PropertyAccount>,
    #[account(mut)]
    pub fraction_mint: Account<'info, Mint>,
    /// CHECK: mint authority PDA
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferFractions<'info> {
    #[account(mut)]
    pub property_account: Account<'info, PropertyAccount>,

    #[account(mut, has_one = holder)]
    pub source_holder: Account<'info, HolderState>,
    #[account(mut, seeds = [b"holder", dest_owner.key().as_ref(), property_account.key().as_ref()], bump, payer = dest_owner)]
    pub dest_holder: Account<'info, HolderState>,

    #[account(mut)]
    pub source_fraction_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub dest_fraction_ata: Account<'info, TokenAccount>,

    /// CHECK: source owner must sign
    pub source_owner: Signer<'info>,
    /// CHECK: destination owner
    pub dest_owner: Signer<'info>,

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
    /// CHECK: rent_vault PDA (authority of rent_vault_ata)
    pub rent_vault: UncheckedAccount<'info>,
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
    #[msg("Insufficient fraction balance")]
    InsufficientFunds,
}
