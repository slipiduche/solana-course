import { getAdminKeypair, getUserKeypair } from "../helpers/keypair";
import { MALICIOUS_USER1_PRIVATEKEY, TOKENS } from "../constants";
import { getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { updateNfnode } from "../actions/update-nfnode";
import { PublicKey } from "@solana/web3.js";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";

const executeUpdateInitializedNFNode = async () => {
    const program = await getRewardSystemProgram();
    const userKeypair = getUserKeypair();
    const adminKeypair = getAdminKeypair();
    const newHostKeypair = getWalletFromUnit8Array(MALICIOUS_USER1_PRIVATEKEY);
    const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userKeypair.publicKey);

    // Update NFNode initialized
    await updateNfnode({
        program,
        adminKeypair,
        userKeypair,
        newHostKeypair,
        nftMint,
        userNFTTokenAccount,
        nfnodeEntryPDA
    });
}   

executeUpdateInitializedNFNode();