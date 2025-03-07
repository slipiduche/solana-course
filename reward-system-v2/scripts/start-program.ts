import { USER_PRIVATE_SEED, MALICIOUS_USER2_PRIVATEKEY } from "../constants";
import { getRewardSystemProgram } from "../helpers/program";
import { getKeypair } from "../../spl-token/helpers/getKeyPair";
import { getAdminKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { initializeSystem } from "../actions/initialize-system";
import { getAccountBalance } from "../helpers/get-balance";
import { createNewWallet } from "../helpers/wallet";


const startProgram = async () => {
    const program = await getRewardSystemProgram();
    console.log("Program started");
    // get user keypair
    const maliciousUserKeypair = getWalletFromUnit8Array(MALICIOUS_USER2_PRIVATEKEY);
    console.log("Malicious user keypair =>", maliciousUserKeypair.publicKey.toString());
    // get admin keypairs and check balances
    const adminKeypair = getAdminKeypair();

    const adminBalance = await getAccountBalance(program.provider.connection, adminKeypair.publicKey);

    console.log("Admin keypair =>", adminKeypair.publicKey.toString(), `(${adminBalance} SOL)`);

    if (adminBalance < 0.1) {
        console.warn("WARNING: Admin account has low balance!");
    }

    // initialize system
    //await initializeSystem(program, adminKeypair);
    const newWallet = createNewWallet();
    console.log("System initialized");
}

startProgram();