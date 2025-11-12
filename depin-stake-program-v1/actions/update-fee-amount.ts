import { BN } from "bn.js";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";

interface UpdateFeeAmountProps {
    newFeeAmount: number;
}

export const updateFeeAmount = async ({ newFeeAmount }: UpdateFeeAmountProps) => {
    try {
        console.log("🔧 Starting update fee amount operation...");
        const program = await getDepinStakingProgram();
        const admin = getDepinStakingAdminKeypair();

        // Calculate adminAccount PDA
        const [adminAccountPDA] = await import("@solana/web3.js").then(web3 =>
            web3.PublicKey.findProgramAddressSync(
                [Buffer.from("admin_account")],
                program.programId
            )
        );

        console.log("👤 Admin:", admin.publicKey.toString());
        console.log("💰 New fee amount:", newFeeAmount);
        console.log("🏛️ Admin account PDA:", adminAccountPDA.toString());

        const txHash = await program.methods.updateFeeAmount(new BN(newFeeAmount))
            .accounts({
                user: admin.publicKey,
                adminAccount: adminAccountPDA
            } as any)
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: false
            });

        console.log("✅ Fee amount updated successfully!");
        console.log("📝 Transaction signature:", txHash);

    } catch (error) {
        console.error("❌ Error updating fee amount:", error);
        throw error;
    }
};
