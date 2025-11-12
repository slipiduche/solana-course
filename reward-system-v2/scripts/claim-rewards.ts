import { getAdminKeypair, getKeypair, getUserKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { BN } from "bn.js";
import { TOKENS, DECIMALS, MANUFACTUR_PRIVATE_KEY, WIFI_APP_HOST_USER_SEED } from "../constants";
import { convertToTokenAmount } from "../../reward-system/utils/token";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";
import { ownerClaimRewards, othersClaimRewards } from "../actions/claim-rewards";

const executeOwnerClaimRewards = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const userKeypair = getUserKeypair();
    const mint = TOKENS.WAYRU.REWARD_TOKEN_MINT;
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userKeypair.publicKey);
    const rewardAmount = new BN(convertToTokenAmount(888, DECIMALS));
    const nonce = new BN(Date.now());

    await ownerClaimRewards({
        program,
        adminKeypair,
        userKeypair,
        mint,
        nftMint,
        userNFTTokenAccount,
        rewardAmount,
        nonce
    });
}

const executeOthersClaimRewards = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const userKeypair = getKeypair(WIFI_APP_HOST_USER_SEED); // test with the first malicious user
    const mint = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT;
    const nftMint = TOKENS.WAYRU.HOLY_AMARANTH_FROG_NFT_MINT;
    const rewardAmount = new BN(convertToTokenAmount(500, DECIMALS));
    const nonce = new BN(Date.now());

    await othersClaimRewards({
        program,
        adminKeypair,
        userKeypair,
        mint,
        nftMint,
        rewardAmount,
        nonce
    });
}

executeOthersClaimRewards();