import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const getTokenTransactions = async (
  walletAddress: string,
  assetMint: string,
  limit = 20
): Promise<any[]> => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const address = new PublicKey(walletAddress);
    
    // Get user's Associated Token Account
    const userATA = await getAssociatedTokenAddress(
      new PublicKey(assetMint),
      address,
      false,
      TOKEN_PROGRAM_ID
    );

    // Get all signatures/transactions for the token account
    const signatures = await connection.getSignaturesForAddress(
      userATA,
      { limit }
    );

    // Get detailed transaction info
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        return {
          signature: sig.signature,
          timestamp: sig.blockTime,
          status: tx?.meta?.err ? 'failed' : 'success',
          amount: tx?.meta?.postTokenBalances?.[0]?.uiTokenAmount.uiAmount,
          // You can add more transaction details as needed
        };
      })
    );

    return transactions;
  } catch (error) {
    console.error("Error getting token transactions:", error);
    return [];
  }
};

const execute = async () => {
  const transactions = await getTokenTransactions("3bYbHy76HMLxPDg7FCfp9jWdAN7mvZmarmtV5imZsogh", "4QwHzu44JzCZgFsJzvBCSNvJ3rMTxMC171yoJms618mD");
  console.log(transactions);
};

execute();