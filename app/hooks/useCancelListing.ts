import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idlData from '../idl/streetwear_tokenizer_simple.json';

const idl = idlData as any;

export function useCancelListing() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelListing = async (nftMint: string) => {
    if (!publicKey || !connection || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('❌ Iniciando cancelación de listado...');
      console.log('NFT Mint:', nftMint);
      console.log('Seller:', publicKey.toString());

      // Crear programa
      const programId = new PublicKey(idl.address);
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {});
      const program = new Program(idl, programId, provider);

      // Obtener PDA del escrow
      const [escrowPda] = await PublicKey.findProgramAddress(
        [Buffer.from('escrow'), publicKey.toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Escrow PDA:', escrowPda.toString());

      // Obtener PDA del asset
      const [assetPda] = await PublicKey.findProgramAddress(
        [Buffer.from('asset'), publicKey.toBuffer(), new PublicKey(nftMint).toBuffer()],
        programId
      );

      console.log('Asset PDA:', assetPda.toString());

      // Crear transacción
      const transaction = new Transaction();

      // Agregar instrucción de cancel_listing
      const cancelInstruction = await program.methods
        .cancelListing()
        .accounts({
          seller: publicKey,
          escrowAccount: escrowPda,
          nftMint: new PublicKey(nftMint),
          assetAccount: assetPda,
        })
        .instruction();

      transaction.add(cancelInstruction);

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

      console.log('✅ Listado cancelado exitosamente!');
      console.log('📝 Transaction:', tx);
      console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

      return {
        signature: tx,
      };

    } catch (err: unknown) {
      console.error('❌ Error canceling listing:', err);

      let errorMessage = 'Error al cancelar listado';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Mejorar mensajes de error
        if (err.message.includes('NotListed')) {
          errorMessage = 'Este NFT no está listado para venta';
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

  return { cancelListing, loading, error };
}
