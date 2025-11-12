import { Program } from "@coral-xyz/anchor";
import { 
    PublicKey, 
    Keypair,
    TransactionInstruction,
    SystemProgram 
} from "@solana/web3.js";
import { 
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount 
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";

interface FundTokenStorageProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    mint: PublicKey;
    amount: BN;
}

export const fundTokenStorage = async ({
    program,
    adminKeypair,
    mint,
    amount
}: FundTokenStorageProps) => {
    try {
        console.log("\n=== Fund Token Storage ===");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("Mint:", mint.toString());
        console.log("Amount to deposit:", amount.toString());
        console.log("Program ID:", program.programId.toString());

        // Verificar balance de SOL del admin
        const adminSolBalance = await program.provider.connection.getBalance(adminKeypair.publicKey);
        console.log("\n=== Admin SOL Balance ===");
        console.log("Admin SOL Balance:", adminSolBalance / 1e9, "SOL");
        
        // Verificar que el admin tenga suficiente SOL para la transacción
        const minimumSolRequired = 0.003; // 0.003 SOL para cubrir la creación de cuenta y fees
        if (adminSolBalance / 1e9 < minimumSolRequired) {
            throw new Error(`Insufficient SOL balance. Admin needs at least ${minimumSolRequired} SOL. Current balance: ${adminSolBalance / 1e9} SOL. Please airdrop more SOL to the admin account.`);
        }

        // Get token storage PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );
        console.log("\n=== PDAs and Accounts ===");
        console.log("Token Storage Authority:", tokenStorageAuthority.toString());

        // Get admin's ATA
        const adminATA = await getAssociatedTokenAddress(
            mint,
            adminKeypair.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );
        console.log("Admin ATA:", adminATA.toString());

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );
        console.log("Storage Account:", storageAccount.toString());

        // Verificar si la cuenta de storage existe
        const storageAccountInfo = await program.provider.connection.getAccountInfo(storageAccount);
        console.log("Storage Account exists:", !!storageAccountInfo);

        // Verificar balance del programa antes del depósito
        console.log("\n=== Current Balances ===");
        try {
            const programBalance = await program.provider.connection.getTokenAccountBalance(storageAccount);
            console.log("Program current balance:", programBalance.value.uiAmount);
            console.log("Program decimals:", programBalance.value.decimals);
        } catch (error) {
            console.log("Program has no previous balance or account not initialized");
        }

        // Verificar balance del admin
        try {
            const adminBalance = await program.provider.connection.getTokenAccountBalance(adminATA);
            console.log("Admin current balance:", adminBalance.value.uiAmount);
            
            const amountToDeposit = amount.toNumber() / Math.pow(10, adminBalance.value.decimals);
            console.log("Amount to deposit (adjusted for decimals):", amountToDeposit);

            if (adminBalance?.value.uiAmount && adminBalance.value.uiAmount < amountToDeposit) {
                throw new Error(
                    `Insufficient funds. Admin has ${adminBalance.value.uiAmount} tokens but trying to transfer ${amountToDeposit}`
                );
            }
        } catch (error) {
            if (error.message.includes("could not find account")) {
                throw new Error(`Admin token account ${adminATA.toString()} not found or has no tokens`);
            }
            throw error;
        }

        // Verificar y crear las cuentas ATA si no existen
        const preInstructions: TransactionInstruction[] = [];

        // Si la cuenta de almacenamiento no existe, crear la instrucción para crearla
        if (!storageAccountInfo) {
            console.log("Creating Storage ATA...");
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    adminKeypair.publicKey,  // payer
                    storageAccount,          // ata
                    tokenStorageAuthority,   // owner
                    mint,                    // mint
                    TOKEN_PROGRAM_ID
                )
            );
        }

        // Verificar adminATA
        try {
            await getAccount(
                program.provider.connection,
                adminATA,
                'confirmed',
                TOKEN_PROGRAM_ID
            );
        } catch (error) {
            console.log("Creating Admin ATA...");
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    adminKeypair.publicKey,
                    adminATA,
                    adminKeypair.publicKey,
                    mint,
                    TOKEN_PROGRAM_ID
                )
            );
        }

        const accounts = {
            user: adminKeypair.publicKey,
            tokenMint: mint,
            tokenStorageAuthority,
            tokenStorageAccount: storageAccount,
            userTokenAccount: adminATA,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        } as const;

        const tx = await program.methods
            .fundTokenStorage(amount)
            .accounts(accounts)
            .preInstructions(preInstructions)
            .signers([adminKeypair])
            .rpc({ commitment: "confirmed" });

        // Verificar balance después del depósito
        console.log("\n=== Updated Balances ===");
        const newProgramBalance = await program.provider.connection.getTokenAccountBalance(storageAccount);
        console.log("Program new balance:", newProgramBalance.value.uiAmount);
        
        const newAdminBalance = await program.provider.connection.getTokenAccountBalance(adminATA);
        console.log("Admin new balance:", newAdminBalance.value.uiAmount);

        console.log("\n=== Transaction Details ===");
        console.log("Transaction signature:", tx);
        console.log("View transaction: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
        
        // Después de la transacción, verificar la cuenta nuevamente
        console.log("\n=== Post-Transaction Verification ===");
        const finalStorageAccountInfo = await program.provider.connection.getAccountInfo(storageAccount);
        console.log("Storage Account exists after tx:", !!finalStorageAccountInfo);
        if (finalStorageAccountInfo) {
            console.log("Storage Account size:", finalStorageAccountInfo.data.length);
            console.log("Storage Account owner:", finalStorageAccountInfo.owner.toString());
        }

        return tx;
    } catch (error) {
        console.error("\nError funding token storage:", error);
        throw error;
    }
};
