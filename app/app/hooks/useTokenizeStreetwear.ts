import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getAssetPDA } from '../config/program';
import { uploadImageToIPFS, uploadMetadataToIPFS, createNFTMetadata, mockUploadToIPFS } from '../services/ipfs';

interface TokenizeParams {
  name: string;
  brand: string;
  model: string;
  size: string;
  condition: string;
  year: number;
  rarity: string;
  image: File;
}

export function useTokenizeStreetwear() {
  const { program } = useProgram();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    if (!program || !wallet) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('1. Subiendo imagen a IPFS...');
      // Usar mock para desarrollo, o uploadImageToIPFS para producción
      const imageUri = await mockUploadToIPFS(params.image);
      console.log('Imagen subida:', imageUri);

      console.log('2. Creando metadata...');
      const metadata = createNFTMetadata(
        params.name,
        params.brand.substring(0, 10).toUpperCase(),
        `${params.brand} ${params.model} - ${params.condition} (${params.year})`,
        imageUri,
        {
          brand: params.brand,
          model: params.model,
          size: params.size,
          condition: params.condition,
          year: params.year,
          rarity: params.rarity,
        }
      );

      // Para desarrollo, usar una URI mock
      // En producción: await uploadMetadataToIPFS(metadata)
      const uri = 'https://arweave.net/mock-metadata-uri';
      console.log('Metadata URI:', uri);

      console.log('3. Creando mint...');
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      console.log('4. Obteniendo PDAs...');
      const [assetPda] = await getAssetPDA(wallet.publicKey, mint);
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      console.log('Mint:', mint.toString());
      console.log('Asset PDA:', assetPda.toString());
      console.log('Token Account:', tokenAccount.toString());

      console.log('5. Enviando transacción...');
      
      // Convertir rarity string a enum value
      const rarityMap: Record<string, any> = {
        'Common': { common: {} },
        'Uncommon': { uncommon: {} },
        'Rare': { rare: {} },
        'Epic': { epic: {} },
        'Legendary': { legendary: {} },
      };

      const tx = await program.methods
        .tokenizeStreetwear(
          params.name,
          metadata.symbol,
          uri,
          params.brand,
          params.model,
          params.size,
          params.condition,
          params.year,
          rarityMap[params.rarity]
        )
        .accounts({
          owner: wallet.publicKey,
          assetAccount: assetPda,
          mint: mint,
          tokenAccount: tokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();

      console.log('✅ NFT Tokenizado!');
      console.log('Transaction:', tx);
      console.log('Mint Address:', mint.toString());

      return {
        signature: tx,
        mint: mint.toString(),
        assetPda: assetPda.toString(),
      };
    } catch (err: any) {
      console.error('Error tokenizing:', err);
      setError(err.message || 'Error al tokenizar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { tokenize, loading, error };
}

