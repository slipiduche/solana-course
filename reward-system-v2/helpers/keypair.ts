import { Keypair } from "@solana/web3.js";
import { ADMIN_PRIVATE_KEY, USER_PRIVATE_SEED } from "../constants";

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

export const getUserKeypair = () => {
    const userKeypair = getWalletFromUnit8Array(USER_PRIVATE_SEED);
    return userKeypair;
}

export const getWalletFromUnit8Array = (unit: number[]) => {
    return Keypair.fromSecretKey(
        Uint8Array.from(unit)
    );
}