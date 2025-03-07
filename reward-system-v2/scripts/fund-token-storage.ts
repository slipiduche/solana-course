
import { convertToTokenAmount } from "../../reward-system/utils/token";
import { fundTokenStorage } from "../actions/fund-token-storage";
import { TOKENS, DECIMALS, MALICIOUS_USER2_PRIVATEKEY, USER_PRIVATE_SEED } from "../constants";
import { BN } from "bn.js";
import { getRewardSystemProgram } from "../helpers/program";
import { getAdminKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getUserTokenBalance } from "../helpers/get-balance";

const executeFundTokenStorage = async () => {
    const adminKeypair =  getWalletFromUnit8Array(MALICIOUS_USER2_PRIVATEKEY);; // malicious user is the owner
    const mint = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT;
    const amount = new BN(convertToTokenAmount(50000, DECIMALS));

    const program = await getRewardSystemProgram();
    await fundTokenStorage({ program, adminKeypair, mint, amount });
}

const consultBalance = async () => {
    const program = await getRewardSystemProgram();
    console.log("admin_account:", program.programId.toString());
    const mint = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT;

       // Get token storage PDA
       const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_storage")],
        program.programId
    );
    try { // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );
        const programBalance = await program.provider.connection.getTokenAccountBalance(storageAccount);
        console.log("Program current balance:", programBalance.value.uiAmount);
        console.log("Program decimals:", programBalance.value.decimals);
    } catch (error) {
        console.log("Program has no previous balance or account not initialized");
    }

}

const cosultWalletBalance = async () => {
    const program = await getRewardSystemProgram();
    const mint = TOKENS.WAYRU.MINT_2;
    const balance = await getUserTokenBalance(program.provider.connection, new PublicKey("Ee41f7ot1LbfDhEJC3G9u45D2B91KiEp7x4tGDkeZuJB"), mint);
    console.log("User balance:", balance.uiAmount);
}

consultBalance();