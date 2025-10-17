use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho");

#[program]
pub mod streetwear_tokenizer {
    use super::*;

    // Tokenizar un artículo de streetwear (mint NFT)
    pub fn tokenize_streetwear(
        ctx: Context<TokenizeStreetwear>,
        name: String,
        symbol: String,
        uri: String,
        brand: String,
        model: String,
        size: String,
        condition: String,
        year: u16,
        rarity: Rarity,
    ) -> Result<()> {
        let asset_account = &mut ctx.accounts.asset_account;
        
        // Validaciones
        require!(year >= 1990 && year <= 2024, StreetwearError::InvalidYear);
        require!(!brand.is_empty(), StreetwearError::InvalidBrand);
        require!(!model.is_empty(), StreetwearError::InvalidModel);
        
        // Configurar la cuenta del activo
        asset_account.owner = ctx.accounts.owner.key();
        asset_account.mint = ctx.accounts.mint.key();
        asset_account.name = name;
        asset_account.symbol = symbol;
        asset_account.uri = uri;
        asset_account.brand = brand;
        asset_account.model = model;
        asset_account.size = size;
        asset_account.condition = condition;
        asset_account.year = year;
        asset_account.rarity = rarity;
        asset_account.is_listed = false;
        asset_account.bump = ctx.bumps.asset_account;

        // Mint 1 token (NFT)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        emit!(StreetwearTokenized {
            mint: ctx.accounts.mint.key(),
            owner: ctx.accounts.owner.key(),
            brand: asset_account.brand.clone(),
            model: asset_account.model.clone(),
            rarity: asset_account.rarity,
        });

        msg!("Streetwear item tokenized successfully: {}", ctx.accounts.mint.key());
        Ok(())
    }

    // Listar NFT para venta
    pub fn list_nft(ctx: Context<ListNft>, price: u64) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let asset_account = &mut ctx.accounts.asset_account;

        // Verificar que el NFT no esté ya listado
        require!(!asset_account.is_listed, StreetwearError::AlreadyListed);
        require!(price > 0, StreetwearError::InvalidPrice);

        // Configurar el escrow
        escrow_account.seller = ctx.accounts.seller.key();
        escrow_account.nft_mint = ctx.accounts.nft_mint.key();
        escrow_account.price = price;
        escrow_account.state = EscrowState::Listed;
        escrow_account.bump = ctx.bumps.escrow_account;

        // Marcar el activo como listado
        asset_account.is_listed = true;

        emit!(NftListed {
            mint: ctx.accounts.nft_mint.key(),
            seller: ctx.accounts.seller.key(),
            price,
        });

        msg!("NFT listed for sale at price: {}", price);
        Ok(())
    }

    // Comprar NFT
    pub fn buy_nft(ctx: Context<BuyNft>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let asset_account = &mut ctx.accounts.asset_account;

        // Verificar que el NFT esté listado
        require!(escrow_account.state == EscrowState::Listed, StreetwearError::NotListed);
        require!(asset_account.is_listed, StreetwearError::NotListed);

        // Transferir SOL del comprador al vendedor
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.buyer.key,
            ctx.accounts.seller.key,
            escrow_account.price,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.seller.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Transferir NFT del vendedor al comprador
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, 1)?;

        // Actualizar estados
        escrow_account.state = EscrowState::Sold;
        asset_account.is_listed = false;
        asset_account.owner = ctx.accounts.buyer.key();

        emit!(NftSold {
            mint: ctx.accounts.nft_mint.key(),
            seller: ctx.accounts.seller.key(),
            buyer: ctx.accounts.buyer.key(),
            price: escrow_account.price,
        });

        msg!("NFT sold successfully");
        Ok(())
    }

    // Cancelar listado
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        let asset_account = &mut ctx.accounts.asset_account;

        // Verificar que el NFT esté listado
        require!(escrow_account.state == EscrowState::Listed, StreetwearError::NotListed);
        require!(asset_account.is_listed, StreetwearError::NotListed);

        // Actualizar estados
        escrow_account.state = EscrowState::Cancelled;
        asset_account.is_listed = false;

        emit!(ListingCancelled {
            mint: ctx.accounts.nft_mint.key(),
            seller: ctx.accounts.seller.key(),
        });

        msg!("Listing cancelled successfully");
        Ok(())
    }
}

// Cuentas para tokenizar streetwear
#[derive(Accounts)]
#[instruction(name: String, symbol: String, uri: String)]
pub struct TokenizeStreetwear<'info> {
    #[account(mut, signer)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = owner,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 4 + 50 + 4 + 50 + 4 + 200 + 4 + 50 + 4 + 50 + 4 + 10 + 4 + 20 + 1 + 1 + 1, // discriminator + owner + mint + name + symbol + uri + brand + model + size + condition + year + rarity + is_listed + bump
        seeds = [b"asset", owner.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub asset_account: Account<'info, StreetwearAsset>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Cuentas para listar NFT
#[derive(Accounts)]
pub struct ListNft<'info> {
    #[account(mut, signer)]
    pub seller: Signer<'info>,
    
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 8 + 1 + 1, // discriminator + seller + nft_mint + price + state + bump
        seeds = [b"escrow", seller.key().as_ref(), nft_mint.key().as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = asset_account.owner == seller.key(),
        constraint = asset_account.mint == nft_mint.key(),
        seeds = [b"asset", asset_account.owner.as_ref(), nft_mint.key().as_ref()],
        bump = asset_account.bump
    )]
    pub asset_account: Account<'info, StreetwearAsset>,
    
    pub system_program: Program<'info, System>,
}

// Cuentas para comprar NFT
#[derive(Accounts)]
pub struct BuyNft<'info> {
    #[account(mut, signer)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub seller: SystemAccount<'info>,
    
    #[account(
        mut,
        constraint = escrow_account.seller == seller.key(),
        seeds = [b"escrow", seller.key().as_ref(), nft_mint.key().as_ref()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = asset_account.owner == seller.key(),
        constraint = asset_account.mint == nft_mint.key(),
        seeds = [b"asset", asset_account.owner.as_ref(), nft_mint.key().as_ref()],
        bump = asset_account.bump
    )]
    pub asset_account: Account<'info, StreetwearAsset>,
    
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = buyer,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Cuentas para cancelar listado
#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut, signer)]
    pub seller: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow_account.seller == seller.key(),
        seeds = [b"escrow", seller.key().as_ref(), nft_mint.key().as_ref()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = asset_account.owner == seller.key(),
        constraint = asset_account.mint == nft_mint.key(),
        seeds = [b"asset", asset_account.owner.as_ref(), nft_mint.key().as_ref()],
        bump = asset_account.bump
    )]
    pub asset_account: Account<'info, StreetwearAsset>,
}

// Estructura de cuenta de activo de streetwear
#[account]
pub struct StreetwearAsset {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub brand: String,
    pub model: String,
    pub size: String,
    pub condition: String,
    pub year: u16,
    pub rarity: Rarity,
    pub is_listed: bool,
    pub bump: u8,
}

// Estructura de cuenta de escrow
#[account]
pub struct EscrowAccount {
    pub seller: Pubkey,
    pub nft_mint: Pubkey,
    pub price: u64,
    pub state: EscrowState,
    pub bump: u8,
}

// Niveles de rareza para streetwear
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

// Estados del escrow
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowState {
    Listed,
    Sold,
    Cancelled,
}

// Errores personalizados
#[error_code]
pub enum StreetwearError {
    #[msg("Asset is already listed")]
    AlreadyListed,
    #[msg("Asset is not listed")]
    NotListed,
    #[msg("Invalid rarity level")]
    InvalidRarity,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid condition")]
    InvalidCondition,
    #[msg("Year must be between 1990 and current year")]
    InvalidYear,
    #[msg("Brand cannot be empty")]
    InvalidBrand,
    #[msg("Model cannot be empty")]
    InvalidModel,
    #[msg("Price must be greater than 0")]
    InvalidPrice,
}

// Eventos
#[event]
pub struct StreetwearTokenized {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub brand: String,
    pub model: String,
    pub rarity: Rarity,
}

#[event]
pub struct NftListed {
    pub mint: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
}

#[event]
pub struct NftSold {
    pub mint: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
}

#[event]
pub struct ListingCancelled {
    pub mint: Pubkey,
    pub seller: Pubkey,
}