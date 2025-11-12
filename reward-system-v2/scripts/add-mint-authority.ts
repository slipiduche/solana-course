import { addMintAuthority, addMintAuthorityStaking } from "../actions/add-authority";
import { getAdminKeypair } from "../helpers/keypair";
import { getRewardSystemProgram, getStakingProgram } from "../helpers/program";
import { PublicKey } from "@solana/web3.js";

const execute = async () => {
    const program = await getRewardSystemProgram();
    const programStaking = await getStakingProgram();
    const adminKeypair = getAdminKeypair();

    const [_adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
    );
    console.log('programId:', program.programId.toString());

    // add mint authority
    const newAuthority = new PublicKey('EQUGQEigTt7wBWgGK3rMeYVEy6zWioEH6ME2cc3Uvdb7')
    //await addMintAuthority(program, adminKeypair, newAuthority, _adminAccountPDA);
    await addMintAuthorityStaking(program, adminKeypair, newAuthority, _adminAccountPDA);
    console.log('Mint authority added successfully');
}

execute();
