import { PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";

interface UpdateFeeWalletProps {
    newFeeWallet: PublicKey;
}

export const updateFeeWallet = async ({ newFeeWallet }: UpdateFeeWalletProps) => {
    try {
        console.log("🔧 Starting update fee wallet operation...");
        const program = await getDepinStakingProgram();
        const admin = getDepinStakingAdminKeypair('new');

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log("👤 Admin:", admin.publicKey.toString());
        console.log("💰 New fee wallet:", newFeeWallet.toString());
        console.log("🏛️ Admin account PDA:", adminAccountPDA.toString());

        const txHash = await program.methods.updateFeeWallet()
            .accounts({
                user: admin.publicKey,
                adminAccount: adminAccountPDA,
                newFeeWallet: newFeeWallet
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
