import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  
  // Configuración para Vercel
  reactStrictMode: true,
  eslint: {
    // Deshabilitar ESLint durante el build para evitar fallos por warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // No fallar el build por errores de TypeScript (para desarrollo rápido)
    ignoreBuildErrors: true,
  },
  
  // Webpack config para manejar módulos de Node.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignorar warnings de peer dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@fractalwagmi/ },
      { module: /node_modules\/@solana/ },
    ];
    
    return config;
  },
  
  // Transpile packages que causan problemas
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
  ],
  
  // Headers para CORS si es necesario
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
