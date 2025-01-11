import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";

export const initializeSystem = async (
    program: Program<RewardSystem>,
    admin: Keypair
) => {
    try {
        console.log("Initializing system...");
        console.log("Admin:", admin.publicKey.toString());

        const tx = await program.methods
            .initializeSystem()
            .accounts({
                user: admin.publicKey,
            })
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: true,
            });

        console.log("Transaction signature:", tx);
        console.log("System initialized successfully!");
        
        return tx;
    } catch (error) {
        console.error("Error initializing system:", error);
        throw error;
    }
};