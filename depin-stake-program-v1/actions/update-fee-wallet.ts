import { PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKENS } from "../constants";

interface UpdateFeeWalletProps {
    newFeeWallet?: PublicKey; // Optional: if not provided, uses admin's ATA
}

export const updateFeeWallet = async ({ newFeeWallet }: UpdateFeeWalletProps = {}) => {
    try {
        console.log("🔧 Starting update fee wallet operation...");
        const program = await getDepinStakingProgram();
        const admin = getDepinStakingAdminKeypair();

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // If newFeeWallet is not provided, calculate admin's ATA
        let feeWalletToUse: PublicKey;
        if (newFeeWallet) {
            feeWalletToUse = newFeeWallet;
        } else {
            // Calculate admin's associated token account for fee receiving
            feeWalletToUse = getAssociatedTokenAddressSync(
                TOKENS.T_WAYRU_TOKEN_MINT,
                admin.publicKey,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            console.log("ℹ️ No fee wallet provided, using admin's ATA");
        }

        console.log("👤 Admin:", admin.publicKey.toString());
        console.log("💰 New fee wallet:", feeWalletToUse.toString());
        console.log("🏛️ Admin account PDA:", adminAccountPDA.toString());

        const txHash = await program.methods.updateFeeWallet()
            .accounts({
                user: admin.publicKey,
                adminAccount: adminAccountPDA,
                newFeeWallet: feeWalletToUse
            } as any)
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: false
            });

        console.log("✅ Fee wallet updated successfully!");
        console.log("📝 Transaction signature:", txHash);

    } catch (error) {
        console.error("❌ Error updating fee wallet:", error);
        throw error;
    }
};
