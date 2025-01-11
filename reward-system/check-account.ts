import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "./utils/program";
import { TOKENS } from "./constants";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

async function checkAllAccounts() {
    try {
        const program = await getRewardSystemProgram();
        
        // 1. Verificar PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );
        
        console.log("\n=== PDA Info ===");
        console.log("Token Storage Authority (PDA):", tokenStorageAuthority.toString());
        
        // 2. Verificar Storage Account
        console.log("\n=== Storage Account Info ===");
        console.log("Storage Account Address:", TOKENS.WAYRU.STORAGE_ACCOUNT);
        
        try {
            const storageAccountInfo = await getAccount(
                program.provider.connection,
                TOKENS.WAYRU.STORAGE_ACCOUNT
            );
            
            console.log("- Mint:", storageAccountInfo.mint.toString());
            console.log("- Owner:", storageAccountInfo.owner.toString());
            console.log("- Amount:", storageAccountInfo.amount.toString());
            console.log("- Delegate:", storageAccountInfo.delegate?.toString() || "None");
            
            if (storageAccountInfo.owner.toString() !== tokenStorageAuthority.toString()) {
                console.log("\n⚠️ WARNING: Storage account owner doesn't match PDA!");
                console.log("Current owner:", storageAccountInfo.owner.toString());
                console.log("Expected owner (PDA):", tokenStorageAuthority.toString());
            }
        } catch (error) {
            console.log("❌ Error getting storage account info:", error);
        }

        // 3. Verificar Mint
        console.log("\n=== Mint Info ===");
        console.log("Mint Address:", TOKENS.WAYRU.MINT);
        try {
            const mintInfo = await program.provider.connection.getAccountInfo(TOKENS.WAYRU.MINT);
            console.log("- Exists:", mintInfo !== null);
            console.log("- Owner:", mintInfo?.owner.toString());
        } catch (error) {
            console.log("❌ Error getting mint info:", error);
        }

    } catch (error) {
        console.error("Error in verification:", error);
    }
}

checkAllAccounts();