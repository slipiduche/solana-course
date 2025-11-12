import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    VersionedTransactionResponse,
} from "@solana/web3.js";
import { TOKENS } from "../constants";

export const verifySolanaMintPaymentV6 = async () => {
    try {
        const { txHash, userId, nfodeId, walletAddress, discountCode, wayruPrice } =
        {
            txHash:
                "4zkDo494tnKhzRGrJRGeGvKSeKks5uC3CvVXTKV4TdDRUmrThnZjs2YRzgFEiR7rzAQLYFdPcbU8eLNc5135kkMv",
            userId: "123",
            nfodeId: "123",
            walletAddress: "6dKirrtydHtFR2R9TGUiRS7CdZMXWUSjtW4TXJBwysTf",
            discountCode: undefined,
            wayruPrice: 0.01205,
        };
        // expose services to use

        // declare variables
        let cryptoToPay = 0;
        let totalCryptoToPay = 0;

        // get keys from db
        const PRICE_FOR_MINT = 50;
        const WALLET_ADDRESS_ADMIN = "8QMK1JHzjydq7qHgTo1RwK3ateLm4zVQF7V7BkriNkeD";
        const WALLET_ADDRESS_TREASURY_NFN =
            "FCap4kWAPMMTvAqUgEX3oFmMmSzg7g3ytxknYD21hpzm";

        const solPaymentFeeToMint = 0.00611392;
        const AMOUNT_TOLERANCE_PERCENTAGE_FOR_MINT = 0.05; // 5% of the amount

        cryptoToPay = Number(PRICE_FOR_MINT) / Number(wayruPrice);

        // now we need to get total crypto to pay
        totalCryptoToPay = cryptoToPay; //+ Number(SOL_EXTRA_FEE_FOR_MINT)

        // get receiver details with txHash and compare with dropList
        const txInfo = await getTxReceiverDetails(txHash, 1);
        if (!txInfo || txInfo?.error || !txInfo?.details) {
            console.log("tx not found");
            return {
                error: true,
                message: txInfo?.message ?? "tx not found",
                code: txInfo?.code ?? "TX_NOT_FOUND",
            };
        }

        // details of the tx
        const txFromBlockchainDetails = txInfo?.details;
        console.log("txFromBlockchainDetails", txFromBlockchainDetails);

        // now prepare the info of that we supposed happened in the tx
        type WalletName = "admin" | "treasury" | "user";
        const dropList = [
            {
                wallet: WALLET_ADDRESS_ADMIN, // admin wallet receive only the fee for mint
                amount: Number(solPaymentFeeToMint.toFixed(9)),
                walletName: "admin" as WalletName,
            },
            {
                wallet: WALLET_ADDRESS_TREASURY_NFN, // treasury wallet receive only the total crypto to pay
                amount: Number(totalCryptoToPay.toFixed(6)),
                walletName: "treasury" as WalletName,
            },
        ];
        console.log("dropList", dropList);

        // check if the txInfo has the same amount of the dropList
        for (const drop of dropList) {
            const transferType = drop.walletName === "user" ? "sent" : "received";
            const dropWallet = drop.wallet;
            const dropAmount =
                Number(drop.amount) < 0
                    ? Math.abs(Number(drop.amount))
                    : Number(drop.amount);
            const txInfoAmount = txFromBlockchainDetails.transfers.find(
                (transfer) =>
                    stringToUpperCase(transfer.wallet) ===
                    stringToUpperCase(dropWallet) && transfer.type === transferType
            )?.change;

            const txAmount =
                transferType === "sent"
                    ? Math.abs(txInfoAmount ?? 0)
                    : txInfoAmount ?? 0;

            // calculate the tolerance range
            const minAcceptableAmount =
                Number(dropAmount) * (1 - Number(AMOUNT_TOLERANCE_PERCENTAGE_FOR_MINT));
            const maxAcceptableAmount =
                Number(dropAmount) * (1 + Number(AMOUNT_TOLERANCE_PERCENTAGE_FOR_MINT));

            const difference = txAmount - dropAmount;
            const txDetails = {
                expectedAmount: dropAmount,
                receivedAmount: txAmount,
                difference: difference.toFixed(9),
                to: drop.walletName + " wallet",
                wallet: dropWallet,
                type: transferType,
                result:
                    difference === 0
                        ? "correct_payment"
                        : difference > 0
                            ? "excess_payment"
                            : "insufficient_payment",
                percentageDiff:
                    ((Math.abs(difference) / dropAmount) * 100).toFixed(2) + "%",
            };

            console.log("sent's details of mint:", txDetails);
            // check if the txAmount is within the acceptable range
            if (
                !txAmount ||
                txAmount < minAcceptableAmount ||
                txAmount > maxAcceptableAmount
            ) {
                console.log("txAmount is not within the acceptable range");
                // save payment

                return {
                    error: true,
                    message:
                        `Transaction amount error for ${drop.walletName}. ` +
                        `Expected: ${dropAmount} SOL, ` +
                        `Received: ${txAmount} SOL, ` +
                        `Difference: ${difference.toFixed(9)} SOL (${txDetails.percentageDiff
                        })`,
                    code: "TX_AMOUNT_NOT_CORRECT",
                };
            }
        }

        // now we can start the minting process
        return {
            error: false,
            message: "tx verified successfully",
            code: "SUCCESS_PAYMENT",
        };
    } catch (error) {
        console.log("verifySolanaMintPaymentV6", error);
        return {
            error: true,
            message: "error verifying tx",
            code: "ERROR_DURING_VERIFY_PAYMENT",
        };
    }
};

const stringToUpperCase = (str: string) => {
    if (!str || typeof str !== "string") return "";
    return str.toUpperCase();
};

const getTxReceiverDetails = async (signature: string, maxAttempt?: number) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"));
        const rewardTokenMint = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT.toString();
        let transaction: null | VersionedTransactionResponse = null;
        let attempts = 0;
        const maxAttempts = maxAttempt ?? 1; // 30 seconds total (15 attempts * 2 seconds)

        // try to get the transaction until it is confirmed or the attempts are exhausted
        while (!transaction && attempts < maxAttempts) {
            transaction = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: "confirmed",
            });

            if (!transaction) {
                attempts++;
                console.log(
                    `Attempt ${attempts}/${maxAttempts} - Transaction not found yet`
                ); // Add logging for debugging
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        if (!transaction) {
            console.log(`Transaction not found after ${maxAttempts} attempts`);
            return {
                error: true,
                message: "Transaction not found after " + maxAttempts + " attempts",
                code: "TX_NOT_FOUND",
                details: null,
            };
        }

        // Get transaction fee
        console.log("transaction", transaction?.meta);
        const transactionFee = transaction.meta?.fee || 0;

        // Get pre and post balances
        const preBalances = transaction.meta?.preBalances || [];
        const postBalances = transaction.meta?.postBalances || [];
        const preTokenBalances = transaction.meta?.preTokenBalances || [];
        const postTokenBalances = transaction.meta?.postTokenBalances || [];
        const accountKeys = transaction.transaction.message.getAccountKeys();

        // Track transfers (excluding your wallet)
        const transfers: {
            wallet: string;
            change: number;
            type: "received" | "sent";
        }[] = [];

        // Procesar transferencias de SOL (mantener lógica existente)
        for (let i = 0; i < preBalances.length; i++) {
            const wallet = accountKeys.get(i)?.toString();
            const difference = postBalances[i] - preBalances[i];

            if (difference !== 0) {
                transfers.push({
                    wallet: wallet as string,
                    change: difference / LAMPORTS_PER_SOL,
                    type: difference > 0 ? 'received' : 'sent',
                });
            }
        }

        // Procesar transferencias de tokens Wayru por separado
        // Buscar TODAS las cuentas de tokens Wayru en la transacción
        const wayruTokenAccounts = new Set<string>();

        // Agregar todas las cuentas que tienen tokens Wayru
        preTokenBalances.forEach(balance => {
            if (balance.mint === rewardTokenMint) {
                wayruTokenAccounts.add(balance.owner as string);
            }
        });
        postTokenBalances.forEach(balance => {
            if (balance.mint === rewardTokenMint) {
                wayruTokenAccounts.add(balance.owner as string);
            }
        });

        // Procesar cada cuenta de tokens Wayru
        wayruTokenAccounts.forEach(owner => {
            const preBalance = preTokenBalances.find(
                balance => balance.owner === owner && balance.mint === rewardTokenMint
            );
            const postBalance = postTokenBalances.find(
                balance => balance.owner === owner && balance.mint === rewardTokenMint
            );

            const preAmount = preBalance?.uiTokenAmount.uiAmount || 0;
            const postAmount = postBalance?.uiTokenAmount.uiAmount || 0;
            const tokenChange = postAmount - preAmount;

            if (tokenChange !== 0) {
                console.log('Wayru Token Transfer:');
                console.log('Owner:', owner);
                console.log('Pre amount:', preAmount);
                console.log('Post amount:', postAmount);
                console.log('Change:', tokenChange);

                transfers.push({
                    wallet: owner,
                    change: tokenChange,
                    type: tokenChange > 0 ? 'received' : 'sent',
                });
            }
        });

        const details = {
            signature,
            transactionFee: transactionFee / LAMPORTS_PER_SOL,
            transfers: transfers,
        } as {
            signature: string;
            transactionFee: number;
            transfers: {
                wallet: string;
                change: number;
                type: "received" | "sent";
            }[];
        };
        return {
            error: false,
            message: "Transaction confirmed",
            code: "TX_CONFIRMED",
            details,
        };
    } catch (error) {
        console.log("Error getting transaction details:", error);
        return {
            error: true,
            message: "Error getting transaction details",
            code: "TX_NOT_FOUND",
            details: null,
        };
    }
};
