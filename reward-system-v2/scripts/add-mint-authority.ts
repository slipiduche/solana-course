import { addMintAuthority } from "../actions/add-authority";
import { getAdminKeypair } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { PublicKey } from "@solana/web3.js";

const execute = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const [_adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
    );

    // add mint authority
    const newAuthority = new PublicKey('8QMK1JHzjydq7qHgTo1RwK3ateLm4zVQF7V7BkriNkeD')
    await addMintAuthority(program, adminKeypair, newAuthority, _adminAccountPDA);
    console.log('Mint authority added successfully');
}

execute();
