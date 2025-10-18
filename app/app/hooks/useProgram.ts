import { useMemo, useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PROGRAM_ID } from '../config/program';

// Import IDL as a dynamic import to avoid SSR issues
const idl = require('../idl/streetwear_tokenizer.json');

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (connection && wallet) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [connection, wallet]);

  const { program, provider } = useMemo(() => {
    console.log('useProgram - wallet:', !!wallet, 'connection:', !!connection, 'isReady:', isReady);
    
    if (!wallet || !connection || !isReady) {
      console.log('useProgram - Not ready, returning null');
      return { program: null, provider: null };
    }

    try {
      console.log('useProgram - Creating provider...');
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      );

      console.log('useProgram - Provider created:', !!provider);
      console.log('useProgram - Provider connection:', !!provider?.connection);
      console.log('useProgram - Provider wallet:', !!provider?.wallet);

      // Validate provider before creating program
      if (!provider || !provider.connection || !provider.wallet) {
        console.warn('Provider not ready');
        return { program: null, provider: null };
      }

      // Additional validation
      if (!idl || !PROGRAM_ID) {
        console.warn('IDL or PROGRAM_ID not available');
        return { program: null, provider: null };
      }

      // Check if provider has the required methods
      if (typeof provider.sendAndConfirm !== 'function') {
        console.warn('Provider missing sendAndConfirm method');
        return { program: null, provider: null };
      }

      console.log('useProgram - Creating program...');
      console.log('useProgram - IDL type:', typeof idl);
      console.log('useProgram - PROGRAM_ID:', PROGRAM_ID.toString());
      
      const program = new Program(idl as Idl, PROGRAM_ID, provider);
      console.log('useProgram - Program created successfully');

      return { program, provider };
    } catch (error) {
      console.error('Error creating program:', error);
      return { program: null, provider: null };
    }
  }, [connection, wallet, isReady]);

  return { program, provider, isReady };
}

