import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "./utils/program";
import { TOKENS } from "./constants";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getTokenStoragePDA } from "./utils/pda";

async function checkClaimStatus(
    userPublicKey: PublicKey,
    nftMint: PublicKey
) {
    try {
        console.log("\n=== Verificando estado del claim ===");
        const program = await getRewardSystemProgram();

        // 1. Verificar reward entry
        const [rewardEntry] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("reward_entry"),
                userPublicKey.toBuffer(),
                nftMint.toBuffer()
            ],
            program.programId
        );

        console.log("\nVerificando reward entry...");
        try {
            const account = await program.account.rewardEntry.fetch(rewardEntry);
            const lastClaimDate = new Date(Number(account.lastClaimedTimestamp) * 1000);
            console.log("✅ Último claim realizado:", lastClaimDate.toLocaleString());
            console.log("Usuario:", userPublicKey.toString());
            console.log("NFT:", nftMint.toString());
        } catch (error) {
            console.log("❌ No se ha realizado ningún claim previo");
        }

        // 2. Verificar balance del usuario
        const userATA = await getAssociatedTokenAddress(
            TOKENS.WAYRU.MINT,
            userPublicKey,
            false
        );

        console.log("\nVerificando balance del usuario...");
        try {
            const balance = await program.provider.connection.getTokenAccountBalance(userATA);
            console.log("✅ Balance actual:", balance.value.uiAmount, "WAYRU");
        } catch (error) {
            console.log("❌ El usuario no tiene cuenta ATA o no tiene tokens");
        }

        // 3. Verificar balance del storage
        console.log("\nVerificando balance del storage...");
        try {
            const storageBalance = await program.provider.connection.getTokenAccountBalance(
                TOKENS.WAYRU.STORAGE_ACCOUNT
            );
            console.log("✅ Balance del storage:", storageBalance.value.uiAmount, "WAYRU");
        } catch (error) {
            console.log("❌ Error al verificar balance del storage");
        }

    } catch (error) {
        console.error("Error verificando estado:", error);
    }
}

// Ejecutar la verificación
async function main() {
    const userPublicKey = new PublicKey("8CcuRWbCMuoWaaLMV423gCGa9RDtQYk2jsP1xMmZJRm4");
    const nftMint = new PublicKey("8pHqju2yDcdmPrkksoG6qtD8qJaTKc3Qbn7wricUnHnR");
    
    await checkClaimStatus(userPublicKey, nftMint);
}

main(); 