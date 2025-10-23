import { useState, useEffect } from 'react';
import { supabaseTyped } from '@/lib/supabase';

export function useSupabaseTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Probando conexión con Supabase...');
        
        // Probar conexión básica
        const { data, error } = await supabaseTyped
          .from('articles')
          .select('count')
          .limit(1);

        if (error) {
          console.error('❌ Error de Supabase:', error);
          setError(error.message);
          setIsConnected(false);
        } else {
          console.log('✅ Supabase conectado correctamente');
          setIsConnected(true);
          setError(null);
        }

        // Probar obtener algunos artículos
        const { data: articles, error: articlesError } = await supabaseTyped
          .from('articles_with_likes')
          .select('*')
          .limit(5);

        if (articlesError) {
          console.error('❌ Error obteniendo artículos:', articlesError);
        } else {
          console.log('✅ Artículos obtenidos:', articles);
          setTestData(articles);
        }

      } catch (err) {
        console.error('❌ Error general:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return { isConnected, error, testData };
}
