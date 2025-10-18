# 🧪 Guía de Pruebas - UnboX Streetwear Tokenizer

## 📋 Checklist de Pruebas del Issue #3

### ✅ Prerequisitos

Antes de comenzar las pruebas, asegúrate de tener:

1. **Wallet con SOL en Devnet**
   ```bash
   solana airdrop 2
   ```

2. **Servidor Frontend corriendo**
   ```bash
   cd app
   npm run dev
   # Accede a http://localhost:3000
   ```

3. **Programa deployado en Devnet**
   - Program ID: `DeU8a2JeJVR5Wq2g6xBSPtAxc3teSAcNTYqcWTEYN2ho`

---

## 🎯 Flujo de Pruebas Completo

### 1. **Prueba de Wallet Connection** 🔐

**Objetivo:** Verificar que la integración con Phantom/Solflare funciona

**Pasos:**
1. Abre http://localhost:3000
2. Haz clic en "Select Wallet" (esquina superior derecha)
3. Selecciona Phantom o Solflare
4. Aprueba la conexión en tu wallet

**Resultado Esperado:**
- ✅ El botón muestra tu dirección truncada: `Abc1...xyz2`
- ✅ Puedes navegar a todas las páginas sin warnings

---

### 2. **Prueba de Tokenización** 🏷️

**Objetivo:** Crear un NFT desde cero usando el programa Solana

**Pasos:**
1. Navega a `/tokenize`
2. Conecta tu wallet si no lo has hecho
3. Completa el formulario:
   - **Imagen:** Sube una imagen de prueba (cualquier JPG/PNG)
   - **Nombre:** "Air Jordan 1 Test"
   - **Marca:** "Nike"
   - **Modelo:** "Jordan 1"
   - **Talla:** "US 10"
   - **Año:** 2023
   - **Condición:** "New"
   - **Rareza:** "Epic"
4. Haz clic en "Tokenizar Artículo"
5. Aprueba la transacción en tu wallet

**Resultado Esperado:**
- ✅ Aparece un mensaje de éxito verde
- ✅ Se muestra el Mint Address
- ✅ Link a Solana Explorer funciona
- ✅ En la consola del navegador (F12) ves logs del proceso
- ✅ La transacción aparece en el explorador con estado "Success"

**Verificación en Explorador:**
```
https://explorer.solana.com/tx/[SIGNATURE]?cluster=devnet
```

Deberías ver:
- Instrucción: `tokenizeStreetwear`
- Accounts: owner, mint, assetAccount, etc.
- Status: ✅ Success

---

### 3. **Prueba de Dashboard** 📊

**Objetivo:** Ver tus NFTs tokenizados

**Pasos:**
1. Navega a `/dashboard`
2. Observa tus stats

**Resultado Esperado (por ahora con datos mock):**
- ✅ Se muestra tu wallet conectada
- ✅ Stats de colección (mock data)
- ✅ Cards de NFTs existentes

**Nota:** Para ver tus NFTs reales, necesitarías implementar el fetch desde el programa (ver "Próximas Mejoras")

---

### 4. **Prueba de Marketplace** 🛍️

**Objetivo:** Ver artículos en venta

**Pasos:**
1. Navega a `/` (homepage)
2. Explora los artículos mostrados

**Resultado Esperado:**
- ✅ Hero section con estadísticas
- ✅ Grid de artículos (mock data)
- ✅ Cards con información completa

---

### 5. **Prueba de Navegación Responsive** 📱

**Objetivo:** Verificar UX en móvil

**Pasos:**
1. Abre DevTools (F12)
2. Activa el modo responsive (Ctrl+Shift+M)
3. Prueba diferentes tamaños:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Resultado Esperado:**
- ✅ Navegación se adapta (inferior en móvil, superior en desktop)
- ✅ Grid responsive (1 columna en móvil, 3 en desktop)
- ✅ Wallet button visible en todos los tamaños

---

## 🔍 Casos de Error a Probar

### Error 1: Wallet No Conectada
1. Ve a `/tokenize` sin conectar wallet
2. Intenta enviar el formulario

**Esperado:** ⚠️ Alert: "Por favor conecta tu wallet primero"

### Error 2: Datos Inválidos
1. Conecta wallet
2. Intenta tokenizar con año = 1980 (fuera de rango)

**Esperado:** ❌ Error del programa: "InvalidYear"

### Error 3: Marca Vacía
1. Deja el campo "Marca" vacío
2. Envía el formulario

**Esperado:** ❌ Error del programa: "InvalidBrand"

### Error 4: Sin SOL
1. Usa una wallet sin SOL
2. Intenta tokenizar

**Esperado:** ❌ Error: "Insufficient funds"

---

## 📊 Verificaciones Técnicas

### Console Logs
Abre la consola (F12) y verifica que aparezcan estos logs durante la tokenización:

```
1. Subiendo imagen a IPFS...
Imagen subida: data:image/...
2. Creando metadata...
Metadata URI: https://arweave.net/mock-metadata-uri
3. Creando mint...
4. Obteniendo PDAs...
Mint: [PublicKey]
Asset PDA: [PublicKey]
Token Account: [PublicKey]
5. Enviando transacción...
✅ NFT Tokenizado!
Transaction: [Signature]
Mint Address: [PublicKey]
```

### Network Requests
En la pestaña Network (F12):
- Requests a `api.devnet.solana.com`
- Métodos RPC: `getLatestBlockhash`, `sendTransaction`, `confirmTransaction`

### Accounts Creados
Para cada tokenización exitosa, se crean:
1. **Mint Account** - El NFT token
2. **Asset PDA** - Metadata on-chain del streetwear
3. **Token Account** - Associated Token Account del owner

---

## 🎯 Criterios de Éxito del Issue #3

Para considerar completado el Issue #3, debe cumplirse:

- ✅ **Wallet Adapter funcionando** - Conexión exitosa con Phantom/Solflare
- ✅ **Página de Tokenización operativa** - Formulario completo y funcional
- ✅ **Integración con el programa** - Llamadas RPC exitosas
- ✅ **Transacciones confirmadas** - NFTs creados en Devnet
- ✅ **UI responsive** - Funciona en móvil y desktop
- ✅ **Navegación fluida** - Todas las rutas funcionan
- ✅ **Feedback al usuario** - Mensajes de éxito/error claros
- ✅ **Links al explorador** - Verificación on-chain

---

## 🐛 Problemas Conocidos y Soluciones

### Problema: "Module factory not available"
**Solución:** Ya resuelto. Se cambió `require()` a `import` para el CSS del wallet adapter.

### Problema: "Failed to fetch"
**Solución:** 
- Verifica que tengas internet
- Prueba cambiar el RPC endpoint en `WalletContextProvider.tsx`

### Problema: "Transaction simulation failed"
**Solución:**
- Verifica que tengas SOL en tu wallet
- Asegúrate de que los datos estén en el rango válido (año 1990-2024)
- Revisa que marca y modelo no estén vacíos

---

## 📈 Próximas Mejoras (Post-Issue #3)

Estas features NO son parte del Issue #3 pero están planificadas:

1. **Fetch real de NFTs** en Dashboard
   - Usar `program.account.streetwearAsset.all()` con filtros
   
2. **Implementar list_nft** en MyNFTCard
   - Permitir vender NFTs propios
   
3. **Implementar buy_nft** en NFTCard
   - Comprar NFTs del marketplace
   
4. **IPFS real** con Pinata
   - Reemplazar `mockUploadToIPFS` con `uploadImageToIPFS`
   
5. **Búsqueda y filtros** en Marketplace
   - Filtrar por marca, rarity, precio

---

## ✅ Checklist Final

Antes de cerrar el Issue #3, verifica:

- [ ] Wallet connection funciona con Phantom
- [ ] Wallet connection funciona con Solflare
- [ ] Puedes tokenizar un NFT exitosamente
- [ ] La transacción aparece en Solana Explorer
- [ ] Los mensajes de error funcionan
- [ ] El diseño es responsive
- [ ] Todas las páginas cargan sin errores
- [ ] Los links de navegación funcionan
- [ ] El código está commiteado y pusheado

---

**¡Listo para probar!** 🚀

Si todos los tests pasan, el Issue #3 está **COMPLETADO**.

