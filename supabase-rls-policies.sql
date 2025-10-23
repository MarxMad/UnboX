-- UnboX RLS (Row Level Security) Policies
-- Ejecuta este SQL después del esquema principal en Supabase Dashboard

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- POLÍTICAS PARA USUARIOS
-- ==============================================

-- Cualquiera puede leer perfiles públicos
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Solo el usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- ==============================================
-- POLÍTICAS PARA ARTÍCULOS
-- ==============================================

-- Cualquiera puede leer artículos públicos
CREATE POLICY "Articles are viewable by everyone" ON articles
  FOR SELECT USING (true);

-- Solo el propietario puede actualizar sus artículos
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('app.current_user_wallet', true)
    )
  );

-- Solo el propietario puede eliminar sus artículos
CREATE POLICY "Users can delete own articles" ON articles
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('app.current_user_wallet', true)
    )
  );

-- Los usuarios autenticados pueden crear artículos
CREATE POLICY "Authenticated users can create articles" ON articles
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('app.current_user_wallet', true)
    )
  );

-- ==============================================
-- POLÍTICAS PARA LIKES
-- ==============================================

-- Cualquiera puede leer likes (para mostrar conteos)
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

-- Solo el usuario puede dar/quitar likes
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('app.current_user_wallet', true)
    )
  );

-- ==============================================
-- FUNCIÓN AUXILIAR PARA CONFIGURAR USUARIO ACTUAL
-- ==============================================

-- Función para establecer el wallet del usuario actual
CREATE OR REPLACE FUNCTION set_current_user_wallet(wallet_address TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_wallet', wallet_address, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- POLÍTICAS PARA VISTAS
-- ==============================================

-- La vista articles_with_likes hereda las políticas de las tablas base
-- No necesita políticas adicionales ya que es de solo lectura

-- ==============================================
-- CONFIGURACIÓN ADICIONAL
-- ==============================================

-- Crear índices adicionales para optimizar RLS
CREATE INDEX idx_users_wallet_rls ON users(wallet_address) WHERE wallet_address IS NOT NULL;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Perfiles de usuarios vinculados a wallets de Solana';
COMMENT ON TABLE articles IS 'Artículos de streetwear tokenizados como NFTs';
COMMENT ON TABLE likes IS 'Sistema de likes para artículos';
COMMENT ON FUNCTION set_current_user_wallet IS 'Establece el wallet del usuario actual para RLS';
COMMENT ON FUNCTION get_popular_articles IS 'Obtiene artículos ordenados por popularidad';
COMMENT ON FUNCTION user_liked_article IS 'Verifica si un usuario le dio like a un artículo';
