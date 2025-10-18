# Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto `app/` con las siguientes variables:

```env
# Pinata API Keys (opcional, para subida de imágenes a IPFS)
# Obtén tus keys en: https://pinata.cloud
NEXT_PUBLIC_PINATA_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_PINATA_SECRET_KEY=tu_secret_key_aqui

# Alternativamente, usa Web3.Storage
# Obtén tu token en: https://web3.storage
# NEXT_PUBLIC_WEB3_STORAGE_TOKEN=tu_token_aqui

# Solana Network (devnet, testnet, mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Notas

- Las variables con `NEXT_PUBLIC_` son accesibles en el cliente
- Para desarrollo, puedes omitir las keys de IPFS y usar la función `mockUploadToIPFS`
- Las keys nunca deben commiterse al repositorio

