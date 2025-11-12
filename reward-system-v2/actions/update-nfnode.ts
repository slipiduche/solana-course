import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import { Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

interface UpdateNfnodeProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userKeypair: Keypair;
    newHostPublicKey: PublicKey;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    nfnodeEntryPDA: PublicKey;
    feeToUpdateMetadata: number;
    paymentToAddHostToSystem: number;
    adminWalletAddress: string;
    treasuryWalletAddress: string;
}

export const updateNfnode = async ({
    program,
    adminKeypair,
    userKeypair,
    newHostPublicKey,
    nftMint,
    userNFTTokenAccount,
    nfnodeEntryPDA,
    feeToUpdateMetadata,
    paymentToAddHostToSystem,
    adminWalletAddress,
    treasuryWalletAddress
}: UpdateNfnodeProps) => {
    try {
        // admin create and sign transacción
        console.log("admin creationg and signing transaction");
        const serializedTx = await adminCreateAndSignTx({
            program,
            adminKeypair,
            userKeypair: userKeypair.publicKey,
            newHostPublicKey,
            nftMint,
            userNFTTokenAccount,
            feeToUpdateMetadata,
            paymentToAddHostToSystem,
            adminWalletAddress,
            treasuryWalletAddress
        });

        // user sign transaction
        console.log("user signing transaction");
        const result = await userSignAndSendTx({
            serializedTx,
            userKeypair,
            nfnodeEntryPDA,
            program,
            newHostPublicKey
        });
        console.log("Transaction sent successfully", result);
    } catch (error) {
        console.error("\nError updating NFNode:", error);
        throw error;
    }
};


interface AdminCreateAndSignTxProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userKeypair: PublicKey;
    newHostPublicKey: PublicKey;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    feeToUpdateMetadata: number;
    paymentToAddHostToSystem: number;
    adminWalletAddress: string;
    treasuryWalletAddress: string;
}

export const adminCreateAndSignTx = async ({
    program,
    adminKeypair,
    userKeypair,
    newHostPublicKey,
    nftMint,
    userNFTTokenAccount,
    feeToUpdateMetadata,
    paymentToAddHostToSystem,
    adminWalletAddress,
    treasuryWalletAddress
}: AdminCreateAndSignTxProps) => {
    try {
        const hostShare = 50;
        const { blockhash } = await program.provider.connection.getLatestBlockhash();
        
        const transaction = new Transaction();
        
        // Add SOL transfers
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: userKeypair,
                toPubkey: new PublicKey(adminWalletAddress),
                lamports: Math.round(feeToUpdateMetadata * LAMPORTS_PER_SOL),
            }),
            SystemProgram.transfer({
                fromPubkey: userKeypair,
                toPubkey: new PublicKey(treasuryWalletAddress),
                lamports: Math.round(paymentToAddHostToSystem * LAMPORTS_PER_SOL),
            })
        );

        // Add updateNfnode instruction
        const updateNfnodeIx = await program.methods
            .updateNfnode(new BN(hostShare))
            .accounts({
                userAdmin: adminKeypair.publicKey,
                user: userKeypair,
                host: newHostPublicKey,
                nftMintAddress: nftMint,
                userNftTokenAccount: userNFTTokenAccount,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            })
            .instruction();

        transaction.add(updateNfnodeIx);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = userKeypair;
        
        // Admin signs the transaction
        transaction.partialSign(adminKeypair);

        // Serialize transaction
        const serializedTx = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });

        return serializedTx.toString('base64');
    } catch (error) {
        console.error("\nError creating admin transaction:", error);
        throw error;
    }
};

interface UserSignTxProps {
    serializedTx: string;
    userKeypair: Keypair;
    nfnodeEntryPDA: PublicKey;
    program: Program<RewardSystem>;
    newHostPublicKey: PublicKey;
}

export const userSignAndSendTx = async ({
    serializedTx,
    userKeypair,
    nfnodeEntryPDA,
    program,
    newHostPublicKey
}: UserSignTxProps) => {
    try {
        const connection = program.provider.connection;
        const recoveredTx = Transaction.from(Buffer.from(serializedTx, 'base64'));
        recoveredTx.partialSign(userKeypair);

        const signature = await connection.sendRawTransaction(
            recoveredTx.serialize(),
            {
                preflightCommitment: "confirmed",
                skipPreflight: true,
            }
        );

        console.log("Transaction signature:", signature);

        // Wait for the transaction to be confirmed and the state to be updated
        const maxAttempts = 10;
        const delayMs = 1000; // 1 second between attempts
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                // Wait for delay
                await new Promise(resolve => setTimeout(resolve, delayMs));
                
                // Fetch the updated state
                const updatedState = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
                
                // Verify if the host has been updated
                if (updatedState.host.toString() === newHostPublicKey.toString()) {
                    return {
                        signature,
                        updatedState: {
                            host: updatedState.host.toString(),
                            hostShare: updatedState.hostShare.toString(),
                            manufacturer: updatedState.manufacturer.toString(),
                            manufacturerLastClaimedTimestamp: updatedState.manufacturerLastClaimedTimestamp.toString(),
                            totalRewardsClaimed: updatedState.totalRewardsClaimed.toString(),
                            depositAmount: updatedState.depositAmount.toString(),
                            depositTimestamp: updatedState.depositTimestamp.toString(),
                            nfnodeType: updatedState.nfnodeType,
                        }
                    };
                }
            } catch (error) {
                console.log(`Attempt ${attempts + 1}: Waiting for state update...`);
            }
            
            attempts++;
        }
        
        throw new Error("Timeout waiting for state update");
    } catch (error) {
        console.error("\nError processing user transaction:", error);
        throw error;
    }
};