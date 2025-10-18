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
    if (!wallet || !connection) {
      return { program: null, provider: null };
    }

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      );

      // Validate provider before creating program
      if (!provider || !provider.connection || !provider.wallet) {
        console.warn('Provider not ready');
        return { program: null, provider: null };
      }

      const program = new Program(idl as Idl, PROGRAM_ID, provider);

      return { program, provider };
    } catch (error) {
      console.error('Error creating program:', error);
      return { program: null, provider: null };
    }
  }, [connection, wallet]);

  return { program, provider, isReady };
}

