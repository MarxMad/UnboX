# 🎨 UnboX Frontend - Streetwear Tokenizer

Frontend de la aplicación UnboX para tokenizar y comercializar artículos de streetwear en Solana.

## 🚀 Características

- ✅ **Autenticación con Wallet** - Soporte para Phantom y Solflare
- ✅ **Tokenización de Artículos** - Interfaz intuitiva para crear NFTs
- ✅ **Marketplace** - Compra y vende artículos tokenizados
- ✅ **Dashboard Personal** - Gestiona tu colección
- ✅ **Diseño Responsive** - Optimizado para móvil y desktop
- ✅ **UI Moderna** - Gradientes, animaciones y efectos glassmorphism

## 📦 Stack Tecnológico

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Blockchain**: Solana (Devnet)
- **Wallet Adapter**: @solana/wallet-adapter-react
- **Íconos**: Lucide React
- **Storage**: IPFS (Pinata/Web3.Storage)

## 🛠️ Instalación

```bash
# Instalar dependencias
cd app
npm install

# Configurar variables de entorno (opcional)
# Ver ENV_EXAMPLE.md para detalles
cp ENV_EXAMPLE.md .env.local

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
app/
├── app/
│   ├── components/        # Componentes reutilizables
│   │   ├── Navbar.tsx     # Navegación principal
│   │   ├── NFTCard.tsx    # Card de NFT para marketplace
│   │   └── MyNFTCard.tsx  # Card de NFT para dashboard
│   ├── config/            # Configuración
│   │   └── program.ts     # Config del programa Solana
│   ├── context/           # Context providers
│   │   └── WalletContextProvider.tsx
│   ├── services/          # Servicios
│   │   └── ipfs.ts        # Servicio de IPFS
│   ├── dashboard/         # Página de dashboard
│   ├── tokenize/          # Página de tokenización
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de marketplace
│   └── globals.css        # Estilos globales
├── public/                # Assets estáticos
└── package.json
```

## 🎨 Páginas

### 1. Marketplace (`/`)
- Muestra artículos en venta
- Filtros por marca
- Stats del marketplace
- Compra de NFTs

### 2. Tokenizar (`/tokenize`)
- Formulario para crear NFTs
- Upload de imágenes
- Metadata del artículo
- Integración con programa Solana

### 3. Dashboard (`/dashboard`)
- Colección personal
- Stats del usuario
- Gestión de listados
- Venta de NFTs

## 🔧 Configuración

### Wallet Adapter

El frontend soporta las siguientes wallets:
- Phantom
- Solflare

Para agregar más wallets, edita `app/context/WalletContextProvider.tsx`

### Program ID

El Program ID está configurado en `app/config/program.ts`:

```typescript
export const PROGRAM_ID = new PublicKey('DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho');
```

### IPFS Configuration

Para subir imágenes a IPFS, configura las API keys de Pinata en `.env.local`:

```env
NEXT_PUBLIC_PINATA_API_KEY=tu_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=tu_secret_key
```

Alternativamente, usa la función `mockUploadToIPFS` para desarrollo sin IPFS.

## 🎯 Próximos Pasos

Para integrar completamente con el programa Solana:

1. **Copiar el IDL** del programa a `app/idl/streetwear_tokenizer.json`
2. **Implementar las instrucciones** en la página de tokenización:
   ```typescript
   import idl from '@/idl/streetwear_tokenizer.json';
   const program = new Program(idl, programId, provider);
   await program.methods.tokenizeStreetwear(...).rpc();
   ```
3. **Fetch NFTs** desde el programa para marketplace y dashboard
4. **Implementar buy_nft** en `NFTCard.tsx`
5. **Implementar list_nft** en `MyNFTCard.tsx`

## 🚨 Modo Desarrollo

Actualmente el frontend usa datos mock para demostración. Para conectar con el programa real:

1. Asegúrate de tener el programa deployado en Devnet
2. Copia el IDL generado por Anchor
3. Implementa las llamadas RPC usando `@coral-xyz/anchor`
4. Configura el provider con la wallet conectada

## 🎨 Personalización

### Colores

Los colores principales están definidos en `globals.css` y usan gradientes:
- Primary: Purple (#667eea) to Pink (#764ba2)
- Background: Dark gradient

### Componentes

Todos los componentes usan clases de Tailwind y la clase custom `.glass-card` para efectos de glassmorphism.

## 📱 Responsive

El diseño es completamente responsive:
- Mobile: Navegación inferior
- Tablet: Grid adaptativo
- Desktop: Navegación superior completa

## 🐛 Troubleshooting

### Error: "Wallet not connected"
- Asegúrate de tener Phantom o Solflare instalado
- Haz clic en "Select Wallet" y conecta

### Error: "Failed to fetch"
- Verifica que el RPC endpoint esté disponible
- Prueba con otro RPC de Devnet

### Imágenes no cargan
- Verifica las URLs de las imágenes
- Si usas IPFS, espera a que el contenido se propague

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor abre un issue o PR.

---

**Desarrollado para el hackathon Solana - UnboX** 🚀

