/**
 * Servicio para obtener imágenes desde metadata de IPFS
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Obtiene la imagen desde el metadata de IPFS
 * @param uri - URI del metadata (IPFS hash o URL completa)
 * @returns URL de la imagen o placeholder si falla
 */
export async function getImageFromMetadata(uri: string): Promise<string> {
  const placeholder = 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=No+Image';
  
  if (!uri || uri.length === 0 || uri.includes('\0')) {
    console.log('⚠️ URI inválida o vacía:', uri);
    return placeholder;
  }

  try {
    console.log('🔍 Obteniendo metadata desde:', uri);
    
    // Asegurar que la URI sea una URL completa
    let metadataUrl = uri;
    if (uri.startsWith('ipfs://')) {
      // Convertir IPFS hash a URL de gateway de Pinata
      const hash = uri.replace('ipfs://', '');
      metadataUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    } else if (uri.startsWith('Qm') || uri.startsWith('baf')) {
      // Es un hash IPFS directo
      metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri}`;
    } else if (!uri.startsWith('http')) {
      // Asumir que es un hash IPFS
      metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri}`;
    }

    console.log('📡 URL final del metadata:', metadataUrl);

    const response = await fetch(metadataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('❌ Error HTTP al obtener metadata:', response.status, response.statusText);
      return placeholder;
    }

    const metadata: NFTMetadata = await response.json();
    console.log('📄 Metadata obtenida:', metadata);

    if (!metadata.image) {
      console.log('⚠️ No se encontró campo "image" en metadata');
      return placeholder;
    }

    // Procesar la URL de la imagen
    let imageUrl = metadata.image;
    
    if (imageUrl.startsWith('ipfs://')) {
      // Convertir IPFS hash de imagen a URL de gateway
      const imageHash = imageUrl.replace('ipfs://', '');
      imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
    } else if (imageUrl.startsWith('Qm') || imageUrl.startsWith('baf')) {
      // Es un hash IPFS directo
      imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
    } else if (!imageUrl.startsWith('http')) {
      // Asumir que es un hash IPFS
      imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
    }

    console.log('🖼️ URL final de la imagen:', imageUrl);

    // Verificar que la imagen sea accesible
    try {
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (imageResponse.ok) {
        console.log('✅ Imagen verificada y accesible');
        return imageUrl;
      } else {
        console.log('❌ Imagen no accesible:', imageResponse.status);
        return placeholder;
      }
    } catch (imageError) {
      console.log('❌ Error verificando imagen:', imageError);
      return placeholder;
    }

  } catch (error) {
    console.error('❌ Error obteniendo imagen desde metadata:', error);
    return placeholder;
  }
}

/**
 * Obtiene múltiples imágenes en paralelo
 * @param uris - Array de URIs de metadata
 * @returns Array de URLs de imágenes
 */
export async function getMultipleImagesFromMetadata(uris: string[]): Promise<string[]> {
  const promises = uris.map(uri => getImageFromMetadata(uri));
  return Promise.all(promises);
}

/**
 * Valida si una URL de imagen es accesible
 * @param imageUrl - URL de la imagen
 * @returns Promise<boolean>
 */
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
