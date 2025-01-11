import { PublicKey } from "@solana/web3.js";


export const REWARD_SYSTEM_PROGRAM_ID = process.env.REWARD_SYSTEM_PROGRAM_ID || '6krd1VXdtv13VzsgmbwN3pgpqgkWKApYzwEawRGsEuUk';

export const ADMIN_PRIVATE_KEY = [253, 120, 196, 44, 220, 59, 204, 166, 148, 159, 88, 220, 224, 116, 153, 235, 140, 184, 224, 78, 52, 255, 162, 6, 121, 225, 234, 132, 153, 118, 137, 136, 118, 231, 42, 217, 89, 3, 52, 249, 57, 188, 26, 193, 52, 153, 179, 239, 110, 22, 48, 16, 200, 234, 44, 120, 229, 176, 60, 212, 233, 225, 220, 171];
export const DECIMALS = 6;

export const TOKENS = {
    WAYRU: {
        MINT: new PublicKey("FNUHqRH135spCgN2yVorm64Sbaowj2KS7CPrU3zfmVF9"),
        MINT_TOKEN_ADDRESS: new PublicKey("3fGvK37RSHqVpJhAnDPNb2qTBbPwYMG7xeUYc8po7YDV"),
        OWNER_TOKEN_ACCOUNT: new PublicKey("3fGvK37RSHqVpJhAnDPNb2qTBbPwYMG7xeUYc8po7YDV"),
        STORAGE_ACCOUNT: new PublicKey("9dmEL8L6wEPKRsBVwdMt7yftKSbDGMQeyQAM7YLchUn8"),
    }
} as const;

// try to claim 970 tokens
export const CLAIM_AMOUNT = 97000000;
export const USER_PRIVATE_SEED = "congress apple once name trust cushion enact mule cup wave toss engage";
export const OWNER_TOKENS_PRIVATE_SEED = `east
 notable
 network
 digital
 unaware
 asset
 now
 donate
 weather
 noodle
 filter
 prize`;
