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
    const host = getWalletFromUnit8Array(HOST_PRIVATE_KEY);
    const manufacturer = getWalletFromUnit8Array(MANUFACTUR_PRIVATE_KEY);
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;

    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userNftOwner.publicKey);

    // initialize nfnode
    await initializeNfnode({
        program,
        adminKeypair,
        userNftOwner,
        nftMint,
        userNFTTokenAccount,
        nfnodeEntryPDA,
        host,
        manufacturer
    });

    console.log("NFNode initialized successfully!");

}
executeInitializeNfnode();