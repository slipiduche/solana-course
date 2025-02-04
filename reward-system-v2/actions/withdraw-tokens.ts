import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { RewardSystem } from "../types/reward_system";

interface WithdrawTokensProps {
    program: Program<RewardSystem>;
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