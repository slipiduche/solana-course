import { Keypair } from "@solana/web3.js";

export const createNewWallet = () => {
    const wallet = Keypair.generate();
    console.log("New wallet address:", wallet.publicKey.toString());
    console.log("New wallet secret key:", wallet.secretKey);
    return wallet;
}