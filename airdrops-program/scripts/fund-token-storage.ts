import { fundTokenStorage } from "../actions/fund-token-storage";
import { TOKEN_MINT } from "../constants";
import { getAdminKeypair, getTokenOwnerKeypair } from "../helpers/keypair";
import { getAirdropsProgram } from "../helpers/programs";
import { convertToTokenAmount } from "../helpers/token";


const execute = async () => {
    const program = await getAirdropsProgram();
    const adminKeypair = getAdminKeypair();
    console.log("adminKeypair", adminKeypair.publicKey.toString());
    const tokenOwnerKeypair = getTokenOwnerKeypair();
    console.log("tokenOwnerKeypair", tokenOwnerKeypair.publicKey.toString());
    console.log("Funding token storage...");
    await fundTokenStorage({
        program,
        adminKeypair,
        tokenOwnerKeypair,
        tokenMint: TOKEN_MINT,
        amount: convertToTokenAmount(1000000)
    });
}

execute();