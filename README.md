# 🎨 UnboX - Streetwear Tokenizer Platform

> **Tokeniza, valida y comercializa tu streetwear en Solana**

UnboX es una plataforma descentralizada que permite a los coleccionistas de streetwear tokenizar sus artículos como NFTs verificables en la blockchain de Solana, eliminando falsificaciones y creando liquidez para el mercado de coleccionables.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple?style=flat-square&logo=solana)](https://solana.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 🌟 Características Principales

### 🔐 **Principios Cypherpunk**
- **Privacidad**: Autenticación descentralizada con wallets Web3
- **Descentralización**: Smart contracts autónomos en Solana
- **Código Abierto**: Transparencia total y auditoría comunitaria
- **Resistencia a Censura**: Infraestructura distribuida sin puntos de falla únicos

### 🚀 **Funcionalidades Core**
- ✅ **Tokenización de Streetwear** - Convierte artículos físicos en NFTs verificables
- ✅ **Marketplace P2P** - Compra y vende sin intermediarios
- ✅ **Autenticación Web3** - Soporte para Phantom, Solflare y más
- ✅ **Storage Descentralizado** - Imágenes y metadata en IPFS
- ✅ **Dashboard Personal** - Gestiona tu colección digital
- ✅ **UI/UX Moderna** - Diseño responsive con glassmorphism

## 🏗️ Arquitectura Técnica

### **Frontend**
- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Wallet Integration**: @solana/wallet-adapter-react
- **Storage**: IPFS (Pinata/Web3.Storage)

### **Blockchain**
- **Network**: Solana Devnet
- **Framework**: Anchor
- **Program ID**: `DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho`
- **Token Standard**: SPL Token (NFTs con supply=1, decimals=0)

### **Smart Contract Features**
```rust
// Funciones principales del programa
pub fn tokenize_streetwear()  // Tokenizar artículo
pub fn list_nft()            // Listar para venta
pub fn buy_nft()             // Comprar NFT
pub fn cancel_listing()      // Cancelar listado
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/MarxMad/UnboX.git
cd UnboX
```

### **2. Configurar Solana**
```bash
# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Configurar para Devnet
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2 ~/.config/solana/id.json
```

### **3. Desplegar Smart Contract**
```bash
# Instalar dependencias
npm install

# Construir y desplegar programa
anchor build
anchor deploy
```

### **4. Configurar Frontend**
```bash
cd app
npm install

# Configurar variables de entorno
cp ENV_EXAMPLE.md .env.local
# Editar .env.local con tus claves
```

### **5. Iniciar Desarrollo**
```bash
# Terminal 1: Frontend
cd app
npm run dev

# Terminal 2: Solana Test Validator (opcional)
solana-test-validator
```

## 🔧 Variables de Entorno

Crea un archivo `.env.local` en la carpeta `app/`:

```env
# Solana Configuration (requerido)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Pinata API Keys (opcional, para IPFS)
NEXT_PUBLIC_PINATA_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_PINATA_SECRET_KEY=tu_secret_key_aqui

# Google OAuth (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

## 📱 Uso de la Plataforma

### **1. Conectar Wallet**
- Instala Phantom o Solflare
- Conecta tu wallet a la plataforma
- Asegúrate de tener SOL en Devnet

### **2. Tokenizar Artículo**
1. Ve a `/tokenize`
2. Sube una foto de tu artículo
3. Completa los detalles (marca, modelo, año, condición)
4. Configura tu PIN de seguridad
5. Confirma la transacción

### **3. Gestionar Colección**
- Ve a `/dashboard` para ver tus NFTs
- Lista artículos para venta
- Transfiere NFTs a otros usuarios

## 🧪 Testing

### **Tests del Smart Contract**
```bash
# Ejecutar tests de Anchor
anchor test

# Tests específicos
npm test
```

### **Tests del Frontend**
```bash
cd app
npm run test
```

## 📊 Estructura del Proyecto

```
UnboX/
├── app/                          # Frontend Next.js
│   ├── components/               # Componentes React
│   ├── hooks/                   # Custom hooks
│   ├── services/                # Servicios (IPFS, etc.)
│   ├── config/                  # Configuración
│   └── pages/                   # Páginas de la app
├── programs/                    # Smart contracts
│   └── streetwear-tokenizer/   # Programa principal
├── tests/                       # Tests de Anchor
├── migrations/                  # Scripts de despliegue
└── target/                      # Build artifacts
```

## 🔒 Seguridad

### **Smart Contract**
- ✅ Validaciones de entrada completas
- ✅ Manejo de errores personalizado
- ✅ Protección contra reentrancy
- ✅ Verificación de ownership

### **Frontend**
- ✅ Validación de wallet conectado
- ✅ Verificación de balance suficiente
- ✅ Manejo seguro de claves privadas

## 🌐 Despliegue

### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### **Configuración en Vercel Dashboard**
1. Ve a Settings → Environment Variables
2. Agrega las variables de entorno necesarias
3. Configura el build command: `npm run build`

## 🤝 Contribuir

### **Cómo Contribuir**
1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### **Guías de Contribución**
- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos

## 📈 Roadmap

### **Fase 1 - MVP** ✅
- [x] Tokenización básica de streetwear
- [x] Marketplace P2P
- [x] Autenticación Web3
- [x] Dashboard personal

### **Fase 2 - Expansión** 🚧
- [ ] Integración con redes sociales
- [ ] Sistema de reputación
- [ ] Analytics de mercado
- [ ] Mobile app

### **Fase 3 - Escalabilidad** 📋
- [ ] Multi-chain support
- [ ] API pública
- [ ] SDK para desarrolladores
- [ ] Governance token

## 🐛 Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no esté ya reportado en [Issues](https://github.com/MarxMad/UnboX/issues)
2. Crea un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Screenshots si aplica
   - Información del entorno

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Solana Foundation** - Por la infraestructura blockchain
- **Anchor Framework** - Por simplificar el desarrollo de smart contracts
- **Next.js Team** - Por el framework frontend
- **Comunidad Web3** - Por la inspiración y feedback

## 📞 Contacto

- **GitHub**: [@MarxMad](https://github.com/MarxMad)
- **Twitter**: [@UnboXPlatform](https://twitter.com/UnboXPlatform)
- **Discord**: [UnboX Community](https://discord.gg/unbox)

---

<div align="center">
  <strong>Construido con ❤️ para la comunidad Web3</strong>
</div>