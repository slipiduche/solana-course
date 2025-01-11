import { getRewardSystemProgram } from "../helpers/program";
import { getAdminKeypair } from "../helpers/keypair";
import { pauseProgram, unpauseProgram } from "../actions/program";
import { PublicKey } from "@solana/web3.js";
const executePauseProgram = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();

    const [adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
      );
    await pauseProgram({ program, adminKeypair, adminAccountPDA });
}

const executeUnpauseProgram = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const [adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
      );
    await unpauseProgram({ program, adminKeypair, adminAccountPDA });
}   

executeUnpauseProgram()