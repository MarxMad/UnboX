# Configuración de RPC para Solana

## Problema: "Failed to fetch" al intentar mintear

Si recibes el error `failed to get recent blockhash: TypeError: Failed to fetch`, significa que la aplicación no puede conectarse al RPC público de Solana.

## Soluciones:

### Opción 1: Usar Helius RPC (Recomendado - Gratis) ⭐

Helius ofrece un RPC gratuito más confiable que el público de Solana:

1. **Regístrate en Helius**:
   - Ve a https://helius.dev
   - Crea una cuenta gratis
   - Crea un nuevo proyecto

2. **Obtén tu API Key**:
   - En tu dashboard, copia tu API Key de Devnet

3. **Configura tu `.env.local`**:
   ```bash
   # Agrega esta línea en /home/andru/UnBoX/UnboX/.env.local
   NEXT_PUBLIC_HELIUS_API_KEY=tu-api-key-aqui
   ```

4. **Reinicia el servidor**:
   ```bash
   cd /home/andru/UnBoX/UnboX
   npm run dev
   ```

### Opción 2: Usar otro proveedor RPC

Alternativas gratuitas:

1. **QuickNode**:
   - https://www.quicknode.com/
   - Ofrece plan gratuito
   - Endpoint: `https://[tu-endpoint].solana-devnet.quiknode.pro/[tu-key]/`

2. **Alchemy**:
   - https://www.alchemy.com/
   - Soporte para Solana
   - Endpoint: `https://solana-devnet.g.alchemy.com/v2/[tu-key]`

Para usar estos, actualiza tu `.env.local`:
```bash
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=tu-endpoint-aqui
```

Y modifica `lib/wallet-context.tsx` para usar esta variable de entorno.

### Opción 3: Ejecutar tu propio validador local (Para desarrollo avanzado)

```bash
# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Ejecutar validador de prueba
solana-test-validator

# Usar endpoint local
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=http://localhost:8899
```

## Verificación de la Conexión

Puedes probar tu conexión RPC con:

```bash
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getHealth"
}'
```

Si recibes `{"jsonrpc":"2.0","result":"ok","id":1}`, el endpoint funciona.

## Estado Actual

La aplicación está configurada para usar el RPC público de Solana (`https://api.devnet.solana.com`), pero este puede estar saturado o tener problemas de conectividad.

**Recomendación**: Configura Helius (Opción 1) para tener una experiencia más confiable y rápida.

## Logs de Debug

Para ver los logs de conexión:
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Busca mensajes que empiecen con:
   - `🚀 Iniciando tokenización real...`
   - `Wallet:`
   - `Program:`
   - `Connection:`

Esto te ayudará a identificar si el problema es con el wallet, el programa, o la conexión RPC.

