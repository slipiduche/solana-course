import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export const getUserNFTTokenAccount = async (
    nftMint: PublicKey,
    userPublicKey: PublicKey,
): Promise<PublicKey> => {
    try {
        const userNFTTokenAccount = await getAssociatedTokenAddress(
            nftMint,                // mint
            userPublicKey,          // owner
            false,                  // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID   // programId
        );

        console.log("NFT Token Account:", userNFTTokenAccount.toString());
        return userNFTTokenAccount;
    } catch (error) {
        console.error("Error getting NFT token account:", error);
        throw error;
    }
}; 