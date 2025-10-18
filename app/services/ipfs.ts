// Servicio para subir archivos a IPFS usando Pinata
// Para usar este servicio, necesitarás crear una cuenta en https://pinata.cloud
// y obtener tu API Key y Secret

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}

/**
 * Sube una imagen a IPFS usando Pinata
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to IPFS');
    }

    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
}

/**
 * Sube metadata JSON a IPFS
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Función helper para crear metadata completa de NFT
 */
export function createNFTMetadata(
  name: string,
  symbol: string,
  description: string,
  imageUri: string,
  attributes: { brand: string; model: string; size: string; condition: string; year: number; rarity: string }
): NFTMetadata {
  return {
    name,
    symbol,
    description,
    image: imageUri,
    attributes: [
      { trait_type: 'Brand', value: attributes.brand },
      { trait_type: 'Model', value: attributes.model },
      { trait_type: 'Size', value: attributes.size },
      { trait_type: 'Condition', value: attributes.condition },
      { trait_type: 'Year', value: attributes.year },
      { trait_type: 'Rarity', value: attributes.rarity },
    ],
    properties: {
      files: [
        {
          uri: imageUri,
          type: 'image/png',
        },
      ],
      category: 'image',
    },
  };
}

/**
 * Alternativa: Usar web3.storage (otro servicio IPFS gratuito)
 * Descomenta esta función si prefieres usar web3.storage
 */
/*
export async function uploadToWeb3Storage(file: File): Promise<string> {
  const web3storage = new Web3Storage({ 
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || '' 
  });
  
  const cid = await web3storage.put([file]);
  return `https://${cid}.ipfs.w3s.link/${file.name}`;
}
*/

/**
 * Función de desarrollo: Simula subida a IPFS
 * Útil para testing sin necesidad de API keys
 */
export async function mockUploadToIPFS(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // En desarrollo, retorna una URL de datos
      // En producción, esto debería reemplazarse con una llamada real a IPFS
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Función de desarrollo: Simula subida de metadata a IPFS
 * Útil para testing sin necesidad de API keys
 */
export async function mockUploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  return new Promise((resolve) => {
    // En desarrollo, retorna una URL mock con los datos del metadata
    const mockUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    resolve(mockUri);
  });
}

