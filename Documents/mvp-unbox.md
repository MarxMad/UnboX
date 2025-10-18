# MVP Scope: Streetwear Tokenizer Platform

## 🎯 Problema Core
Los coleccionistas de streetwear no tienen una forma confiable de tokenizar y validar la autenticidad de sus artículos para mostrarlos, recordarlos o venderlos en el mundo web3.

## 🔥 Flujo MVP (5 pasos)
1. Usuario se autentica con wallet web3 o registro tradicional web2
2. Usuario configura PIN para transacciones importantes
3. Usuario completa perfil básico (puede vincular redes sociales)
4. Usuario explora feed principal con artículos HOT y tendencias
5. Usuario tokeniza su primer artículo (foto, estado, marca, año) y obtiene su NFT

## ✅ Features MVP
- **Autenticación dual:** Wallet web3 + onboarding web2 tradicional
- **Sistema de PIN:** Protección para transacciones críticas
- **Feed principal:** Mostrar artículos trending y noticias streetwear
- **Tokenización básica:** Subir imagen, definir estado/marca/año, generar NFT
- **Perfil de usuario:** Mostrar artículos tokenizados y colección básica

## ❌ NO va en MVP
- Integración completa con redes sociales (Instagram, TikTok, X)
- Sistema de precios promedio y marketplace
- Feed detallado con opiniones/historias de otros usuarios
- Visualización completa de perfiles de otros usuarios
- Funciones de sharing externo
- Sistema de validación de autenticidad avanzado

## 🎊 Criterio de Éxito
Mi MVP funciona si: 70% de los usuarios que se registran logran tokenizar al menos 1 artículo exitosamente en sus primeras 48 horas.

---

## 📋 Stack Técnico Sugerido
- **Blockchain:** Solana (NFTs con Metaplex)
- **Frontend:** React/Next.js
- **Autenticación Web3:** Phantom/Solflare wallet adapter
- **Storage:** IPFS para metadata e imágenes
- **Backend:** Node.js/Express (opcional, si necesitas base de datos)

## 🚨 Validaciones Clave
- [ ] **Test de onboarding:** ¿Un usuario nuevo puede registrarse y tokenizar en menos de 10 minutos?
- [ ] **Test de valor:** ¿El usuario entiende inmediatamente por qué tokenizar su streetwear?
- [ ] **Test técnico:** ¿La transacción en Solana se completa consistentemente?

## 💰 Consideraciones de Costos
- Mantener costos de transacción bajos en Solana
- Optimizar compresión de imágenes para IPFS
- Considerar subsidiar las primeras transacciones para nuevos usuarios

---

**🎯 Focus:** Tokenización simple + experiencia de usuario fluida. Todo lo social y de marketplace puede esperar al post-MVP.

*Documento generado para hackathon Solana - UnboX*