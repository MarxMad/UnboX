import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idlData from '../idl/streetwear_tokenizer_simple.json';

const idl = idlData as any;

export function useBuyNFT() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyNFT = async (nftMint: string, seller: string) => {
    if (!publicKey || !connection || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Iniciando compra de NFT...');
      console.log('NFT Mint:', nftMint);
      console.log('Seller:', seller);
      console.log('Buyer:', publicKey.toString());

      // Crear programa
      const programId = new PublicKey(idl.address);
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {});
      const program = new Program(idl, programId, provider);

      // Obtener PDA del escrow
      const [escrowPda] = await PublicKey.findProgramAddress(
        [Buffer.from('escrow'), new PublicKey(seller).toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Escrow PDA:', escrowPda.toString());

      // Obtener PDA del asset
      const [assetPda] = await PublicKey.findProgramAddress(
        [Buffer.from('asset'), new PublicKey(seller).toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Asset PDA:', assetPda.toString());

      // Obtener token accounts
      const sellerTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(nftMint),
        new PublicKey(seller)
      );

      const buyerTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(nftMint),
        publicKey
      );

      console.log('Seller Token Account:', sellerTokenAccount.toString());
      console.log('Buyer Token Account:', buyerTokenAccount.toString());

      // Crear transacción
      const transaction = new Transaction();

      // Agregar instrucción de buy_nft
      const buyInstruction = await program.methods
        .buyNft()
        .accounts({
          buyer: publicKey,
          seller: new PublicKey(seller),
          escrowAccount: escrowPda,
          nftMint: new PublicKey(nftMint),
          assetAccount: assetPda,
          sellerTokenAccount: sellerTokenAccount,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      transaction.add(buyInstruction);

      // Obtener blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Firmar y enviar
      console.log('✍️ Firmando transacción...');
      const signedTransaction = await signTransaction(transaction);

      console.log('📤 Enviando transacción...');
      const tx = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('⏳ Esperando confirmación...');
      const confirmation = await connection.confirmTransaction({
        signature: tx,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ NFT comprado exitosamente!');
      console.log('📝 Transaction:', tx);
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      return {
        signature: tx,
      };

    } catch (err: unknown) {
      console.error('❌ Error buying NFT:', err);

      let errorMessage = 'Error al comprar NFT';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Mejorar mensajes de error
        if (err.message.includes('NotListed')) {
          errorMessage = 'Este NFT no está listado para venta';
        } else if (err.message.includes('InsufficientFunds')) {
          errorMessage = 'Fondos insuficientes para comprar este NFT';
        } else if (err.message.includes('User rejected')) {
          errorMessage = 'Transacción cancelada por el usuario';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Fondos insuficientes para completar la transacción';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { buyNFT, loading, error };
}
