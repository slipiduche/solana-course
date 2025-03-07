import { pauseUnpauseSystem } from "../actions/pause-unpause-system";
import { getAdminKeypair } from "../helpers/keypair";
import { getAirdropsProgram } from "../helpers/programs";


const execute = async () => {
    const program = await getAirdropsProgram();
    const adminKeypair = getAdminKeypair();
    console.log("Pausing airdrops system...");
    await pauseUnpauseSystem({ program, adminKeypair, pause: false });
}

execute();
