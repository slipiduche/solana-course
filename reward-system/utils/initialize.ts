import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { createTokenMint, mintTokensToContract, createTokenWithMetadata } from "./token";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getRewardSystemProgram } from "./program";

export const initializeRewardSystem = async ({
    provider,
    program,
    adminKeypair,
    initialSupply,
    tokenMetadata
}: {
    provider: anchor.AnchorProvider,
    program: Program<RewardSystem>,
    adminKeypair: Keypair,
    initialSupply: number,
    tokenMetadata?: {
        name: string,
        symbol: string,
        uri: string
    }
}) => {
    try {
        console.log("initializeRewardSystem: Starting initialization...");
        
        // 1. Crear el mint token (con o sin metadata)
        console.log("initializeRewardSystem: Creating token mint...");
        const mint = tokenMetadata 
            ? await createTokenWithMetadata({
                provider,
                adminKeypair,
                ...tokenMetadata
            })
            : await createTokenMint({
                provider,
                adminKeypair
            });
        console.log("initializeRewardSystem: Token mint created:", mint.toString());

        // 2. Inicializar el sistema de recompensas
        console.log("initializeRewardSystem: Initializing reward system...");
        await program.methods
            .initializeSystem()
            .accounts({
                user: adminKeypair.publicKey,
            })
            .signers([adminKeypair])
            .rpc();
        console.log("initializeRewardSystem: Reward system initialized");

        // 3. Fondear el contrato con tokens
        console.log("initializeRewardSystem: Funding contract with tokens...");
        const { contractTokenAccount, tokenStoragePDA } = await mintTokensToContract({
            provider,
            program,
            amount: initialSupply,
            mint,
            adminKeypair
        });
        console.log("initializeRewardSystem: Contract funded successfully");

        return {
            mint,
            contractTokenAccount,
            tokenStoragePDA
        };

    } catch (error) {
        console.error("Error in initializeRewardSystem:", error);
        console.error("Error stack:", error.stack);
        if (error.logs) {
            console.error("Solana logs:", error.logs);
        }
        throw error;
    }
}

export const depositTokensToSystem = async ({
    provider,
    program,
    adminKeypair,
    amount,
    mint  // Necesitas pasar el mint existente
}: {
    provider: anchor.AnchorProvider,
    program: Program<RewardSystem>,
    adminKeypair: Keypair,
    amount: number,
    mint: PublicKey
}) => {
    try {
        console.log("depositTokensToSystem: Starting deposit...");
        
        // Depositar tokens al contrato
        const { contractTokenAccount, tokenStoragePDA } = await mintTokensToContract({
            provider,
            program,
            amount,
            mint,
            adminKeypair
        });
        
        console.log("depositTokensToSystem: Tokens deposited successfully");
        
        return {
            mint,
            contractTokenAccount,
            tokenStoragePDA
        };

    } catch (error) {
        console.error("Error in depositTokensToSystem:", error);
        console.error("Error stack:", error.stack);
        if (error.logs) {
            console.error("Solana logs:", error.logs);
        }
        throw error;
    }
}

export async function createAndDepositNewToken({
    provider,
    program,
    adminKeypair,
    amount,
    tokenMetadata
}: {
    provider: anchor.AnchorProvider,
    program: Program<RewardSystem>,
    adminKeypair: Keypair,
    amount: number,
    tokenMetadata: {
        name: string,
        symbol: string,
        uri: string
    }
}) {
    // Crear el mint con metadata
    const mint = await createTokenWithMetadata({
        provider,
        adminKeypair,
        ...tokenMetadata
    });

    // Obtener PDA para token storage
    const [tokenStorageAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token_storage")],
        program.programId
    );

    // Crear la cuenta ATA del admin para recibir los tokens iniciales
    const adminATA = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        adminKeypair,
        mint,
        adminKeypair.publicKey
    );

    // Mintear tokens al admin
    await mintTo(
        provider.connection,
        adminKeypair,
        mint,
        adminATA.address,
        adminKeypair.publicKey,
        amount
    );

    // Obtener la cuenta de storage usando el PDA correcto
    const storageAccount = await getAssociatedTokenAddress(
        mint,
        tokenStorageAuthority,
        true // allowOwnerOffCurve = true para PDAs
    );

    // Crear la cuenta de storage del contrato usando fundTokenStorage
    const accounts = {
        user: adminKeypair.publicKey,
        tokenMint: mint,
        tokenStorageAuthority,
        tokenStorageAccount: storageAccount,
        userTokenAccount: adminATA.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
    } as const;

    console.log("\nCuentas para fund_token_storage:");
    console.log("- Token Mint:", mint.toString());
    console.log("- Storage Authority (PDA):", tokenStorageAuthority.toString());
    console.log("- Storage Account:", storageAccount.toString());
    console.log("- Admin ATA:", adminATA.address.toString());

    const ix = await program.methods
        .fundTokenStorage(new BN(amount))
        .accounts(accounts)
        .instruction();

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.feePayer = adminKeypair.publicKey;

    await sendAndConfirmTransaction(provider.connection, tx, [adminKeypair]);

    return {
        mint,
        contractTokenAccount: storageAccount,
    };
}



