import { Program } from "@coral-xyz/anchor";
import { 
    Keypair, 
    PublicKey, 
    SystemProgram,
} from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { TOKENS } from "../constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { StakingProgram } from "../types/staking_program";
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
            tokenMint: TOKENS.WAYRU.T_WAYRU_TOKEN_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: program.programId,
            programData: programDataAddress,
            systemProgram: SystemProgram.programId,
            mintAuthority: new PublicKey('AgKGhdkfjwYSzH6wLSyuCbcxTAyzQX81qc42QYvxmTk9')
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

export const initializeStakingSystem = async (
    program: Program<StakingProgram>,
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

        console.log("\nProgram Data Details:");
        console.log("Program ID:", program.programId.toString());
        console.log("BPF Loader ID:", BPF_UPGRADE_LOADER_ID.toString());
        console.log("Program Data Address:", programDataAddress.toString());

        const accounst = {
            user: admin.publicKey,
            adminAccount: adminAccountPda,
            tokenMint: TOKENS.WAYRU.T_WAYRU_TOKEN_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: program.programId,
            programData: programDataAddress,
            systemProgram: SystemProgram.programId,
            mintAuthority: admin.publicKey
        } as const

        // Debug logging for all accounts
        console.log("\nAccount Details:");
        console.log("user:", accounst.user.toString());
        console.log("adminAccount:", accounst.adminAccount.toString());
        console.log("tokenMint:", accounst.tokenMint.toString());
        console.log("tokenProgram:", accounst.tokenProgram.toString());
        console.log("program:", accounst.program.toString());
        console.log("programData:", accounst.programData.toString());
        console.log("systemProgram:", accounst.systemProgram.toString());
        console.log("mintAuthority:", accounst.mintAuthority.toString());

        // Get the latest blockhash first
        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();

        const tx = await program.methods
            .initializeSystem()
            .accounts(accounst)
            .transaction();

        // Set transaction properties before signing
        tx.feePayer = admin.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;

        // Sign the transaction
        tx.sign(admin);

        const txHash = await program.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            preflightCommitment: 'finalized',
            maxRetries: 5,
        });

        console.log("Transaction signature:", txHash);
        console.log("System initialized successfully!");
        
        return tx;
    } catch (error) {
        console.error("Error initializing system:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
};