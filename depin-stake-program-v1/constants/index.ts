import { PublicKey } from "@solana/web3.js";

// you can confirm the program id in depin-stake-program-v1/types/depin_stake.ts
export const DEPIN_STAKING_PROGRAM_ID = 'ECcNAeDo6TbYpr1bY2e1uybkiNEuRSbxRbqad4r1azK8';
export const ADMIN_PRIVATE_KEY = (process.env
    .ADMIN_PRIVATE_KEY as unknown as number[]) || [
        19, 230, 119, 65, 149, 33, 72, 209, 116, 183, 186, 150, 10, 218, 176, 64, 213,
        199, 244, 38, 97, 59, 51, 53, 71, 156, 251, 14, 123, 205, 67, 72, 216, 211,
        10, 106, 141, 12, 128, 148, 243, 100, 217, 16, 183, 102, 130, 206, 99, 13,
        178, 92, 234, 67, 204, 175, 45, 90, 183, 126, 153, 223, 234, 67,
    ];

export const NEW_ADMIN_PRIVATE_KEY = [12, 236, 197, 246, 86, 25, 152, 39, 227, 27, 221, 137, 7, 206, 182, 71, 32, 249, 240, 144, 151, 69, 249, 106, 245, 61, 221, 70, 88, 213, 128, 194, 151, 253, 8, 250, 192, 241, 172, 249, 52, 5, 78, 173, 71, 90, 185, 63, 119, 109, 0, 136, 143, 191, 200, 110, 151, 147, 140, 73, 45, 102, 150, 48]

export const USER_1_PRIVATE_KEY = [8, 39, 226, 90, 6, 103, 205, 189, 53, 180, 234, 69, 249, 250, 237, 106, 76, 175, 155, 25, 240, 164, 205, 2, 201, 132, 106, 151, 111, 246, 116, 207, 91, 152, 130, 23, 177, 156, 131, 228, 226, 138, 17, 47, 207, 130, 10, 36, 188, 213, 249, 83, 119, 7, 62, 146, 163, 170, 121, 190, 26, 59, 48, 64]

export const USER_2_PRIVATE_KEY = [150, 245, 79, 239, 37, 244, 81, 146, 157, 211, 202, 128, 129, 210, 81, 207, 62, 231, 235, 162, 102, 248, 9, 236, 164, 26, 53, 126, 155, 221, 255, 254, 254, 242, 64, 134, 78, 205, 184, 48, 175, 152, 131, 114, 81, 102, 102, 112, 228, 50, 208, 91, 9, 132, 82, 247, 48, 61, 201, 81, 38, 150, 76, 20]

export const USER_3_PRIVATE_KEY = [19, 230, 119, 65, 149, 33, 72, 209, 116, 183, 186, 150, 10, 218, 176, 64, 213, 199, 244, 38, 97, 59, 51, 53, 71, 156, 251, 14, 123, 205, 67, 72, 216, 211, 10, 106, 141, 12, 128, 148, 243, 100, 217, 16, 183, 102, 130, 206, 99, 13, 178, 92, 234, 67, 204, 175, 45, 90, 183, 126, 153, 223, 234, 67]


export const USER_OWNER_NFT_KEY = 'speak square trophy slush crouch secret soldier tattoo year ranch kitchen fish'


export const USER_PRIVATE_KEYS = {
    user1: USER_1_PRIVATE_KEY,
    user2: USER_2_PRIVATE_KEY,
    user3: USER_3_PRIVATE_KEY,
    userOwnerNft: USER_OWNER_NFT_KEY,
}

export const TOKENS = {
    T_WAYRU_TOKEN_MINT: new PublicKey(
        "CyVfcAhqHoY28roieSxAx9B4RCcGEDnVrxbwoc3oH7wa"
    ),
    T_WAYRU_MINT_AUTHORITY: new PublicKey(
        "AgKGhdkfjwYSzH6wLSyuCbcxTAyzQX81qc42QYvxmTk9"
    ),
    NFNODE_1_MINT: new PublicKey(
        "2czgb5opBsyNesoYSBfUhrpe3BRN2BipkPBWr21QCR88"
    ),
    NFNODE_2_MINT: new PublicKey(
        "5dp9GMk53YA7QiybzkM2pHZCxD3MeQuU6K1wV3zrPgbP"
    ),
    NFNODE_3_MINT: new PublicKey(
        "7S4vts6AuetDkjaSkZdooPvRUHiA8nSWjHiitb2WU2TD"
    ),
    NFNODE_4_MINT: new PublicKey(
        "Eo4ADeYfZHQfxGkviYZt1s3xqudsfJ7tCZochh2qBNkZ"
    ),
    NFNODE_5_MINT: new PublicKey(
        "57XCUopzkdvQKMEEvmwtherSJkcs7C3JrX8VWmFrTvUV"
    ),
    // visit this url for having more NFT for testing: https://solscan.io/account/6dKirrtydHtFR2R9TGUiRS7CdZMXWUSjtW4TXJBwysTf?cluster=devnet#portfolio
} as const;
