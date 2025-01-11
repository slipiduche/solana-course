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