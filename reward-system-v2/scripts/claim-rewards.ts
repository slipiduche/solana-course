import { getAdminKeypair, getUserKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { BN } from "bn.js";
import { TOKENS, DECIMALS, MANUFACTUR_PRIVATE_KEY, HOST_PRIVATE_KEY } from "../constants";
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
    const userKeypair = getWalletFromUnit8Array(MANUFACTUR_PRIVATE_KEY); // test with the first malicious user
    const mint = TOKENS.WAYRU.REWARD_TOKEN_MINT;
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
    const rewardAmount = new BN(convertToTokenAmount(455, DECIMALS));
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