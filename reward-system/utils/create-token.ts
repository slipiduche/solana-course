import * as anchor from "@coral-xyz/anchor";
import { getAdminKeypair } from "./keypar";
import { createTokenWithMetadata } from "./token";
import { getRewardSystemProgram } from "./program";

async function createNewTokenWithMetadata() {
    try {
        console.log("=== Iniciando creación de nuevo token con metadata ===");
        
        const program = await getRewardSystemProgram();
        const provider = program.provider as anchor.AnchorProvider;
        const adminKeypair = getAdminKeypair();

        console.log("\nCreando nuevo token...");
        const mint = await createTokenWithMetadata({
            provider,
            adminKeypair,
            name: "WAYRU Rewards Token",
            symbol: "WAYRU",
            uri: "https://arweave.net/[tu_uri_aqui]" // Necesitaremos una URI válida para los metadatos
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