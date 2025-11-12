import {  Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { RewardSystem } from "../types/reward_system";
import { StakingProgram } from "../types/staking_program";
import { convertToTokenAmount } from "../../reward-system/utils/token";
import BN from "bn.js";

interface WithdrawTokensProps {
    program: Program<RewardSystem>;
    userNftOwner: Keypair;
    tokenMint: PublicKey;
    nftMint: PublicKey;
}

interface DepositTokensProps {
    program: Program<StakingProgram>;
    userNftOwner: Keypair;
    tokenMint: PublicKey;
    nftMint: PublicKey;
}

export const withdrawTokens = async ({
    program,
    userNftOwner,
    tokenMint,
    nftMint,
}: WithdrawTokensProps) => {
    try {
        console.log("Withdrawing tokens...");
        console.log("User:", userNftOwner.publicKey.toString());

           // Obtener la cuenta de token NFT del usuario
           const userNFTTokenAccount = await getOrCreateAssociatedTokenAccount(
            program.provider.connection,
            userNftOwner,
            nftMint,
            userNftOwner.publicKey,
            undefined,
            'confirmed',
            { commitment: "finalized" },
            TOKEN_2022_PROGRAM_ID,  
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        const signature = await program.methods
            .withdrawTokens()
            .accounts({
                user: userNftOwner.publicKey,
                tokenMint: tokenMint,
                nftMintAddress: nftMint,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                userNftTokenAccount: userNFTTokenAccount.address
            })
            .signers([userNftOwner])
            .rpc();

        console.log("Transaction signature:", signature);
        return signature;

    } catch (error) {
        console.error("Error withdrawing tokens:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        throw error;
    }
};

export const depositTokens = async ({
    program,
    userNftOwner,
    tokenMint,
    nftMint,
}: DepositTokensProps) => {
    try {
        console.log("Depositing tokens...");
        console.log("User:", userNftOwner.publicKey.toString());
        const amount = 15;
        const depositAmount = convertToTokenAmount(amount, 6);


           // Obtener la cuenta de token NFT del usuario
           const userNFTTokenAccount = await getOrCreateAssociatedTokenAccount(
            program.provider.connection,
            userNftOwner,
            nftMint,
            userNftOwner.publicKey,
            undefined,
            'confirmed',
            { commitment: "finalized" },
            TOKEN_2022_PROGRAM_ID,  
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        const tx = await program.methods
            .depositTokens(new BN(depositAmount))
            .accounts({
                user: userNftOwner.publicKey,
                tokenMint: tokenMint,
                nftMintAddress: nftMint,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                userNftTokenAccount: userNFTTokenAccount.address
            })
            .transaction()

        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();

        // Set transaction properties before signing
        tx.feePayer = userNftOwner.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;

        tx.sign(userNftOwner);

        const signature = await program.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            preflightCommitment: 'finalized',
            maxRetries: 5,
        });

        console.log("Transaction signature:", signature);
        return signature;

    } catch (error) {
        console.error("Error depositing tokens:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        throw error;
    }
};