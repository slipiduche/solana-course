
import { convertToTokenAmount } from "../../reward-system/utils/token";
import { fundTokenStorage } from "../actions/fund-token-storage";
import { TOKENS, DECIMALS } from "../constants";
import { BN } from "bn.js";
import { getRewardSystemProgram } from "../helpers/program";
import { getAdminKeypair } from "../helpers/keypair";


const executeFundTokenStorage = async () => {
    const adminKeypair = getAdminKeypair();
    const mint = TOKENS.WAYRU.MINT;
    const amount = new BN(convertToTokenAmount(800, DECIMALS));

    const program = await getRewardSystemProgram();
    await fundTokenStorage({ program, adminKeypair, mint, amount });
}

executeFundTokenStorage();