import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

export const createNewWallet = () => {
    // Generar nueva frase semilla
    const mnemonic = bip39.generateMnemonic();
    
    // Derivar el seed desde el mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Derivar el keypair usando el path de Solana
    const derivedPath = "m/44'/501'/0'/0'";
    const derivedSeed = derivePath(derivedPath, seed.toString('hex')).key;
    
    // Crear el keypair desde el seed derivado
    const wallet = Keypair.fromSeed(derivedSeed);
    
    console.log("Mnemonic (seed phrase):", mnemonic);
    console.log("New wallet address for testig in solana course:", wallet.publicKey.toString());
    
    return { wallet, mnemonic };
    
}