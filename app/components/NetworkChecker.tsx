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
    <div className="fixed bottom-4 left-4 bg-black/60 text-white p-2 rounded-md text-xs z-40 opacity-75 hover:opacity-100 transition-opacity">
      <div className="font-semibold mb-1">🌐 {network.includes('devnet') ? 'Devnet' : 'Network'}</div>
      <div>💰 {balance !== null ? `${balance.toFixed(2)} SOL` : 'Loading...'}</div>
      <div className="text-gray-300">{publicKey.toString().slice(0, 6)}...</div>
    </div>
  );
}
