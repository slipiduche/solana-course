import { PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKENS } from "../constants";

async function updateFeeWalletToTokenAccount() {
    try {
        console.log("🔧 Updating Fee Wallet to Admin Token Account");

        const program = await getDepinStakingProgram();
        const admin = getDepinStakingAdminKeypair();

        // Calculate admin token account
        const adminTokenAccount = getAssociatedTokenAddressSync(
            TOKENS.T_WAYRU_TOKEN_MINT,
            admin.publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log("👤 Admin wallet:", admin.publicKey.toString());
        console.log("💰 Admin token account:", adminTokenAccount.toString());
        console.log("🏛️ Admin account PDA:", adminAccountPDA.toString());

        const txHash = await program.methods.updateFeeWallet()
            .accounts({
                user: admin.publicKey,
                adminAccount: adminAccountPDA,
                newFeeWallet: adminTokenAccount
            } as any)
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: false
            });

        console.log("✅ Fee wallet updated to admin token account!");
        console.log("📝 Transaction signature:", txHash);

    } catch (error) {
        console.error("❌ Error updating fee wallet:", error);
        throw error;
    }
}

updateFeeWalletToTokenAccount();
