import { Keypair } from "@solana/web3.js";
import { ADMIN_PRIVATE_KEY, NEW_ADMIN_PRIVATE_KEY, USER_PRIVATE_KEYS } from "../constants";
import * as bip39 from 'bip39'
import { HDKey } from 'micro-ed25519-hdkey'


export const getDepinStakingAdminKeypair = (admin: 'new' | 'old' = 'old') => {
    if (admin === 'old' && !ADMIN_PRIVATE_KEY) {
        throw new Error(`ADMIN_PRIVATE_KEY not found in environment`);
    }

    if (admin === 'new' && !NEW_ADMIN_PRIVATE_KEY) {
        throw new Error(`NEW_PRIVATE_KEY not found in environment`);
    }

    try {
        return Keypair.fromSecretKey(
            Uint8Array.from(admin === 'old' ? ADMIN_PRIVATE_KEY : NEW_ADMIN_PRIVATE_KEY)
        );
    } catch (e) {
        console.error(`Error creating ${admin} admin keypair:`, e);
        throw e;
    }
}


type User = keyof typeof USER_PRIVATE_KEYS
export const getUserKeyPair = (user: User): Keypair => {
    try {
        if (user === 'userOwnerNft') {
            return getKeypairFromMnemonic(USER_PRIVATE_KEYS.userOwnerNft);
        }
        return Keypair.fromSecretKey(
            Uint8Array.from(USER_PRIVATE_KEYS[user])
        );
    } catch (e) {
        console.error(`Error creating ${user} user keypair:`, e);
        throw e;
    }
}

export const getKeypairFromMnemonic = (
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