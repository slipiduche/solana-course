import { PublicKey } from "@solana/web3.js";
import { getAdminKeypair, getUserKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram, getStakingProgram } from "../helpers/program";
import { TOKENS, HOST_PRIVATE_KEY, MANUFACTUR_PRIVATE_KEY } from "../constants";
import { initializationNFNodeStaking, initializeNfnode } from "../actions/initialize-nfnode";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";
const USER_NFT_MINT = "D5PLQFVu5mtPV9z9Dmv7KnZ7MXCaA8voXJLMSdAFH8MA"

const executeInitializeNfnode = async () => {
    //const program = await getRewardSystemProgram();
    const program = await getStakingProgram();
    const adminKeypair = getAdminKeypair();
    const userNftOwner = getUserKeypair();
    console.log("User keypair =>", userNftOwner.publicKey.toString());
    const host = getWalletFromUnit8Array(HOST_PRIVATE_KEY);
    const manufacturer = getWalletFromUnit8Array(MANUFACTUR_PRIVATE_KEY);
    const nftMint = new PublicKey(USER_NFT_MINT);

    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userNftOwner.publicKey);
    // get seed of the token's owner
    console.log("User NFT Token Account =>", userNFTTokenAccount.toString());

    // initialize nfnode
    /* await initializeNfnode({
         program,
         adminKeypair,
         userNftOwner,
         nftMint,
         userNFTTokenAccount,
         nfnodeEntryPDA,
         host,
         manufacturer,
         nfnodeType: { wayruHotspot: {} }
     });*/

    await initializationNFNodeStaking({
        program,
        adminKeypair,
        userNftOwner,
        nftMint,
        userNFTTokenAccount,
        nfnodeEntryPDA,
        host,
        manufacturer,
    });

    console.log("NFNode initialized successfully!");

}

executeInitializeNfnode();