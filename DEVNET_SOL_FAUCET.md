# 🪙 Cómo Obtener SOL en Devnet para Testear

## ⚠️ **IMPORTANTE: Necesitas SOL en Devnet para mintear NFTs**

Para crear un NFT en Solana Devnet, necesitas aproximadamente **0.01-0.02 SOL** para pagar las tarifas de transacción (rent + gas).

## 🚰 Método 1: Solana Faucet Oficial (Recomendado)

### Opción A: Desde el Navegador

1. **Ve al faucet oficial**:
   - https://faucet.solana.com/

2. **Conecta tu wallet**:
   - Selecciona "Devnet" en la red
   - Conecta tu wallet Phantom/Solflare
   - O pega tu dirección pública manualmente

3. **Solicita SOL**:
   - Haz clic en "Request Airdrop"
   - Recibirás 1-2 SOL en Devnet

4. **Verifica el saldo**:
   - Abre tu wallet
   - Cambia a red "Devnet"
   - Deberías ver tu saldo de SOL

### Opción B: Desde la Terminal (Solana CLI)

```bash
# Instalar Solana CLI si no lo tienes
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Configurar a Devnet
solana config set --url https://api.devnet.solana.com

# Solicitar airdrop (reemplaza TU_WALLET_ADDRESS con tu dirección)
solana airdrop 2 TU_WALLET_ADDRESS

# Verificar saldo
solana balance TU_WALLET_ADDRESS
```

## 🚰 Método 2: Faucets Alternativos

Si el oficial no funciona, prueba estos:

1. **QuickNode Faucet**:
   - https://faucet.quicknode.com/solana/devnet

2. **SolFaucet**:
   - https://solfaucet.com/

3. **Discord de Solana**:
   - Únete al Discord oficial de Solana
   - Ve al canal de faucet
   - Usa el bot para solicitar SOL

## 📱 Configurar Wallet para Devnet

### Phantom Wallet:

1. Abre Phantom
2. Clic en el ícono de configuración (⚙️)
3. Clic en "Change Network"
4. Selecciona "Devnet"
5. Verifica que diga "Devnet" en la parte superior

### Solflare Wallet:

1. Abre Solflare
2. Clic en el menú (☰)
3. Clic en "Network"
4. Selecciona "Devnet"
5. Verifica la red en la esquina superior

## 🔍 Verificar que Tienes SOL

1. **En tu Wallet**:
   - Asegúrate de estar en Devnet
   - Verifica el saldo (debe ser > 0.01 SOL)

2. **En Solana Explorer**:
   - Ve a https://explorer.solana.com/
   - Cambia a "Devnet" en la esquina superior derecha
   - Pega tu dirección pública
   - Deberías ver tu saldo

## 🎯 Cuánto SOL Necesitas

| Operación | SOL Requerido (aprox) |
|-----------|----------------------|
| Crear NFT (Mint) | 0.01 - 0.02 SOL |
| Transfer NFT | 0.000005 SOL |
| Listar en Marketplace | 0.001 SOL |

**Recomendación**: Solicita al menos **2 SOL** en Devnet para tener suficiente para varias pruebas.

## ❌ Troubleshooting

### "Airdrop request failed"
- El faucet puede tener límites por IP
- Espera 24 horas e intenta de nuevo
- Prueba un faucet alternativo
- Usa una VPN si es necesario

### "Insufficient funds" al mintear
- Verifica que estás en Devnet (no Mainnet)
- Solicita más SOL del faucet
- Verifica tu saldo: debe ser > 0.01 SOL

### No veo el SOL en mi wallet
- Asegúrate de estar en la red Devnet
- Refresca tu wallet
- Verifica la transacción en Explorer

## 🚀 Siguiente Paso

Una vez que tengas SOL en Devnet:

1. Ve a http://localhost:3002/tokenize
2. Llena el formulario con tu artículo streetwear
3. Sube una imagen
4. Haz clic en "Tokenize"
5. Ingresa tu PIN
6. **Confirma la transacción en tu wallet** 👈 ¡IMPORTANTE!
7. Espera ~10-30 segundos
8. ¡Verás el modal de éxito con tu NFT!

## 🎉 ¿Funcionó?

Si minteas exitosamente:
- Verás un modal con la imagen de tu NFT
- Tendrás el Mint Address
- Tendrás el Transaction Signature
- Podrás ver tu NFT en Solana Explorer
- Verás tu NFT en tu wallet (en la sección NFTs/Collectibles)

---

**Nota**: Devnet es una red de prueba. Los tokens no tienen valor real y pueden ser reseteados periódicamente.

