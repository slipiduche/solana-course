import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";
import { PublicKey, Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

interface OwnerClaimRewardsProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userKeypair: Keypair;
    mint: PublicKey;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    rewardAmount: anchor.BN;
    nonce: anchor.BN;
}

export const ownerClaimRewards = async ({
    program,
    adminKeypair,
    userKeypair,
    mint,
    nftMint,
    userNFTTokenAccount,
    rewardAmount,
    nonce
}: OwnerClaimRewardsProps) => {
    try {
        console.log("\n=== Owner Claim Rewards ===");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("User:", userKeypair.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("Amount to claim:", rewardAmount.toString());
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const ix = await program.methods
            .ownerClaimRewards(rewardAmount, nonce)
            .accounts({
                userAdmin: adminKeypair.publicKey,
                user: userKeypair.publicKey,
                tokenMint: mint,
                nftMintAddress: nftMint,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                userNftTokenAccount: userNFTTokenAccount,
            })
            .instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = userKeypair.publicKey;
        tx.partialSign(adminKeypair);

        const serializedTx = tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });

        const txBase64 = serializedTx.toString("base64");
        // send to client to sign
        const recoveredTx = anchor.web3.Transaction.from(Buffer.from(txBase64, "base64"));
        recoveredTx.partialSign(userKeypair);

       
        const serializedTxFinal = recoveredTx.serialize({
            requireAllSignatures: true,
            verifySignatures: true,
        });

        const txId = await connection.sendEncodedTransaction(
            serializedTxFinal.toString('base64'),
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
                maxRetries: 5
            }
        );

        console.log("\n=== Transaction Details ===");
        console.log("Rewards Claimed Successfully");
        console.log("Transaction ID:", txId);
        console.log("View transaction: https://explorer.solana.com/tx/" + txId + "?cluster=devnet");
        
        return txId;
    } catch (error) {
        console.error("\nError claiming rewards:", error);
        throw error;
    }
};

interface OthersClaimRewardsProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userKeypair: Keypair;
    mint: PublicKey;
    nftMint: PublicKey;
    rewardAmount: anchor.BN;
    nonce: anchor.BN;
}

export const othersClaimRewards = async ({
    program,
    adminKeypair,
    userKeypair,
    mint,
    nftMint,
    rewardAmount,
    nonce,
}: OthersClaimRewardsProps) => {
    try {
        console.log("\n=== Others Claim Rewards ===");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("User:", userKeypair.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("Amount to claim:", rewardAmount.toString());
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        
        const ix = await program.methods
            .othersClaimRewards(rewardAmount, nonce)
            .accounts({
                userAdmin: adminKeypair.publicKey,
                user: userKeypair.publicKey,
                tokenMint: mint,
                nftMintAddress: nftMint,
            })
            .instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = userKeypair.publicKey;
        tx.partialSign(adminKeypair);

        const serializedTx = tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });

        const txBase64 = serializedTx.toString("base64");
        // send to client to sign
        const recoveredTx = anchor.web3.Transaction.from(Buffer.from(txBase64, "base64"));
        recoveredTx.partialSign(userKeypair);

        const serializedTxFinal = recoveredTx.serialize({
            requireAllSignatures: true,
            verifySignatures: true,
        });

        const txId = await connection.sendEncodedTransaction(
            serializedTxFinal.toString('base64'),
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
                maxRetries: 5
            }
        );

        console.log("\n=== Transaction Details ===");
        console.log("Rewards Claimed Successfully");
        console.log("Transaction ID:", txId);
        console.log("View transaction: https://explorer.solana.com/tx/" + txId + "?cluster=devnet");
        
        return txId;
    } catch (error) {
        console.error("\nError claiming rewards:", error);
        throw error;
    }
};