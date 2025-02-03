import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";
import { PublicKey, Keypair, Connection, clusterApiUrl,  } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

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
        console.log("\n=== Claim Rewards ===");
        console.log("User:", userKeypair.publicKey.toString());
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("Mint:", mint.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("User NFT Token Account:", userNFTTokenAccount.toString());

        // Get token storage authority
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );
        console.log("\n=== PDAs and Accounts ===");
        console.log("Token Storage Authority:", tokenStorageAuthority.toString());

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );
        console.log("Storage Account:", storageAccount.toString());

        // Get user's token account
        const userTokenAccount = await getAssociatedTokenAddress(
            mint,
            userKeypair.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        // Derivar otras PDAs necesarias
        const [adminAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        const [rewardEntry] = PublicKey.findProgramAddressSync(
            [Buffer.from("reward_entry"), userKeypair.publicKey.toBuffer(), nftMint.toBuffer()],
            program.programId
        );

        const [nfnodeEntry] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
            program.programId
        );


        // accounts 
        const accounts = {
            userAdmin: adminKeypair.publicKey,
            user: userKeypair.publicKey,
            nftMintAddress: nftMint,
            rewardEntry,
            nfnodeEntry,
            tokenMint: mint,
            tokenStorageAuthority,
            tokenStorageAccount: storageAccount,
            userTokenAccount,
            userNftTokenAccount: userNFTTokenAccount,
            adminAccount,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,  // Añadido de nuevo
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        } as const
 
        const ix = await program.methods
            .ownerClaimRewards(rewardAmount, nonce)
            .accounts(accounts)
            .instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
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

        const txId = await program.provider.connection.sendEncodedTransaction(
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
        console.error("Error details:", error.message);
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
        console.log("User:", userKeypair.publicKey.toString());
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("Mint:", mint.toString());
        console.log("NFT Mint:", nftMint.toString());

        // Get token storage authority
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );
        console.log("\n=== PDAs and Accounts ===");
        console.log("Token Storage Authority:", tokenStorageAuthority.toString());

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );
        console.log("Storage Account:", storageAccount.toString());

        // Get user's token account
        const userTokenAccount = await getAssociatedTokenAddress(
            mint,
            userKeypair.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );
        console.log("User Token Account:", userTokenAccount.toString());

        // Derivar otras PDAs necesarias
        const [adminAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        const [rewardEntry] = PublicKey.findProgramAddressSync(
            [Buffer.from("reward_entry"), userKeypair.publicKey.toBuffer(), nftMint.toBuffer()],
            program.programId
        );

        const [nfnodeEntry] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
            program.programId
        );

        const accounts = {
            userAdmin: adminKeypair.publicKey,
            user: userKeypair.publicKey,
            nftMintAddress: nftMint,
            rewardEntry,
            nfnodeEntry,
            tokenMint: mint,
            tokenStorageAuthority,
            tokenStorageAccount: storageAccount,
            userTokenAccount,
            adminAccount,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        } as const

        const ix = await program.methods
            .othersClaimRewards(rewardAmount, nonce)
            .accounts(accounts)
            .instruction();

        let tx = new anchor.web3.Transaction();
        tx.add(ix);
        tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
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

        const txId = await program.provider.connection.sendEncodedTransaction(
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
        console.error("\nError in others claim rewards:", error);
        console.error("Error details:", error.message);
        throw error;
    }
};