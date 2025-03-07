import { getAirdropsProgram } from "../helpers/programs";
import { getAdminKeypair, getUserKeypair } from "../helpers/keypair";
import { convertToTokenAmount } from "../helpers/token";
import { TOKEN_MINT } from "../constants";
import { claimTokens } from "../actions/claim-token";
import { createNewWallet } from "../helpers/wallet";

const execute = async () => {
    const program = await getAirdropsProgram();
    const adminKeypair = getAdminKeypair();
    const userKeypair = getUserKeypair();
    const mint = TOKEN_MINT;
    const amount = convertToTokenAmount(10);
    const nonce = 2;
    console.log("Claiming tokens...");
    //const newWallet = createNewWallet();
    //console.log("New wallet address for testig in solana course:", newWallet.wallet.publicKey.toString());
    await claimTokens({
        program,
        adminKeypair,
        userKeypair,
        mint,
        amount,
        nonce
    });
}

execute();