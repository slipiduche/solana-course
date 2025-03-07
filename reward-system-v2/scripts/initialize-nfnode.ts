import { PublicKey } from "@solana/web3.js";
import { getAdminKeypair, getUserKeypair, getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { TOKENS, HOST_PRIVATE_KEY, MANUFACTUR_PRIVATE_KEY } from "../constants";
import { initializeNfnode } from "../actions/initialize-nfnode";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";

const executeInitializeNfnode = async () => {
    const program = await getRewardSystemProgram();
    const adminKeypair = getAdminKeypair();
    const userNftOwner = getUserKeypair();
    console.log("User keypair =>", userNftOwner.publicKey.toString());
    const host = getWalletFromUnit8Array(HOST_PRIVATE_KEY);
    const manufacturer = getWalletFromUnit8Array(MANUFACTUR_PRIVATE_KEY);
    const nftMint = new PublicKey("Stn6orSLCvXvxnG6DdJNCARJDBW9UPim7fvUH7aCC7R");

    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userNftOwner.publicKey);
    // get seed of the token's owner
    console.log("User NFT Token Account =>", userNFTTokenAccount.toString());

    // initialize nfnode
    await initializeNfnode({
        program,
        adminKeypair,
        userNftOwner,
        nftMint,
        userNFTTokenAccount,
        nfnodeEntryPDA,
        host,
        manufacturer,
        nfnodeType: { wayruHotspot: {} }
    });

    console.log("NFNode initialized successfully!");

}

const getRewardEntry = async () => {   
    const nftMint = new PublicKey("AgYKzhcPC9q9jWkS6rBxvzZvv71bKGRCJKiy8eghdsoX");
    const userNftOwner = getUserKeypair();
  
    const program = await getRewardSystemProgram();
    const [rewardEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("reward_entry"), userNftOwner.publicKey.toBuffer(), nftMint.toBuffer()],
        program.programId
    );
    const state = await program.account.rewardEntry.fetch(
        rewardEntryPDA
    );
    console.log("rewardEntryPDA State =>", {
        lastClaimedNonce: state.lastClaimedNonce.toString(),
        lastClaimedTimestamp: new Date(state.lastClaimedTimestamp * 1000).toISOString(),
        totalRewardsEarned: state.totalRewardsEarned.toString()
    });
}

const getNFNodeEntry = async () => {   
    const nftMint = new PublicKey("AgYKzhcPC9q9jWkS6rBxvzZvv71bKGRCJKiy8eghdsoX");
    const program = await getRewardSystemProgram();
    
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    
    const state = await program.account.nfNodeEntry.fetch(
        nfnodeEntryPDA
    );
    
    console.log("NFNode Entry State =>", {
        ownerLastClaimedTimestamp: new Date(state.ownerLastClaimedTimestamp * 1000).toISOString(),
        host: state.host.toString(),
        hostShare: state.hostShare.toString(),
        hostLastClaimedTimestamp: new Date(state.hostLastClaimedTimestamp * 1000).toISOString(),
        manufacturer: state.manufacturer.toString(),
        manufacturerLastClaimedTimestamp: new Date(state.manufacturerLastClaimedTimestamp * 1000).toISOString(),
        totalRewardsClaimed: state.totalRewardsClaimed.toString(),
        depositAmount: state.depositAmount.toString(),
        depositTimestamp: new Date(state.depositTimestamp * 1000).toISOString(),
        nfnodeType: state.nfnodeType
    });
}

Promise.all([getRewardEntry(), getNFNodeEntry()]).catch(console.error);