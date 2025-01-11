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

        // Get token storage PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        // Get admin's ATA
        const adminATA = await getAssociatedTokenAddress(
            mint,
            adminKeypair.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );

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
        
        return tx;
    } catch (error) {
        console.error("\nError funding token storage:", error);
        throw error;
    }
};
