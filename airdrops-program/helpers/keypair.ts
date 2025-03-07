import { Keypair } from "@solana/web3.js";
import { ADMIN_PRIVATE_KEY, USER_PRIVATE_KEY, } from "../constants";
import * as bip39 from 'bip39'
import { HDKey } from 'micro-ed25519-hdkey'
import { MALICIOUS_USER1_PRIVATEKEY } from "../../reward-system-v2/constants";

export const getAdminKeypair = () => {
    if (!ADMIN_PRIVATE_KEY) {
        throw new Error(`ADMIN_PRIVATE_KEY not found in environment`);
    }
    
    try {
        return Keypair.fromSecretKey(
            Uint8Array.from(ADMIN_PRIVATE_KEY)
        );
    } catch (e) {
        console.error(`Error creating admin keypair:`, e);
        throw e;
    }
}

export const getWalletFromUnit8Array = (unit: number[]) => {
    return Keypair.fromSecretKey(
        Uint8Array.from(unit)
    );
}

export const getKeypair = (
    mnemonic: string,
    path_index = 0,
) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic ?? '')
    const hd = HDKey.fromMasterSeed(seed.toString('hex'))
    const path = `m/44'/501'/${path_index}'/0'`
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey)
    return {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey,
        _keypair: keypair,
    } as unknown as Keypair
}

export const getTokenOwnerKeypair = () => {
    return getWalletFromUnit8Array(MALICIOUS_USER1_PRIVATEKEY);
}

export const getUserKeypair = () => {
    return getKeypair(
        USER_PRIVATE_KEY
    );
}