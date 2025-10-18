'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function NetworkChecker() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>('');

  useEffect(() => {
    const checkNetwork = async () => {
      if (connection) {
        setNetwork(connection.rpcEndpoint);
        console.log('🌐 Network:', connection.rpcEndpoint);
        
        if (publicKey) {
          try {
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / LAMPORTS_PER_SOL);
            console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
          } catch (error) {
            console.error('Error getting balance:', error);
          }
        }
      }
    };

    checkNetwork();
  }, [connection, publicKey]);

  if (!publicKey) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm z-50">
      <div className="font-bold mb-2">🔍 Network Status</div>
      <div>Network: {network}</div>
      <div>Wallet: {publicKey.toString().slice(0, 8)}...</div>
      <div>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</div>
      {network.includes('devnet') ? (
        <div className="text-green-400">✅ Devnet</div>
      ) : (
        <div className="text-red-400">❌ Not Devnet</div>
      )}
    </div>
  );
}
