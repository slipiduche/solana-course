import { PublicKey } from "@solana/web3.js";


export const REWARD_SYSTEM_PROGRAM_ID = process.env.REWARD_SYSTEM_PROGRAM_ID || '6GW66FFgCc2wqCcLAePSBgUXMawiu6Curob6ASk8b2EN';

export const ADMIN_PRIVATE_KEY = [116,231,89,203,47,173,66,118,221,149,82,192,140,54,199,231,104,189,38,107,84,16,45,212,101,137,69,35,68,37,81,181,47,209,215,202,131,226,39,218,195,89,197,74,13,125,77,20,80,19,147,72,189,30,133,79,154,108,137,0,20,84,77,72]
export const DECIMALS = 6;

export const TOKENS = {
    WAYRU: {
        MINT: 'WAYRU',
        MINT_TOKEN_ADDRESS: '',
        OWNER_TOKEN_ACCOUNT: '',
        STORAGE_ACCOUNT: '',
    }
} as const;

// try to claim 970 tokens
export const USER_PRIVATE_SEED = "slight six grape rabbit casual theory choice toy amazing witness always twenty";
export const OWNER_TOKENS_PRIVATE_SEED = ``;
