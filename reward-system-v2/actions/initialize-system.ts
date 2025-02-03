import { Program } from "@coral-xyz/anchor";
import { 
    Keypair, 
    PublicKey, 
    SystemProgram,
} from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { TOKENS } from "../constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

        const accounst = {
            user: admin.publicKey,
            adminAccount: adminAccountPda,
            tokenMint: TOKENS.WAYRU.REWARD_TOKEN_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: new PublicKey("49YD9iaXY39zY8tycUg1vJvk6b4cDoVJNrbsmMkk3ihF"),
            programData: new PublicKey("EkHtKiH6C3aLFmvjZzXTnoCFnAWhkkeaMxzzoXxZRfcN"),
            systemProgram: SystemProgram.programId
        } as const

        const tx = await program.methods
            .initializeSystem()
            .accounts(accounst)
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