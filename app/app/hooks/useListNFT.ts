import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA, getEscrowPDA } from '../config/program';

export interface ListNFTParams {
  mint: string;
  price: number; // Precio en SOL (se convertirá a lamports)
}

export function useListNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wallet = useAnchorWallet();
  const { provider } = useProgram();

  const listNFT = async (params: ListNFTParams) => {
    if (!wallet || !provider) {
      throw new Error('Wallet o provider no disponible');
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Iniciando listado de NFT...');
      console.log('🎯 Parámetros:', params);

      const mint = new PublicKey(params.mint);
      const priceInLamports = Math.floor(params.price * 1e9); // Convertir SOL a lamports
      
      console.log(`💰 Precio: ${params.price} SOL (${priceInLamports} lamports)`);

      // 1. Obtener PDAs necesarios
      const [assetPda] = await getAssetPDA(wallet.publicKey, mint);
      const [escrowPda] = await getEscrowPDA(wallet.publicKey, mint);
      
      console.log('📍 Asset PDA:', assetPda.toString());
      console.log('📍 Escrow PDA:', escrowPda.toString());

      // 2. Crear instrucción manual
      const programId = new PublicKey('DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho');
      
      // Calcular discriminator para "list_nft" usando Anchor's method
      // Anchor usa sha256("global:list_nft")[0..8]
      const crypto = require('crypto');
      const discriminatorHash = crypto.createHash('sha256').update('global:list_nft').digest();
      const discriminator = discriminatorHash.slice(0, 8);
      
      console.log('🔑 Discriminator:', discriminator.toString('hex'));
      
      // Serializar argumentos (price: u64)
      const argsBuffer = Buffer.alloc(8);
      argsBuffer.writeBigUInt64LE(BigInt(priceInLamports), 0);
      
      console.log('📦 Args buffer:', argsBuffer.toString('hex'));

      // Crear instrucción con todas las cuentas necesarias según ListNft struct
      const instructionData = Buffer.concat([discriminator, argsBuffer]);
      
      const transaction = new Transaction().add({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // seller
          { pubkey: escrowPda, isSigner: false, isWritable: true }, // escrow_account
          { pubkey: mint, isSigner: false, isWritable: true }, // nft_mint
          { pubkey: assetPda, isSigner: false, isWritable: true }, // asset_account
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        ],
        programId: programId,
        data: instructionData
      });

      console.log('🔧 Instrucción creada, enviando transacción...');

      // 3. Enviar transacción
      const signature = await provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
      });

      console.log('✅ NFT listado exitosamente!');
      console.log('📝 Signature:', signature);

      return {
        signature,
        assetPda: assetPda.toString(),
        escrowPda: escrowPda.toString(),
        price: params.price
      };

    } catch (err: unknown) {
      console.error('❌ Error listando NFT:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al listar NFT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    listNFT,
    loading,
    error
  };
}
