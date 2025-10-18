# 🚀 Guía de Deployment en Vercel

## 📋 Pre-requisitos

Antes de deployar en Vercel, asegúrate de tener todo configurado correctamente:

- ✅ Repositorio en GitHub con el código más reciente
- ✅ Cuenta en Vercel (https://vercel.com)
- ✅ Google OAuth Client ID y Secret (opcional, para login con Google)
- ✅ Variables de entorno configuradas

## 🔧 Archivos de Configuración

Ya se han creado los siguientes archivos para facilitar el deployment:

1. **`.npmrc`** - Configura npm para usar `--legacy-peer-deps`
2. **`vercel.json`** - Configuración de Vercel
3. **`.vercelignore`** - Archivos a ignorar en el deploy
4. **`next.config.ts`** - Configuración de Next.js optimizada para Vercel

## 🚀 Pasos para Deployar

### 1. Commit y Push de los Cambios

```bash
cd /home/andru/UnBoX/UnboX

# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: Configuración para deployment en Vercel con React 19"

# Push al repositorio
git push origin main
```

### 2. Conectar con Vercel

#### Opción A: Dashboard de Vercel (Recomendado)

1. **Ve a** https://vercel.com/dashboard
2. **Haz clic en** "Add New Project"
3. **Importa tu repositorio** GitHub `SegFaultPapi/unbox`
4. **Configura el proyecto**:
   - Framework Preset: **Next.js**
   - Root Directory: **UnboX** (si tu código está en `/UnboX/UnboX`)
   - Build Command: `npm run vercel-build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next` (default)

#### Opción B: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/andru/UnBoX/UnboX
vercel
```

### 3. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:

#### Variables Requeridas:

```bash
# Google OAuth (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Solana RPC (opcional - usa el público por defecto)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com

# Helius API Key (opcional pero recomendado para mejor performance)
# NEXT_PUBLIC_HELIUS_API_KEY=tu-helius-api-key
```

#### Configuración de Variables:

- **Environment**: Production, Preview, Development
- **Target**: All branches (o solo main para production)

### 4. Deploy

Una vez configurado:

1. **Haz clic en "Deploy"**
2. **Espera** que termine el build (~2-5 minutos)
3. **Verifica** que no haya errores en los logs
4. **Accede** a tu aplicación en la URL proporcionada por Vercel

## 🔍 Troubleshooting

### Error: "Peer dependency warnings"

**Solución**: Ya está resuelto con `.npmrc` y `vercel.json`

```json
// vercel.json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Error: "Module not found"

**Solución**: Verifica que todas las dependencias estén en `package.json`

```bash
# Re-instalar dependencias localmente
npm install --legacy-peer-deps

# Probar build localmente
npm run build
```

### Error: "Webpack compilation failed"

**Solución**: Ya configurado en `next.config.ts` con fallbacks para módulos de Node.js

```typescript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
  }
  return config;
}
```

### Error: "Build exceeded maximum duration"

**Solución**: 
1. Limpia el cache de Vercel
2. Verifica que no estés instalando dependencias innecesarias
3. Considera usar Vercel Pro si necesitas más tiempo de build

### Warning: "React peer dependency mismatch"

**Solución**: Ya configurado con `overrides` en `package.json`

```json
"overrides": {
  "react": "19.1.0",
  "react-dom": "19.1.0"
}
```

## 🎯 Verificación Post-Deploy

Después de deployar, verifica:

### 1. Landing Page (/)
- ✅ Carousel de imágenes funciona
- ✅ Botones "Start Tokenizing" y "Explore Collections" funcionan

### 2. Registro (/register)
- ✅ Registro con email funciona
- ✅ "Sign Up with Solana" abre modal de wallet
- ✅ "Continue with Google" inicia OAuth (si configurado)
- ✅ PIN setup aparece después de registrarse

### 3. Login (/login)
- ✅ Login con email funciona
- ✅ "Sign In with Solana" funciona
- ✅ Redirección al feed después de login

### 4. Tokenización (/tokenize)
- ✅ Formulario se carga correctamente
- ✅ Upload de imágenes funciona
- ✅ Banner de wallet se muestra
- ✅ Conexión de wallet funciona
- ✅ Minteo funciona (si tienes SOL en Devnet)

### 5. Feed (/feed)
- ✅ NFTs mock se muestran
- ✅ Navegación funciona

### 6. Profile (/profile)
- ✅ Información del usuario se muestra
- ✅ Avatar dropdown funciona
- ✅ Logout funciona

## 🌐 Dominios Personalizados

### Agregar dominio personalizado:

1. Ve a **Settings → Domains**
2. Agrega tu dominio
3. Configura DNS según instrucciones de Vercel
4. Espera propagación de DNS (~24-48 horas)

## 📊 Monitoreo

### Analytics de Vercel:

Vercel proporciona analytics automáticos:
- **Web Vitals**: Performance metrics
- **Audience**: Información de usuarios
- **Speed Insights**: Tiempos de carga

Accede en: **Dashboard → Project → Analytics**

### Logs:

Para ver logs de producción:
1. Ve a **Dashboard → Project → Deployments**
2. Haz clic en el deployment
3. Ve a **Runtime Logs**

## 🔄 CI/CD Automático

Vercel ya tiene CI/CD automático:

- ✅ **Push a `main`** → Deploy a Production
- ✅ **Pull Request** → Preview Deployment
- ✅ **Push a otras ramas** → Preview Deployment

### Configurar Deploy Hooks:

Para deployar desde otros servicios:

1. Ve a **Settings → Git → Deploy Hooks**
2. Crea un nuevo hook
3. Usa la URL proporcionada para trigger builds

## 🔐 Seguridad

### Variables de Entorno:

- ✅ Nunca commits variables secretas
- ✅ Usa variables de entorno de Vercel
- ✅ Diferencia entre `NEXT_PUBLIC_*` (cliente) y privadas (servidor)

### CORS:

Ya configurado en `next.config.ts` para APIs

## 📚 Recursos

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel CLI**: https://vercel.com/docs/cli

## 🎉 ¡Listo!

Tu aplicación UnBoX debería estar deployada y funcionando en Vercel.

**URL de producción**: Vercel te proporcionará una URL como:
- `unbox.vercel.app`
- `unbox-segfaultpapi.vercel.app`
- O tu dominio personalizado

---

**Siguiente paso**: Comparte la URL con usuarios de prueba y solicita feedback.

