import { Connection, PublicKey } from "@solana/web3.js";

export const getAccountBalance = async (
    connection: Connection,
    publicKey: PublicKey
): Promise<number> => {
    try {
        const balance = await connection.getBalance(publicKey);
        // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
        return balance / 1_000_000_000;
    } catch (error) {
        console.error("Error getting balance:", error);
        return 0;
    }
}; 

import { 
    getAssociatedTokenAddress, 
    TOKEN_PROGRAM_ID,
    getAccount
} from "@solana/spl-token";

interface   TokenBalanceInfo {
    uiAmount: number | null;
    decimals: number;
    exists: boolean;
    address: string;
}

export const getUserTokenBalance = async (
    connection: Connection,
    userWallet: PublicKey,
    mint: PublicKey
): Promise<TokenBalanceInfo> => {
    try {
        // Get user's Associated Token Account
        const userATA = await getAssociatedTokenAddress(
            mint,
            userWallet,
            false,
            TOKEN_PROGRAM_ID
        );

        // Verify if the account exists
        let exists = false;
        try {
            await getAccount(
                connection,
                userATA,
                'confirmed',
                TOKEN_PROGRAM_ID
            );
            exists = true;
        } catch (e) {
            exists = false;
        }

        // Get balance if account exists
        let uiAmount: number | null = null;
        let decimals = 0;
        
        if (exists) {
            const balance = await connection.getTokenAccountBalance(userATA);
            uiAmount = balance.value.uiAmount;
            decimals = balance.value.decimals;
        }

        return {
            uiAmount,
            decimals,
            exists,
            address: userATA.toString()
        };
    } catch (error) {
        console.error("Error getting token balance:", error);
        return {
            uiAmount: null,
            decimals: 0,
            exists: false,
            address: ''
        };
    }
};