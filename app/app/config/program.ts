import { PublicKey } from '@solana/web3.js';

// Program ID deployado en Devnet
export const PROGRAM_ID = new PublicKey('DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho');

// Seeds para PDAs
export const ASSET_SEED = 'asset';
export const ESCROW_SEED = 'escrow';

// Configuración de red
export const NETWORK = 'devnet';
export const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Rarities
export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
}

// Escrow States
export enum EscrowState {
  Listed = 'Listed',
  Sold = 'Sold',
  Cancelled = 'Cancelled',
}

// Helper para obtener PDA de Asset
export const getAssetPDA = async (owner: PublicKey, mint: PublicKey): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(ASSET_SEED),
      owner.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ID
  );
};

// Helper para obtener PDA de Escrow
export const getEscrowPDA = async (seller: PublicKey, nftMint: PublicKey): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(ESCROW_SEED),
      seller.toBuffer(),
      nftMint.toBuffer(),
    ],
    PROGRAM_ID
  );
};

