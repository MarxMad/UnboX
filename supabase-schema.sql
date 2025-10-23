-- UnboX Database Schema
-- Ejecuta este SQL en el SQL Editor de Supabase Dashboard

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de artículos tokenizados
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nft_mint TEXT UNIQUE NOT NULL, -- Dirección del NFT en Solana
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT NOT NULL,
  year INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  image_url TEXT NOT NULL,
  ipfs_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de likes
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_nft_mint ON articles(nft_mint);
CREATE INDEX idx_articles_brand ON articles(brand);
CREATE INDEX idx_articles_year ON articles(year);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_article_id ON likes(article_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para artículos con conteo de likes
CREATE VIEW articles_with_likes AS
SELECT 
  a.*,
  u.username,
  u.display_name,
  u.avatar_url,
  COUNT(l.id) as likes_count
FROM articles a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN likes l ON a.id = l.article_id
GROUP BY a.id, u.username, u.display_name, u.avatar_url;

-- Función para obtener artículos populares
CREATE OR REPLACE FUNCTION get_popular_articles(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  brand TEXT,
  year INTEGER,
  image_url TEXT,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  likes_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.brand,
    a.year,
    a.image_url,
    u.username,
    u.display_name,
    u.avatar_url,
    COUNT(l.id) as likes_count,
    a.created_at
  FROM articles a
  LEFT JOIN users u ON a.user_id = u.id
  LEFT JOIN likes l ON a.id = l.article_id
  GROUP BY a.id, u.username, u.display_name, u.avatar_url
  ORDER BY likes_count DESC, a.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario le dio like a un artículo
CREATE OR REPLACE FUNCTION user_liked_article(user_wallet TEXT, article_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM likes l
    JOIN users u ON l.user_id = u.id
    WHERE u.wallet_address = user_wallet 
    AND l.article_id = article_uuid
  );
END;
$$ LANGUAGE plpgsql;
