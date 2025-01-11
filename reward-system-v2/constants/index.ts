import { PublicKey } from "@solana/web3.js";


export const REWARD_SYSTEM_PROGRAM_ID = process.env.REWARD_SYSTEM_PROGRAM_ID || '6GW66FFgCc2wqCcLAePSBgUXMawiu6Curob6ASk8b2EN';

export const ADMIN_PRIVATE_KEY = [116, 231, 89, 203, 47, 173, 66, 118, 221, 149, 82, 192, 140, 54, 199, 231, 104, 189, 38, 107, 84, 16, 45, 212, 101, 137, 69, 35, 68, 37, 81, 181, 47, 209, 215, 202, 131, 226, 39, 218, 195, 89, 197, 74, 13, 125, 77, 20, 80, 19, 147, 72, 189, 30, 133, 79, 154, 108, 137, 0, 20, 84, 77, 72]
export const HOST_PRIVATE_KEY = [2, 158, 14, 251, 126, 198, 100, 48, 32, 199, 71, 90, 22, 100, 101, 42, 73, 216, 183, 141, 58, 158, 13, 239, 141, 0, 174, 76, 139, 250, 65, 171, 189, 63, 141, 40, 56, 56, 191, 155, 230, 159, 25, 252, 153, 174, 88, 127, 26, 110, 61, 165, 180, 152, 138, 231, 70, 50, 157, 246, 11, 35, 231, 21]
export const MANUFACTUR_PRIVATE_KEY =  [15,  35,   4, 221,  92, 103, 4, 224, 115, 238, 205, 9, 38, 24, 217, 173, 223, 120, 206, 3, 39, 180, 149, 25, 28, 95, 93, 244, 78, 209, 200, 166, 73, 190, 217, 201, 244, 2, 177, 192, 166, 196, 103, 25, 16, 245, 181, 135, 199, 191, 157, 162, 124, 24, 82, 78, 2, 120, 241, 147, 203, 187, 211, 41]

export const DECIMALS = 6;
export const TOKENS = {
    WAYRU: {
        MINT: new PublicKey("2tgkAafeaM2dRAQW7ntRvW9sMc2H1KWithT7AreZ1P4o"),
        MINT_TOKEN_ADDRESS: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        OWNER_TOKEN_ACCOUNT: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        STORAGE_ACCOUNT: new PublicKey("9dmEL8L6wEPKRsBVwdMt7yftKSbDGMQeyQAM7YLchUn8"),
        NFT_MINT_ADDRESS: new PublicKey('3zki7mKRbSZKGRWym7A2yobNjKxq3yeqXNmWY9eN6QWy')
    }
} as const;

// try to claim 970 tokens
export const USER_PRIVATE_SEED = "slight six grape rabbit casual theory choice toy amazing witness always twenty";
export const OWNER_TOKENS_PRIVATE_SEED = `east notable network digital unaware asset now donate weather noodle filter prize`;