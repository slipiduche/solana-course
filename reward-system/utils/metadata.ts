import { pinataSdk } from "../../helpers/pinata";

// Formato estándar de Metaplex para metadata de tokens
const tokenMetadata = {
    name: "WAYRU Rewards Token",
    symbol: "WAYRU",
    description: "Official reward token for the Wayru Network",
    image: "https://ipfs.algonode.xyz/ipfs/YOUR_IMAGE_HASH", // URL de la imagen del token
    external_url: "https://wayru.io",
    attributes: [], // Opcional
    properties: {
        files: [
            {
                uri: "https://ipfs.algonode.xyz/ipfs/YOUR_IMAGE_HASH",
                type: "image/png"
            }
        ],
        category: "token",
        creators: [
            {
                address: "YOUR_CREATOR_ADDRESS",
                share: 100
            }
        ]
    }
};

// Función para subir metadata a IPFS usando Pinata
async function uploadTokenMetadata(metadata: any) {
    try {
        const pinataResponse = await pinataSdk.pinJSONToIPFS(metadata, {
            pinataOptions: { cidVersion: 1 },
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        const url = `https://ipfs.algonode.xyz/ipfs/${pinataResponse.IpfsHash}`;
        console.log('Metadata URL:', url);
        
        return url;
    } catch (error) {
        console.error("Error uploading metadata:", error);
        throw error;
    }
}

// Función para crear metadata del token
export async function createTokenMetadata(
    name: string,
    symbol: string,
    imageUrl: string,
    creatorAddress: string
) {
    const metadata = {
        name,
        symbol,
        description: "Official reward token for the Wayru Network",
        image: imageUrl,
        external_url: "https://wayru.io",
        properties: {
            files: [
                {
                    uri: imageUrl,
                    type: "image/png"
                }
            ],
            category: "token",
            creators: [
                {
                    address: creatorAddress,
                    share: 100
                }
            ]
        }
    };

    return await uploadTokenMetadata(metadata);
} 