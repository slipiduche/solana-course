import { getDepinStakingProgram } from "../helpers/program";
import { PublicKey } from "@solana/web3.js";

async function checkAdminAccount() {
    try {
        const program = await getDepinStakingProgram();
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log("🔍 Checking admin account...");
        console.log("Admin account PDA:", adminAccountPDA.toString());

        const adminAccountInfo = await program.account.adminAccount.fetch(adminAccountPDA);
        console.log("Admin account info:");
        console.log("  feeReceivingWallet:", adminAccountInfo.feeReceivingWallet.toString());
        console.log("  feeAmount:", adminAccountInfo.feeAmount.toString());
        console.log("  adminPubkey:", adminAccountInfo.adminPubkey.toString());

    } catch (error) {
        console.error("Error checking admin account:", error);
    }
}

checkAdminAccount();
