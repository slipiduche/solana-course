import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "./utils/program";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKENS } from "./constants";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function checkProgramDetails() {
    try {
        const program = await getRewardSystemProgram();
        
        console.log("\n=== Program Details ===");
        console.log("Program ID:", program.programId.toString());

        // Get program account info
        const programInfo = await program.provider.connection.getAccountInfo(program.programId);
        
        if (programInfo) {
            console.log("\n=== Account Info ===");
            console.log("- Executable:", programInfo.executable);
            console.log("- Owner:", programInfo.owner.toString());
            console.log("- Balance:", `${programInfo.lamports / LAMPORTS_PER_SOL} SOL`);
            console.log("- Data Size:", programInfo.data.length, "bytes");
        }

        // Verificar tokens disponibles para reclamar
        console.log("\n=== Tokens Disponibles para Reclamar ===");
        
        // Obtener balance de la cuenta de storage
        const storageBalance = await program.provider.connection.getTokenAccountBalance(
            TOKENS.WAYRU.STORAGE_ACCOUNT
        );

        console.log("\n=== Storage Account Details ===");
        console.log("Storage Account:", TOKENS.WAYRU.STORAGE_ACCOUNT.toString());
        console.log("Token Mint:", TOKENS.WAYRU.MINT.toString());
        console.log("Available Tokens:", storageBalance.value.uiAmount);
        console.log("Raw Amount:", storageBalance.value.amount);
        console.log("Decimals:", storageBalance.value.decimals);

        // Obtener PDA del token storage
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );
        console.log("\n=== Storage Authority ===");
        console.log("Storage Authority PDA:", tokenStorageAuthority.toString());

        // Verificar si la cuenta de storage está inicializada correctamente
        const storageAccountInfo = await program.provider.connection.getAccountInfo(
            TOKENS.WAYRU.STORAGE_ACCOUNT
        );
        
        if (storageAccountInfo) {
            console.log("\n=== Storage Account Status ===");
            console.log("- Is Initialized:", "Yes");
            console.log("- Owner Program:", storageAccountInfo.owner.toString());
            console.log("- Is owned by Token Program:", 
                storageAccountInfo.owner.equals(TOKEN_PROGRAM_ID) ? "Yes" : "No");
        } else {
            console.log("\n❌ Storage account not initialized!");
        }

    } catch (error) {
        console.error("Error checking program details:", error);
        if (error.logs) {
            console.error("Transaction Logs:", error.logs);
        }
    }
}

checkProgramDetails(); 