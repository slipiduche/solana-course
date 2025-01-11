import { getAdminKeypair, getUserKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { BN } from "bn.js";
import { TOKENS, DECIMALS, HOST_PRIVATE_KEY } from "../constants";
import { convertToTokenAmount } from "../../reward-system/utils/token";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";
import { ownerClaimRewards, othersClaimRewards } from "../actions/claim-rewards";

const executeOwnerClaimRewards = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const userKeypair = getUserKeypair();
    const mint = TOKENS.WAYRU.MINT;
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userKeypair.publicKey);
    const rewardAmount = new BN(convertToTokenAmount(10, DECIMALS));
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

const executeHostClaimRewards = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const userKeypair = getWalletFromUnit8Array(HOST_PRIVATE_KEY);
    const mint = TOKENS.WAYRU.MINT;
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
    const rewardAmount = new BN(convertToTokenAmount(10, DECIMALS));
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

executeOwnerClaimRewards();