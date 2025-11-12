import { getDepinStakingProgram } from "../helpers/program";
import { PublicKey } from "@solana/web3.js";

async function checkAdminFee() {
    const program = getDepinStakingProgram();
    const adminAccountPDA = PublicKey.findProgramAddressSync([Buffer.from('admin_account')], new PublicKey('ECcNAeDo6TbYpr1bY2e1uybkiNEuRSbxRbqad4r1azK8'))[0];

    try {
        const admin = await program.account.adminAccount.fetch(adminAccountPDA);
        console.log('Admin feeReceivingWallet:', admin.feeReceivingWallet.toString());
        console.log('Admin feeAmount:', admin.feeAmount.toString());
    } catch (error) {
        console.error('Error fetching admin account:', error);
    }
}

checkAdminFee();
