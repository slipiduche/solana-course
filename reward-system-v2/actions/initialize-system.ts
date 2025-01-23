import { Program } from "@coral-xyz/anchor";
import { 
    Keypair, 
    PublicKey, 
    SystemProgram,
    LAMPORTS_PER_SOL,
    Transaction,
    TransactionInstruction,
    SystemInstruction
} from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { PROGRAM_DATA_ADDRESS, REWARD_SYSTEM_PROGRAM_ID } from "../constants";

export const initializeSystem = async (
    program: Program<RewardSystem>,
    admin: Keypair
) => {
    try {
        console.log("Initializing system...");
        console.log("Admin:", admin.publicKey.toString());

        // Derivar las PDAs
        const [adminAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        const tx = await program.methods
            .initializeSystem()
            .accounts({
                user: admin.publicKey,
                programData: PROGRAM_DATA_ADDRESS,
            })
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
            });

        await program.provider.connection.confirmTransaction(tx);

        console.log("Transaction signature:", tx);
        console.log("System initialized successfully!");
        
        return tx;
    } catch (error) {
        console.error("Error initializing system:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
};