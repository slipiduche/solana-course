import * as anchor from "@coral-xyz/anchor";
import { getAdminKeypair } from "./keypar";
import { createTokenWithMetadata } from "./token";
import { getRewardSystemProgram } from "./program";
import { pinataSdk } from "../../spl-token/helpers/pinata";

async function createNewTokenWithMetadata() {
    try {
        console.log("=== Iniciando creación de nuevo token con metadata ===");
        // prepare the metadata
        const name = "TWAYRU";
        const symbol = "TWAYRU";
        const description = "wayru token";
        const image = "https://ipfs.algonode.xyz/ipfs/bafkreifwvjebc5rul43627nrjf27hp3nz43imwin2ke2wi7xiswt63mwte";
        const attributes = [
            {
                trait_type: "type",
                value: "reward token"
            }
        ]

        // metadata object
        const tokenMetadata = { 
            name,
            symbol,
            description,
            image,
            attributes
        }
        // send metadata to ipfs

        // Upload metadata to IPFS
        const pinataResponse = await pinataSdk.pinJSONToIPFS(tokenMetadata, {
            pinataOptions: { cidVersion: 1 },
        });

        const program = await getRewardSystemProgram();
        const provider = program.provider as anchor.AnchorProvider;
        const adminKeypair = getAdminKeypair();

        console.log("\nCreando nuevo token...");
        const mint = await createTokenWithMetadata({
            provider,
            adminKeypair,
            name,
            symbol,
            uri: `https://ipfs.algonode.xyz/ipfs/${pinataResponse.IpfsHash}`,
            decimals: 6
        });

        console.log("\n✅ Token creado exitosamente!");
        console.log("Mint Address:", mint.toString());
        console.log("\nDetalles del token:");
        console.log("- Nombre:", "WAYRU Rewards Token");
        console.log("- Símbolo:", "WAYRU");
        console.log("- Decimales:", 6);
        console.log("- Admin:", adminKeypair.publicKey.toString());

        // Obtener PDA para token storage
        const [tokenStorageAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        console.log("\nToken Storage Authority (PDA):", tokenStorageAuthority.toString());

        // Guardar la información en un archivo para referencia futura
        console.log("\n⚠️ Guarda esta información para usarla en el programa:");
        console.log(`MINT_ADDRESS="${mint.toString()}"`);
        console.log(`TOKEN_STORAGE_AUTHORITY="${tokenStorageAuthority.toString()}"`);

    } catch (error) {
        console.error("\n❌ Error creando el token:", error);
        if (error.logs) {
            console.error("Logs:", error.logs);
        }
    }
}

// Ejecutar la función
createNewTokenWithMetadata(); 