import { initializeNFNode } from "../actions/initialize-nfnode";
import { getDepinStakingAdminKeypair, getUserKeyPair } from "../helpers/keypair";
import { TOKENS } from "../constants";
import { getWalletNftsByToken2022 } from "../helpers/wallet-nft";
import { getDepinStakingProgram } from "../helpers/program";

(async () => {
    const admin = getDepinStakingAdminKeypair();
    const initializer = getUserKeyPair('user1');
    /* const program = await getDepinStakingProgram();
    console.log('User owner NFT public key:', userOwnerNft.publicKey.toString());

    // check the available nfts in the wallet
    const nfts = await getWalletNftsByToken2022({
        walletAddress: userOwnerNft.publicKey,
        connection: program.provider.connection,
    });
    console.log('NFTs:', nfts); */
    await initializeNFNode({
        initializer,
        externalNftMint: TOKENS.NFNODE_2_MINT,
    });
    console.log("NFNode initialized successfully!");
    process.exit(0);
})();