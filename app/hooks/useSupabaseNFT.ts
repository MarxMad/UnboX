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
  
  // Verificar que el contexto esté disponible antes de usarlo
  let supabaseContext;
  try {
    supabaseContext = useSupabaseContext();
  } catch (err) {
    console.log('⚠️ useSupabaseContext no disponible:', err);
    supabaseContext = { supabase: null, isSupabaseReady: false };
  }
  
  const { supabase, isSupabaseReady } = supabaseContext || { supabase: null, isSupabaseReady: false };

  const fetchNFT = async () => {
    if (!mintAddress) {
      console.log('🔍 useSupabaseNFT - mintAddress vacío');
      return;
    }

    if (!supabase || !isSupabaseReady) {
      console.log('🔍 useSupabaseNFT - Supabase no disponible, esperando...');
      setError('Supabase no está disponible');
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
          setError('NFT no encontrado en la base de datos');
        } else {
          console.error('❌ Error de Supabase:', fetchError);
          throw fetchError;
        }
      } else {
        console.log('✅ NFT encontrado en Supabase:', data);
        setNft(data);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error buscando NFT en Supabase:', err);
      setError('Error cargando NFT desde Supabase');
      setNft(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mintAddress) {
      if (supabase && isSupabaseReady) {
        fetchNFT();
      } else {
        console.log('⏳ Esperando que Supabase esté listo...');
        setLoading(true);
        
        // Timeout para evitar espera infinita
        const timeout = setTimeout(() => {
          console.log('⏰ Timeout esperando Supabase, usando fallback');
          setLoading(false);
          setError('Supabase no está disponible');
          
          // Crear NFT placeholder como fallback
          const fallbackNFT: SupabaseNFT = {
            id: 'fallback',
            nft_mint: mintAddress,
            title: 'NFT Cargando...',
            brand: 'Loading',
            year: 2024,
            condition: 'unknown',
            image_url: 'https://via.placeholder.com/600x600/1a1a1a/ffffff?text=Loading...',
            user_id: 'unknown',
            likes_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setNft(fallbackNFT);
        }, 5000); // 5 segundos timeout
        
        return () => clearTimeout(timeout);
      }
    }
  }, [mintAddress, supabase, isSupabaseReady]);

  return { nft, loading, error, refetch: fetchNFT };
}
