import { useState, useEffect } from 'react';
import { useSupabaseContext } from '../components/SupabaseProvider';

export interface SupabaseNFT {
  id: string;
  nft_mint: string;
  title: string;
  description?: string;
  brand: string;
  year: number;
  condition: string;
  image_url: string;
  ipfs_hash?: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export function useSupabaseNFT(mintAddress: string) {
  const [nft, setNft] = useState<SupabaseNFT | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, isSupabaseReady } = useSupabaseContext();

  const fetchNFT = async () => {
    if (!supabase || !isSupabaseReady || !mintAddress) {
      console.log('🔍 useSupabaseNFT - Supabase no disponible o mintAddress vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando NFT en Supabase:', mintAddress);

      // Buscar el NFT por mint address
      const { data, error: fetchError } = await supabase
        .from('articles_with_likes')
        .select('*')
        .eq('nft_mint', mintAddress)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No se encontró el NFT
          console.log('❌ NFT no encontrado en Supabase:', mintAddress);
          setNft(null);
        } else {
          throw fetchError;
        }
      } else {
        console.log('✅ NFT encontrado en Supabase:', data);
        setNft(data);
      }
    } catch (err) {
      console.error('❌ Error buscando NFT en Supabase:', err);
      setError('Error cargando NFT desde Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mintAddress && supabase && isSupabaseReady) {
      fetchNFT();
    }
  }, [mintAddress, supabase, isSupabaseReady]);

  return { nft, loading, error, refetch: fetchNFT };
}
