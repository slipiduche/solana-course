import { ADMIN_PRIVATE_KEY, USER_PRIVATE_SEED } from "../constants";
import { getRewardSystemProgram } from "../helpers/program";
import { getKeypair } from "../../spl-token/helpers/getKeyPair";
import { getAdminKeypair } from "../helpers/keypair";
import { getAdminKeypair as getAdminKeypairV1 } from "../../reward-system/utils/keypar";
import { initializeSystem } from "../actions/initialize-system";
import { getAccountBalance } from "../helpers/get-balance";
import { createNewWallet } from "../helpers/wallet";


const startProgram = async () => {
    const program = await getRewardSystemProgram();
    console.log("Program started");
    // get user keypair
    const userKeypair = getKeypair(USER_PRIVATE_SEED);
    console.log("User keypair =>", userKeypair.publicKey.toString());
    // get admin keypairs and check balances
    const adminKeypair = getAdminKeypair();
    
    const adminBalance = await getAccountBalance(program.provider.connection, adminKeypair.publicKey);

    console.log("Admin keypair v2 =>", adminKeypair.publicKey.toString(), `(${adminBalance} SOL)`);

    if (adminBalance < 0.1) {
        console.warn("WARNING: Admin v2 account has low balance!");
    }

    // initialize system
    // await initializeSystem(program, adminKeypair);
    const newWallet = createNewWallet();
    console.log("System initialized");
}

startProgram();