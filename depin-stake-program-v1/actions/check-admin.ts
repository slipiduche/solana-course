import { PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";

(async () => {
    try {
        const admin = getDepinStakingAdminKeypair();
        console.log('Admin public key:', admin.publicKey.toString());
        const newAdmin = getDepinStakingAdminKeypair("new");
        console.log('New admin public key:', newAdmin.publicKey.toString());
        const program = await getDepinStakingProgram();

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log('Admin account PDA:', adminAccountPDA.toString());

        // Fetch admin account data
        const adminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);

        console.log('\n=== Admin Account Data ===');
        console.log('Current admin:', adminAccountData.adminPubkey.toString());
        console.log('Admin candidate:', adminAccountData.adminCandidatePubkey.toString());
        console.log('Admin update requested:', adminAccountData.adminUpdateRequested);

        // Check if there's a pending admin update
        if (adminAccountData.adminUpdateRequested) {
            console.log('\n⚠️  There is a pending admin update request!');
            console.log('Current admin:', adminAccountData.adminPubkey.toString());
            console.log('Pending admin candidate:', adminAccountData.adminCandidatePubkey.toString());
        } else {
            console.log('\n✅ No pending admin update requests');
        }

    } catch (error) {
        console.error("Error checking admin:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
})();
