import { Connection, LAMPORTS_PER_SOL, clusterApiUrl, VersionedTransactionResponse } from "@solana/web3.js";

const getTxReceiverDetails = async (signature: string) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"));
        let transaction: VersionedTransactionResponse | null = null;
        let attempts = 0;
        const maxAttempts = 15; // 30 seconds total (15 attempts * 2 seconds)

        // try to get the transaction until it is confirmed or the attempts are exhausted
        while (!transaction && attempts < maxAttempts) {
            transaction = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            });

            if (!transaction) {
                attempts++;
                console.log(`Attempt ${attempts}/${maxAttempts} - Transaction not found yet`); // Add logging for debugging
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!transaction) {
            console.log(`Transaction not found after ${maxAttempts} attempts`);
            return {
                error: true,
                message: 'Transaction not found after ' + maxAttempts + ' attempts',
                details: null
            }
        }

        // Get transaction fee
        const transactionFee = transaction.meta?.fee || 0;

        // Get pre and post balances
        const preBalances = transaction.meta?.preBalances || [];
        const postBalances = transaction.meta?.postBalances || [];
        const accountKeys = transaction.transaction.message.getAccountKeys();

        // Track transfers (excluding your wallet)
        const transfers: {
            wallet: string
            change: number
            type: 'received' | 'sent'
        }[] = [];
        for (let i = 0; i < preBalances.length; i++) {
            const wallet = accountKeys.get(i)?.toString();
            const difference = postBalances[i] - preBalances[i];

            // Only include transfers to other wallets (not yours) and if there's a change
            if (difference !== 0) {
                transfers.push({
                    wallet: wallet ?? '',
                    change: difference / LAMPORTS_PER_SOL,
                    type: difference > 0 ? 'received' : 'sent'
                });
            }
        }

        const details = {
            signature,
            transactionFee: transactionFee / LAMPORTS_PER_SOL,
            transfers: transfers,
        } as {
            signature: string
            transactionFee: number
            transfers: {
                wallet: string
                change: number
                type: 'received' | 'sent'
            }[],
        }
        return {
            error: false,
            message: 'Transaction confirmed',
            details
        }
    } catch (error) {
        console.log("Error getting transaction details:", error);
        return {
            error: true,
            message: 'Error getting transaction details',
            details: null
        }
    }
};

getTxReceiverDetails(
    "5Tndon38XgQdrzUpzB7sTEgasc7H6jEjXmW9U4x7hDbNmnQ2xe6uY86NyUdN1cYLmRZW4AHBR7Ey7mofMhetWQNu"
).then((res) =>
    console.log(res?.details)
)