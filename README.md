# 🏷️ Streetwear Tokenizer

Una plataforma de tokenización de activos físicos de streetwear construida en Solana usando Anchor Framework. Permite a los coleccionistas tokenizar, listar y vender sus artículos de streetwear como NFTs.

## 🎯 Características

### ✅ MVP Features
- **Tokenización de Streetwear**: Convierte artículos físicos en NFTs con metadatos detallados
- **Sistema de Escrow**: Listado y venta segura de NFTs
- **Categorización Avanzada**: Sistema de rareza y clasificación por marca/modelo
- **Validaciones de Seguridad**: Verificaciones de autenticidad y propiedad
- **Eventos On-Chain**: Tracking completo de transacciones

### 🏗️ Arquitectura del Programa

#### Funciones Principales
1. **`tokenize_streetwear`**: Tokeniza un artículo físico en NFT
2. **`list_nft`**: Lista un NFT para venta
3. **`buy_nft`**: Compra un NFT listado
4. **`cancel_listing`**: Cancela un listado activo

#### Estructuras de Datos
- **`StreetwearAsset`**: Información del artículo tokenizado
- **`EscrowAccount`**: Estado de venta del NFT
- **`Rarity`**: Niveles de rareza (Common, Uncommon, Rare, Epic, Legendary)
- **`EscrowState`**: Estados del escrow (Listed, Sold, Cancelled)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Rust 1.70+
- Solana CLI v1.18+
- Anchor Framework v0.32+
- Node.js 16+

### Instalación Completa (Guía Paso a Paso)

#### 1. **Clonar el repositorio**
```bash
git clone https://github.com/MarxMad/UnboX.git
cd UnboX/streetwear-tokenizer
```

#### 2. **Instalar Solana CLI**
```bash
# Instalar Solana (macOS/Linux)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Agregar al PATH
export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Verificar instalación
solana --version
```

#### 3. **Instalar Anchor CLI**
```bash
# Instalar Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Verificar instalación
anchor --version
```

#### 4. **Configurar Solana para Devnet**
```bash
# Configurar cluster
solana config set --url https://api.devnet.solana.com

# Verificar configuración
solana config get

# Crear wallet (si no tienes una)
solana-keygen new

# Ver tu dirección pública
solana address

# Fondear wallet con SOL de devnet
solana airdrop 3
```

#### 5. **Instalar dependencias del proyecto**
```bash
# Instalar dependencias npm
npm install

# O con yarn
yarn install
```

#### 6. **Compilar el programa**
```bash
# Agregar feature idl-build al Cargo.toml si es necesario
# Compilar con Anchor
anchor build
```

#### 7. **Desplegar en Devnet**
```bash
# Desplegar el programa
anchor deploy

# El output mostrará:
# - Program ID
# - Transaction signature
# - IDL account
```

#### 8. **Verificar el Deployment**
```bash
# Ver información del programa
solana program show <PROGRAM_ID>

# Ver la transacción en el explorer
# https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
```

### 🔧 Solución de Problemas Comunes

#### Error: "no such command: build-sbf"
**Solución:**
```bash
# Asegúrate de tener las herramientas de Solana en el PATH
export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Agrégalo permanentemente a tu shell
echo 'export PATH="/Users/$USER/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Error: "Building IDL failed"
**Solución:**
Agrega el feature `idl-build` en `Cargo.toml`:
```toml
[features]
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]
```

#### Error: "Insufficient funds"
**Solución:**
```bash
# Verifica tu balance
solana balance

# Solicita más SOL de devnet
solana airdrop 2
```

### 📱 Conectar tu Aplicación al Programa

Una vez desplegado, puedes conectarte al programa desde tu aplicación:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StreetwearTokenizer } from "./target/types/streetwear_tokenizer";

// Configurar provider
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Cargar el programa
const programId = new anchor.web3.PublicKey("DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho");
const program = anchor.workspace.StreetwearTokenizer as Program<StreetwearTokenizer>;

// Ahora puedes interactuar con el programa
const tx = await program.methods
  .tokenizeStreetwear(/* parámetros */)
  .accounts({/* cuentas */})
  .rpc();
```

## 📖 Uso del Programa

### Tokenizar un Artículo

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StreetwearTokenizer } from "./target/types/streetwear_tokenizer";

const program = anchor.workspace.StreetwearTokenizer as Program<StreetwearTokenizer>;

// Datos del artículo
const name = "Air Jordan 1 Retro";
const symbol = "AJ1";
const uri = "https://example.com/metadata.json";
const brand = "Nike";
const model = "Air Jordan 1";
const size = "US 10";
const condition = "New";
const year = 2023;
const rarity = { common: {} };

// Tokenizar
const tx = await program.methods
  .tokenizeStreetwear(
    name, symbol, uri, brand, model, 
    size, condition, year, rarity
  )
  .accounts({
    owner: user.publicKey,
    mint: mintKeypair.publicKey,
    // ... otros accounts
  })
  .signers([mintKeypair])
  .rpc();
```

### Listar NFT para Venta

```typescript
const price = new anchor.BN(1000000000); // 1 SOL en lamports

const tx = await program.methods
  .listNft(price)
  .accounts({
    seller: user.publicKey,
    nftMint: nftMint,
    // ... otros accounts
  })
  .rpc();
```

### Comprar NFT

```typescript
const tx = await program.methods
  .buyNft()
  .accounts({
    buyer: buyer.publicKey,
    seller: seller.publicKey,
    nftMint: nftMint,
    // ... otros accounts
  })
  .rpc();
```

## 🧪 Testing

Ejecutar los tests:

```bash
# Tests de integración
anchor test

# Tests específicos
npm test
```

### Estructura de Tests
- **Tokenización**: Verifica la creación correcta de NFTs
- **Listado**: Prueba el sistema de escrow
- **Compra**: Valida las transacciones de compra
- **Cancelación**: Verifica la cancelación de listados

## 📊 Especificaciones Técnicas

### 🚀 Deployment en Devnet

**Program ID (Devnet):**
```
DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho
```

**IDL Account:**
```
8B4Jx6WDYQjdf38UnyFVWjLu8EwQ5L7dLMHZetF6KSam
```

**Deployment Transaction:**
```
377qPx9UpueBE3MvNPaXY6GTMwocX8KHPxKsz5PMWgv1LbJtyQUcPk3TuVuTVCsX29VS7877L9trGwpAfJeHj3u5
```

**Explorer Links:**
- [Ver Programa en Solana Explorer](https://explorer.solana.com/address/DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho?cluster=devnet)
- [Ver Transacción de Deployment](https://explorer.solana.com/tx/377qPx9UpueBE3MvNPaXY6GTMwocX8KHPxKsz5PMWgv1LbJtyQUcPk3TuVuTVCsX29VS7877L9trGwpAfJeHj3u5?cluster=devnet)

### Dependencias
- `anchor-lang`: Framework principal
- `anchor-spl`: Integración con SPL tokens
- `solana-program`: APIs de Solana

### Estructura de Cuentas
```
StreetwearAsset:
- owner: Pubkey (32 bytes)
- mint: Pubkey (32 bytes)
- name: String (4 + variable)
- symbol: String (4 + variable)
- uri: String (4 + variable)
- brand: String (4 + variable)
- model: String (4 + variable)
- size: String (4 + variable)
- condition: String (4 + variable)
- year: u16 (2 bytes)
- rarity: Rarity (1 byte)
- is_listed: bool (1 byte)
- bump: u8 (1 byte)
```

## 🔒 Seguridad

### Validaciones Implementadas
- ✅ Verificación de propiedad antes de listar
- ✅ Validación de precios (debe ser > 0)
- ✅ Verificación de estados de escrow
- ✅ Validación de años (1990-2024)
- ✅ Verificación de marcas y modelos no vacíos

### Errores Personalizados
- `AlreadyListed`: NFT ya está listado
- `NotListed`: NFT no está listado
- `InvalidPrice`: Precio inválido
- `InvalidYear`: Año fuera del rango válido
- `InvalidBrand`: Marca vacía
- `InvalidModel`: Modelo vacío

## 🎨 Frontend (Próximamente)

### Características Planificadas
- 🔄 Interfaz de usuario React/Next.js
- 📱 Autenticación con wallets (Phantom, Solflare)
- 🖼️ Subida de imágenes a IPFS
- 📊 Dashboard de colección personal
- 🔍 Explorador de marketplace

## 🚀 Roadmap

### Fase 1 - MVP ✅
- [x] Tokenización básica
- [x] Sistema de escrow
- [x] Validaciones de seguridad
- [x] Eventos on-chain

### Fase 2 - Mejoras
- [ ] Integración con Metaplex
- [ ] Sistema de royalties
- [ ] Verificación de autenticidad
- [ ] API de precios

### Fase 3 - Marketplace
- [ ] Frontend completo
- [ ] Sistema de ofertas
- [ ] Integración social
- [ ] Analytics avanzados

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Arquitectura Solana**: Anchor Framework
- **Blockchain**: Solana Devnet/Mainnet

## 📞 Contacto

- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)
- **Twitter**: [@tu-twitter](https://twitter.com/tu-twitter)
- **Email**: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Solana Foundation por el ecosistema
- Anchor Framework por las herramientas
- Comunidad de Solana por el apoyo

---

**¡Construyendo el futuro de la tokenización de streetwear en Solana! 🚀**
