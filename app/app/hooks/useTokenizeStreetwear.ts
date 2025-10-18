import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
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
  const { program, provider, isReady } = useProgram();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenize = async (params: TokenizeParams) => {
    if (!program || !wallet || !isReady || !provider) {
      throw new Error('Wallet not connected or program not ready');
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

      console.log('5. Creando instrucción personalizada...');
      
      // Convertir rarity string a bytes
      const rarityMap: Record<string, number> = {
        'Common': 0,
        'Uncommon': 1,
        'Rare': 2,
        'Epic': 3,
        'Legendary': 4,
      };

      const rarityValue = rarityMap[params.rarity] || 0;

      // Crear la instrucción usando el discriminador del IDL
      const discriminator = Buffer.from([5, 52, 127, 166, 66, 28, 85, 41]); // tokenize_streetwear discriminator
      
      // Serializar los argumentos
      const argsBuffer = Buffer.alloc(0);
      // Aquí necesitarías serializar los argumentos según el formato de Anchor
      // Por simplicidad, vamos a crear una instrucción básica
      
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: mint, isSigner: true, isWritable: true },
          { pubkey: tokenAccount, isSigner: false, isWritable: true },
          { pubkey: assetPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: program.programId,
        data: Buffer.concat([discriminator, argsBuffer])
      });

      console.log('6. Enviando transacción...');
      const transaction = new Transaction().add(instruction);
      
      const signature = await provider.sendAndConfirm(transaction, [mintKeypair], {
        commitment: 'confirmed',
      });

      console.log('✅ NFT Tokenizado!');
      console.log('Transaction:', signature);
      console.log('Mint Address:', mint.toString());

      return {
        signature,
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