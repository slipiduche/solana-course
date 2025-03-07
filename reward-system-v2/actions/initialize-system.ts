import { Program } from "@coral-xyz/anchor";
import { 
    Keypair, 
    PublicKey, 
    SystemProgram,
} from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { TOKENS } from "../constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const BPF_UPGRADE_LOADER_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');

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

        const [programDataAddress] = PublicKey.findProgramAddressSync(
            [program.programId.toBuffer()],
            BPF_UPGRADE_LOADER_ID
        );

        const accounst = {
            user: admin.publicKey,
            adminAccount: adminAccountPda,
            tokenMint: TOKENS.WAYRU.REWARD_TOKEN_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: program.programId,
            programData: programDataAddress,
            systemProgram: SystemProgram.programId,
            mintAuthority: new PublicKey('8QMK1JHzjydq7qHgTo1RwK3ateLm4zVQF7V7BkriNkeD')
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