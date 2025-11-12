import { PublicKey } from "@solana/web3.js";


export const REWARD_SYSTEM_PROGRAM_ID = process.env.REWARD_SYSTEM_PROGRAM_ID || 'DGkrN8CiTvRSZbqa7rZjKJ5SHEmMm9Q7JMDjKubidhtV';
export const REWARD_SYSTEM_PROGRAM_ID_V2 = process.env.REWARD_SYSTEM_PROGRAM_ID_V2 || 'Ey6f9uyT1s3UrCGpc586aeHmEupYdfR2xo8Nh7TpqLhX';

export const REWARD_SYSTEM_PROGRAM_ID_MAINNET = process.env.REWARD_SYSTEM_PROGRAM_ID_MAINNET || 'EBovcnX1UXsxPuyMd5yUA1Xc1Ld89wEVFCMJVpS16T4A';

export const AIRDROP_PROGRAM_ID = process.env.AIRDROP_PROGRAM_ID || '5KK2ThgEp1AZM8bo79ijJcumSqz9B48bszyhYhuw3K7o';

export const STAKING_PROGRAM_ID = process.env.STAKING_PROGRAM_ID || '44op5JkWQ4KjXNphN5jWxFssvz6iAXYKJZnVZgPLXUXq';

export const ADMIN_PRIVATE_KEY = [177, 109, 186, 184, 20, 171, 51, 93, 193, 111, 214, 24, 250, 113, 146, 89, 231, 9, 224, 90, 138, 119, 87, 228, 181, 209, 128, 161, 183, 66, 12, 58, 132, 255, 195, 67, 94, 86, 207, 79, 39, 181, 4, 62, 238, 109, 163, 67, 230, 188, 254, 49, 33, 220, 193, 163, 37, 13, 237, 64, 30, 202, 72, 210]

export const HOST_PRIVATE_KEY = [2, 158, 14, 251, 126, 198, 100, 48, 32, 199, 71, 90, 22, 100, 101, 42, 73, 216, 183, 141, 58, 158, 13, 239, 141, 0, 174, 76, 139, 250, 65, 171, 189, 63, 141, 40, 56, 56, 191, 155, 230, 159, 25, 252, 153, 174, 88, 127, 26, 110, 61, 165, 180, 152, 138, 231, 70, 50, 157, 246, 11, 35, 231, 21]

export const MANUFACTUR_PRIVATE_KEY = [15, 35, 4, 221, 92, 103, 4, 224, 115, 238, 205, 9, 38, 24, 217, 173, 223, 120, 206, 3, 39, 180, 149, 25, 28, 95, 93, 244, 78, 209, 200, 166, 73, 190, 217, 201, 244, 2, 177, 192, 166, 196, 103, 25, 16, 245, 181, 135, 199, 191, 157, 162, 124, 24, 82, 78, 2, 120, 241, 147, 203, 187, 211, 41]
export const MALICIOUS_USER1_PRIVATEKEY = [184, 108, 219, 227, 208, 168, 252, 212, 249, 182, 170, 78, 153, 148, 252, 54, 150, 132, 53, 81, 117, 57, 56, 160, 66, 29, 250, 113, 11, 110, 99, 45, 143, 203, 126, 29, 118, 134, 113, 167, 20, 148, 238, 228, 90, 99, 251, 229, 88, 59, 68, 2, 120, 23, 239, 252, 245, 218, 26, 214, 132, 117, 245, 30
]
export const MALICIOUS_USER2_PRIVATEKEY = [14, 122, 165, 222, 181, 183, 166, 17, 100, 243, 112, 16, 230, 53, 185, 108, 7, 113, 64, 72, 133, 107, 15, 16, 214, 91, 17, 49, 87, 6, 111, 244, 88, 203, 34, 190, 37, 207, 133, 175, 127, 115, 63, 188, 209, 173, 193, 64, 50, 81, 35, 233, 214, 81, 9, 255, 252, 43, 94, 101, 101, 127, 71, 193]
export const USER_PRIVATE_SEED = 'pilot rebel census betray lock predict hub double giraffe purity upon zone'
export const NETWORK_APP_USER_SEED = 'speak square trophy slush crouch secret soldier tattoo year ranch kitchen fish'
export const USER_TEST_TO_INITIALIZE_NFNODE = 'daughter unable shed early dignity elbow warfare mechanic security panic beauty caution'
export const PROGRAM_DATA_ADDRESS = new PublicKey("8uwRuVjzG7qjGeW5CALUMQ9e16xxNc6vRrAAWN3GPJZK");

export const WIFI_APP_USER_SEED = "feature culture loop engine assume flame frog flee mountain suggest police lobster"

export const DECIMALS = 6;
export const TOKENS = {
    WAYRU: {
        MINT: new PublicKey("2tgkAafeaM2dRAQW7ntRvW9sMc2H1KWithT7AreZ1P4o"),
        MINT_TOKEN_ADDRESS: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        OWNER_TOKEN_ACCOUNT: new PublicKey("3EXqEFFwgoVTGeDXqAGofxkXm6VcGWbvJENAYVK1bjZu"),
        STORAGE_ACCOUNT: new PublicKey("9dmEL8L6wEPKRsBVwdMt7yftKSbDGMQeyQAM7YLchUn8"),
        NFT_MINT_ADDRESS: new PublicKey('Bivd9Tuti4SfwckEDegHjVGC6zBwaik23twFTyeSPMfs'),
        NFT_MINT_ADDRESS_2: new PublicKey('6zk5rCGdP9He6NBc3U98e5WzBnF4J7FxTse5axqakuBF'),
        MINT_2: new PublicKey("4QwHzu44JzCZgFsJzvBCSNvJ3rMTxMC171yoJms618mD"),
        REWARD_TOKEN_MINT: new PublicKey("5AZRsHiVCQPU8uDh9aKkgmgXz52VmqnYwzhYB6eFum5"),
        MINT_TOKEN_ADDRESS_2: new PublicKey("HBMixppFXpXpvuorGvYymyTmunekVPqjYKNm32qxfGa8"),
        OWNER_TOKEN_ACCOUNT_2: new PublicKey("HBMixppFXpXpvuorGvYymyTmunekVPqjYKNm32qxfGa8"),
        T_WAYRU_TOKEN_MINT: new PublicKey("CyVfcAhqHoY28roieSxAx9B4RCcGEDnVrxbwoc3oH7wa"),
        HOLY_AMARANTH_FROG_NFT_MINT: new PublicKey("6Jdc3YSxkVhkm8FRXeY1h34bbqzhGyUjvSDEpH9S1RSa"),
    }
} as const;

// try to claim 970 tokens

export const OWNER_TOKENS_PRIVATE_SEED = `east notable network digital unaware asset now donate weather noodle filter prize`;

export const WIFI_APP_HOST_USER_SEED = 'sound moral impose doctor across disorder skirt category exchange dragon evolve swim'
