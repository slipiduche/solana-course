import { initializeAirdropsSystem } from "../actions/initialize-system"
import { TOKEN_MINT } from "../constants";
import { getAdminKeypair } from "../helpers/keypair";
import { getAirdropsProgram } from "../helpers/programs"

const execute = async () => {
    const program = await getAirdropsProgram();
    const adminKeypair = getAdminKeypair();
    console.log("Initializing airdrops system...");
    await initializeAirdropsSystem({
        program,
        adminKeypair,
        tokenMint: TOKEN_MINT
    })
}

execute();