import { PublicKey } from "@solana/web3.js";


export const REWARD_SYSTEM_PROGRAM_ID = process.env.REWARD_SYSTEM_PROGRAM_ID || '49YD9iaXY39zY8tycUg1vJvk6b4cDoVJNrbsmMkk3ihF';

export const ADMIN_PRIVATE_KEY = [116, 231, 89, 203, 47, 173, 66, 118, 221, 149, 82, 192, 140, 54, 199, 231, 104, 189, 38, 107, 84, 16, 45, 212, 101, 137, 69, 35, 68, 37, 81, 181, 47, 209, 215, 202, 131, 226, 39, 218, 195, 89, 197, 74, 13, 125, 77, 20, 80, 19, 147, 72, 189, 30, 133, 79, 154, 108, 137, 0, 20, 84, 77, 72]
export const HOST_PRIVATE_KEY = [2, 158, 14, 251, 126, 198, 100, 48, 32, 199, 71, 90, 22, 100, 101, 42, 73, 216, 183, 141, 58, 158, 13, 239, 141, 0, 174, 76, 139, 250, 65, 171, 189, 63, 141, 40, 56, 56, 191, 155, 230, 159, 25, 252, 153, 174, 88, 127, 26, 110, 61, 165, 180, 152, 138, 231, 70, 50, 157, 246, 11, 35, 231, 21]
export const MANUFACTUR_PRIVATE_KEY = [15, 35, 4, 221, 92, 103, 4, 224, 115, 238, 205, 9, 38, 24, 217, 173, 223, 120, 206, 3, 39, 180, 149, 25, 28, 95, 93, 244, 78, 209, 200, 166, 73, 190, 217, 201, 244, 2, 177, 192, 166, 196, 103, 25, 16, 245, 181, 135, 199, 191, 157, 162, 124, 24, 82, 78, 2, 120, 241, 147, 203, 187, 211, 41]
export const MALICIOUS_USER1_PRIVATEKEY = [184, 108, 219, 227, 208, 168, 252, 212, 249, 182, 170, 78, 153, 148, 252, 54, 150, 132, 53, 81, 117, 57, 56, 160, 66, 29, 250, 113, 11, 110, 99, 45, 143, 203, 126, 29, 118, 134, 113, 167, 20, 148, 238, 228, 90, 99, 251, 229, 88, 59, 68, 2, 120, 23, 239, 252, 245, 218, 26, 214, 132, 117, 245, 30
]
export const MALICIOUS_USER2_PRIVATEKEY = [14, 122, 165, 222, 181, 183, 166, 17, 100, 243, 112, 16, 230, 53, 185, 108, 7, 113, 64, 72, 133, 107, 15, 16, 214, 91, 17, 49, 87, 6, 111, 244, 88, 203, 34, 190, 37, 207, 133, 175, 127, 115, 63, 188, 209, 173, 193, 64, 50, 81, 35, 233, 214, 81, 9, 255, 252, 43, 94, 101, 101, 127, 71, 193]
export const USER_PRIVATE_SEED = [
    100,  39,  88,  23,  45, 136, 145, 153, 122,  37, 196,
     35, 206,  17,  94, 153, 226, 210, 127, 152,  46,  40,
     51,  44, 125, 198, 108,  62, 242, 225,  56,  79,  86,
    134, 227,  61, 240, 127,  35, 108, 107,  84, 114, 119,
    201,   3,  26, 228, 123, 185,  45,  58, 241, 177, 176,
    133, 176, 182, 177, 116, 195, 167, 126, 117
];
export const PROGRAM_DATA_ADDRESS = new PublicKey("8uwRuVjzG7qjGeW5CALUMQ9e16xxNc6vRrAAWN3GPJZK");

export const DECIMALS = 6;
export const TOKENS = {
    WAYRU: {
        MINT: new PublicKey("2tgkAafeaM2dRAQW7ntRvW9sMc2H1KWithT7AreZ1P4o"),
        MINT_TOKEN_ADDRESS: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        OWNER_TOKEN_ACCOUNT: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        STORAGE_ACCOUNT: new PublicKey("9dmEL8L6wEPKRsBVwdMt7yftKSbDGMQeyQAM7YLchUn8"),
        NFT_MINT_ADDRESS: new PublicKey('7oMUkwy58gxzQxsBoSrRDSYQK2rr9mM5tafgQSprFVx'),
        NFT_MINT_ADDRESS_2: new PublicKey('H1MMwTyY9kGz74TGrkugh6whZtSdvfmYtR1G4snSLaFs'),
        MINT_2: new PublicKey("4QwHzu44JzCZgFsJzvBCSNvJ3rMTxMC171yoJms618mD"),
        REWARD_TOKEN_MINT: new PublicKey("5AZRsHiVCQPU8uDh9aKkgmgXz52VmqnYwzhYB6eFum5"),
        MINT_TOKEN_ADDRESS_2: new PublicKey("HBMixppFXpXpvuorGvYymyTmunekVPqjYKNm32qxfGa8"),
        OWNER_TOKEN_ACCOUNT_2: new PublicKey("HBMixppFXpXpvuorGvYymyTmunekVPqjYKNm32qxfGa8")
    }
} as const;

// try to claim 970 tokens

export const OWNER_TOKENS_PRIVATE_SEED = `east notable network digital unaware asset now donate weather noodle filter prize`;