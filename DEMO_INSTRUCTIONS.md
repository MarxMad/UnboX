# 🎯 Instrucciones de Demostración - UnboX

## ✅ Cómo Probar la Función de Tokenización

### Paso 1: Preparar tu Wallet

1. **Abre tu wallet Phantom o Solflare**
2. **Cambia a Devnet:**
   - Phantom: Configuración → Developer Settings → Testnet Mode → Devnet
   - Solflare: Menú → Settings → Network → Devnet

3. **Consigue SOL de prueba:**
   ```bash
   solana airdrop 2
   ```
   O usa el faucet web: https://faucet.solana.com/

### Paso 2: Conectar Wallet

1. Ve a http://localhost:3000
2. Haz clic en "Select Wallet" (esquina superior derecha)
3. Selecciona tu wallet (Phantom o Solflare)
4. Aprueba la conexión

### Paso 3: Tokenizar un Artículo

1. **Navega a la página de tokenización:**
   - Click en "Tokenizar" en el menú
   - O ve directamente a http://localhost:3000/tokenize

2. **Completa el formulario:**
   
   **Imagen:**
   - Sube cualquier imagen de prueba (JPG, PNG, WEBP)
   - Recomendado: Busca una imagen de sneakers o ropa en Google

   **Datos del artículo:**
   ```
   Nombre:     Air Jordan 1 Retro High OG
   Marca:      Nike
   Modelo:     Jordan 1
   Talla:      US 10
   Año:        2023
   Condición:  New
   Rareza:     Epic
   ```

3. **Haz clic en "Tokenizar Artículo"**
   - Tu wallet abrirá un popup
   - Revisa los detalles de la transacción
   - Haz clic en "Aprobar" o "Confirm"

4. **Espera la confirmación** (5-10 segundos)

### Paso 4: Verificar el Resultado

Cuando se complete, verás un **mensaje de éxito verde** con:

#### 📦 Mint Address
La dirección única de tu NFT en Solana
```
Ejemplo: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

#### 🔗 Transaction Hash
El hash de la transacción en la blockchain
```
Ejemplo: 5wHu7...xyz123
```

#### 🔗 Links a Exploradores
- **Solana Explorer**: Ver detalles técnicos de la transacción
- **Solscan**: Ver en un explorador más visual

### Paso 5: Verificar en el Explorador

1. **Haz clic en "Ver en Solana Explorer"**
2. En el explorador verás:
   - ✅ Status: Success
   - 📝 Instruction: `tokenizeStreetwear`
   - 💰 Fee: ~0.001 SOL
   - 📋 Accounts involucradas:
     - Owner (tu wallet)
     - Mint (el NFT)
     - Asset Account (PDA con metadata)
     - Token Account (tu ATA)

3. **Opcional: Verifica en Solscan**
   - Interfaz más visual
   - Muestra las cuentas creadas
   - Timeline de la transacción

---

## 🎬 Video Tutorial Sugerido

Si estás grabando un demo, sigue esta secuencia:

### 1. Introducción (30 seg)
```
"Vamos a tokenizar un artículo de streetwear en Solana usando UnboX"
```

### 2. Conectar Wallet (20 seg)
- Mostrar el botón "Select Wallet"
- Conectar Phantom/Solflare
- Mostrar que la dirección aparece

### 3. Navegar a Tokenizar (10 seg)
- Click en "Tokenizar" en el menú
- Mostrar el formulario vacío

### 4. Llenar Formulario (1 min)
- Subir imagen
- Llenar cada campo explicando qué significa
- Mencionar las validaciones (año, marca, etc.)

### 5. Enviar Transacción (30 seg)
- Click en "Tokenizar Artículo"
- Mostrar popup de wallet
- Aprobar transacción
- Mostrar loading state

### 6. Resultado (1 min)
- Mostrar mensaje de éxito
- Resaltar el Mint Address
- Resaltar el Transaction Hash
- Click en "Ver en Solana Explorer"

### 7. Verificación on-chain (1 min)
- Mostrar la transacción en el explorador
- Señalar el status "Success"
- Mostrar las cuentas creadas
- Mostrar el instruction `tokenizeStreetwear`

### 8. Cierre (20 seg)
```
"Y así de fácil, hemos convertido un artículo físico en un NFT en Solana"
```

---

## 🐛 Qué Hacer Si Algo Sale Mal

### Error: "Wallet not connected"
**Solución:** Conecta tu wallet primero

### Error: "Insufficient funds"
**Solución:** 
```bash
solana airdrop 2
```

### Error: "InvalidYear"
**Solución:** Usa un año entre 1990 y 2024

### Error: "InvalidBrand" o "InvalidModel"
**Solución:** No dejes estos campos vacíos

### Error: "Failed to fetch"
**Solución:** 
- Verifica tu conexión a internet
- Asegúrate de estar en Devnet
- Intenta de nuevo

### Transaction pending forever
**Solución:**
- Espera 30 segundos más
- Si no funciona, recarga la página e intenta de nuevo
- Verifica el estado de Devnet: https://status.solana.com/

---

## 📊 Logs en la Consola

Abre la consola del navegador (F12) para ver el proceso completo:

```
1. Subiendo imagen a IPFS...
Imagen subida: data:image/...

2. Creando metadata...
Metadata URI: https://arweave.net/mock-metadata-uri

3. Creando mint...

4. Obteniendo PDAs...
Mint: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
Asset PDA: 8yGHzp3DK98e88TYJSDpbD5jBkheTqA83TZRuJosgBtV
Token Account: 9zIJuk4EL09f99UKJSDpbD5jBkheTqA83TZRuJosgCuW

5. Enviando transacción...

✅ NFT Tokenizado!
Transaction: 5wHu7QNkhBEq1Dq3...
Mint Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

---

## 🎯 Qué Demuestra Esto

Esta demo prueba que:

1. ✅ **Frontend se conecta con Solana** - Wallet adapter funciona
2. ✅ **Integración con el programa** - Llama correctamente a `tokenizeStreetwear`
3. ✅ **Transacciones on-chain** - Crea el NFT en Devnet
4. ✅ **PDAs funcionan** - Asset Account se deriva correctamente
5. ✅ **Metadata on-chain** - Información del streetwear se guarda
6. ✅ **UX completa** - Feedback claro al usuario
7. ✅ **Verificabilidad** - Links al explorador para transparencia

---

## 🚀 Próximos Pasos Después de la Demo

Después de tokenizar exitosamente, puedes:

1. **Ver tu colección** - Ve a `/dashboard` (aunque por ahora muestra mock data)
2. **Tokenizar más artículos** - Click en "Tokenizar Otro"
3. **Verificar en blockchain** - Usa los exploradores
4. **Compartir** - Comparte el Mint Address con otros

---

## ✅ Checklist de Demostración

Antes de hacer la demo, verifica:

- [ ] Wallet tiene SOL en Devnet (al menos 0.5 SOL)
- [ ] Estás en la red correcta (Devnet)
- [ ] El servidor frontend está corriendo (npm run dev)
- [ ] Tienes una imagen de prueba lista
- [ ] Los datos de prueba están preparados
- [ ] La consola del navegador está abierta (para mostrar logs)
- [ ] Tienes los exploradores en pestañas separadas

---

**¡Listo para la demo!** 🎉

Si todos los pasos funcionan, el Issue #3 está **COMPLETADO** ✅

