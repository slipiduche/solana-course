import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";
import { PublicKey, Keypair } from "@solana/web3.js";

interface ProgramActionProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    adminAccountPDA: PublicKey;
}

export const pauseProgram = async ({
    program,
    adminKeypair,
    adminAccountPDA
}: ProgramActionProps) => {
    try {
        console.log("\n=== Pausing Program ===");
        console.log("Admin:", adminKeypair.publicKey.toString());

        await program.methods
            .pauseProgram()
            .accounts({
                user: adminKeypair.publicKey,
            })
            .signers([adminKeypair])
            .rpc({ commitment: "confirmed" });

        const programState = await program.account.adminAccount.fetch(
            adminAccountPDA
        );

        console.log("\n=== Program State ===");
        console.log("Program paused:", programState.paused);

        if (!programState.paused) {
            throw new Error("Program pause failed: state not updated");
        }

        console.log("Program Paused Successfully");
        
        return programState;
    } catch (error) {
        console.error("\nError pausing program:", error);
        throw error;
    }
};

export const unpauseProgram = async ({
    program,
    adminKeypair,
    adminAccountPDA
}: ProgramActionProps) => {
    try {
        console.log("\n=== Unpausing Program ===");
        console.log("Admin:", adminKeypair.publicKey.toString());

        await program.methods
            .unpauseProgram()
            .accounts({
                user: adminKeypair.publicKey,
            })
            .signers([adminKeypair])
            .rpc({ commitment: "confirmed" });

        const programState = await program.account.adminAccount.fetch(
            adminAccountPDA,
            "finalized"
        );

        console.log("\n=== Program State ===");
        console.log("Program paused:", programState.paused);

        if (programState.paused) {
            throw new Error("Program unpause failed: state not updated");
        }

        console.log("Program Unpaused Successfully");
        
        return programState;
    } catch (error) {
        console.error("\nError unpausing program:", error);
        throw error;
    }
};

