# Variables de Entorno para UnboX

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Solana Configuration (requerido)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Google OAuth (opcional - solo si quieres autenticación con Google)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
# GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Pinata API Keys (opcional, para subida de imágenes a IPFS)
# Obtén tus keys en: https://pinata.cloud
# NEXT_PUBLIC_PINATA_API_KEY=tu_api_key_aqui
# NEXT_PUBLIC_PINATA_SECRET_KEY=tu_secret_key_aqui

# Alternativamente, usa Web3.Storage
# Obtén tu token en: https://web3.storage
# NEXT_PUBLIC_WEB3_STORAGE_TOKEN=tu_token_aqui

# Supabase Configuration (requerido para likes y datos de usuario)
# Obtén estos valores en: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

# Environment
NODE_ENV=production
```

## Configuración en Vercel

Para desplegar en Vercel, configura estas variables en el dashboard:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:
   - `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`: `https://api.devnet.solana.com`
   - `NEXT_PUBLIC_SOLANA_NETWORK`: `devnet`
   - `NEXT_PUBLIC_SUPABASE_URL`: `tu_url_de_supabase`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `tu_anon_key_de_supabase`
   - `NODE_ENV`: `production`

## Notas

- Las variables con `NEXT_PUBLIC_` son accesibles en el cliente
- Para desarrollo, puedes omitir las keys de IPFS y usar la función `mockUploadToIPFS`
- Las keys nunca deben commiterse al repositorio
- Las variables de Google OAuth son opcionales

