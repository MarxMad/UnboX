import { useMemo } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PROGRAM_ID } from '../config/program';

// Import IDL as a dynamic import to avoid SSR issues
const idl = require('../idl/streetwear_tokenizer.json');

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { program, provider } = useMemo(() => {
    if (!wallet) {
      return { program: null, provider: null };
    }

    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    return { program, provider };
  }, [connection, wallet]);

  return { program, provider };
}

