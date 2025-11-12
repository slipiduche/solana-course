import { getAdminKeypair, getKeypair, getUserKeypair } from "../helpers/keypair";
import { MANUFACTUR_PRIVATE_KEY, MALICIOUS_USER1_PRIVATEKEY, WIFI_APP_HOST_USER_SEED } from "../constants";
import { getWalletFromUnit8Array } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { updateNfnode } from "../actions/update-nfnode";
import { PublicKey } from "@solana/web3.js";
import { getUserNFTTokenAccount } from "../helpers/get-token-account";

const executeUpdateInitializedNFNode = async () => {
    const program = await getRewardSystemProgram();
    const userKeypair = getUserKeypair();
    console.log("userKeypair", userKeypair.publicKey.toString());
    const adminKeypair = getAdminKeypair();
    const newHostKeypair = getKeypair(WIFI_APP_HOST_USER_SEED);
    console.log("newHost address", newHostKeypair.publicKey.toString());
    const nftMint = new PublicKey('6Jdc3YSxkVhkm8FRXeY1h34bbqzhGyUjvSDEpH9S1RSa');
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    const userNFTTokenAccount = await getUserNFTTokenAccount(nftMint, userKeypair.publicKey);
    const treasuryWalletAddress = 'FCap4kWAPMMTvAqUgEX3oFmMmSzg7g3ytxknYD21hpzm';
    const adminWalletAddress = '8QMK1JHzjydq7qHgTo1RwK3ateLm4zVQF7V7BkriNkeD';
    const feeToUpdateMetadata = 0.02;
    const paymentToAddHostToSystem = 0.05;

    // Update NFNode initialized
    await updateNfnode({
        program,
        adminKeypair,
        userKeypair,
        newHostPublicKey: newHostKeypair.publicKey,
        nftMint,
        userNFTTokenAccount,
        nfnodeEntryPDA,
        treasuryWalletAddress,
        adminWalletAddress,
        feeToUpdateMetadata,
        paymentToAddHostToSystem
    });
}   

executeUpdateInitializedNFNode();