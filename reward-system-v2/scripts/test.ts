import {
    Connection,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    VersionedTransactionResponse,
    PublicKey,
} from "@solana/web3.js";
import { getUserKeypair } from "../helpers/keypair";
import {
    getBoostStakeProgram,
    getRewardSystemProgram,
    getStakingProgram,
} from "../helpers/program";
import { getAirdropProgram } from "../helpers/program";
import {
    AccountLayout,
    getAssociatedTokenAddress,
    RawAccount,
} from "@solana/spl-token";
import moment from "moment";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKENS } from "../constants";
import { verifySolanaMintPaymentV6 } from "./verify-solana-payment";
import { BN } from "@coral-xyz/anchor";

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
                details: null,
            };
        }

        // Get transaction fee
        const transactionFee = transaction.meta?.fee || 0;

        // Get pre and post balances
        const preBalances = transaction.meta?.preBalances || [];
        const postBalances = transaction.meta?.postBalances || [];
        const accountKeys = transaction.transaction.message.getAccountKeys();

        // Track transfers (excluding your wallet)
        const transfers: {
            wallet: string;
            change: number;
            type: "received" | "sent";
        }[] = [];
        for (let i = 0; i < preBalances.length; i++) {
            const wallet = accountKeys.get(i)?.toString();
            const difference = postBalances[i] - preBalances[i];

            // Only include transfers to other wallets (not yours) and if there's a change
            if (difference !== 0) {
                transfers.push({
                    wallet: wallet ?? "",
                    change: difference / LAMPORTS_PER_SOL,
                    type: difference > 0 ? "received" : "sent",
                });
            }
        }

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
            details,
        };
    } catch (error) {
        console.log("Error getting transaction details:", error);
        return {
            error: true,
            message: "Error getting transaction details",
            details: null,
        };
    }
};

const getRewardEntry = async () => {
    const nftMint = new PublicKey("4BXkdcSVLo1qP74h3LFzDxzQQ2VbtLuwpptzsh3QB6Yc");
    const userNftOwner = getUserKeypair();
    console.log("User NFT Owner =>", userNftOwner.publicKey.toString());

    const program = await getRewardSystemProgram();
    const [rewardEntryPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("reward_entry"),
            userNftOwner.publicKey.toBuffer(),
            nftMint.toBuffer(),
        ],
        program.programId
    );
    const state = await program.account.rewardEntry.fetch(rewardEntryPDA);
    console.log("rewardEntryPDA State =>", {
        lastClaimedNonce: state.lastClaimedNonce.toString(),
        lastClaimedTimestamp: new Date(
            state.lastClaimedTimestamp * 1000
        ).toISOString(),
        totalRewardsEarned: state.totalRewardsEarned.toString(),
    });
};

const getNFNodeEntry = async (nftMintProps: string) => {
    try {
        const nftMintAddress = new PublicKey(nftMintProps);
        //const program = await getRewardSystemProgram();
        const program = await getRewardSystemProgram();

        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), nftMintAddress.toBuffer()],
            program.programId
        );

        const nfNodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
        if (!nfNodeEntry) {
            return undefined;
        }
        console.log("NFNode Entry =>", nfNodeEntry);

        // sleep 5 seconds
        await sleep(5000);

        // Get token account of the NFT
        const largestAccounts =
            await program.provider.connection.getTokenLargestAccounts(nftMintAddress);
        console.log("Largest Accounts =>", largestAccounts);

        // sleep 5 seconds
        await sleep(5000);

        const largestAccountInfo = await program.provider.connection.getAccountInfo(
            largestAccounts.value[0].address
        );
        console.log("Largest Account Info =>", largestAccountInfo);

        // Deserialize token account to get the owner
        let tokenAccountData: RawAccount | undefined = undefined;
        if (largestAccountInfo) {
            tokenAccountData = AccountLayout.decode(largestAccountInfo?.data);
        }
        console.log("Token Account Data =>", tokenAccountData);
        const ownerAddress = new PublicKey(tokenAccountData?.owner ?? "");
        console.log("Owner Address =>", ownerAddress);

        const formattedEntry = {
            ...formatNFNodeEntry(nfNodeEntry),
            ownerDetails: {
                ...formatNFNodeEntry(nfNodeEntry).ownerDetails,
                address: ownerAddress.toString(),
            },
        };

        return formattedEntry;
    } catch (error) {
        console.error("Error getting nfnode entry", error);
        return null;
    }
};

function formatNFNodeEntry(entry: any): any {
    // Utility function to format WAYRU tokens from lamports
    const formatWayruTokens = (amount: number) => amount / 1_000_000; // 6 decimals

    return {
        ownerDetails: {
            lastClaimedTimestamp: entry.ownerLastClaimedTimestamp.toNumber(),
            address: "", // it will be filled later
        },
        hostDetails: {
            address: entry.host.toString(),
            profitPercentage: entry.hostShare.toNumber(),
            lastClaimedTimestamp: entry.hostLastClaimedTimestamp.toNumber(),
        },
        manufacturerDetails: {
            address: entry.manufacturer.toString(),
            lastClaimedTimestamp: entry.manufacturerLastClaimedTimestamp.toNumber(),
        },
        nfnodeDetails: {
            type: entry.nfnodeType,
            depositAmount: formatWayruTokens(entry.depositAmount.toNumber()),
            depositUnixTimestamp: entry.depositTimestamp.toNumber(),
            totalRewardsClaimed: formatWayruTokens(
                entry.totalRewardsClaimed.toNumber()
            ),
        },
    };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRewardProgramEntry = async () => {
    const program = await getRewardSystemProgram();
    const state = await program.account.adminAccount.fetch(program.programId);
    console.log("Admin Account State =>", state);
};

const getBoostStakeEntry = async (nftMintProps: string) => {
    const nftMint = new PublicKey(nftMintProps);
    const program = await getBoostStakeProgram();
    console.log("Program =>", program.programId.toString());

    const [boostStakeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), nftMint.toBuffer()],
        program.programId
    );
    console.log("Boost Stake Entry PDA =>", boostStakeEntryPDA.toString());

    try {
        // Primero, verifica qué cuentas están disponibles en el programa
        console.log("Available accounts:", Object.keys(program.account));

        // Verificar si la cuenta existe antes de intentar leerla
        const accountInfo = await program.provider.connection.getAccountInfo(
            boostStakeEntryPDA
        );
        console.log("Account exists:", !!accountInfo);
        console.log("Account info:", accountInfo);

        if (!accountInfo) {
            console.log("La cuenta no existe en esa dirección PDA");
            return null;
        }
        /*
        
                // Usar el nombre correcto de la cuenta: 'nfNodeEntry' (camelCase)
                const state = await program.account.nfNodeEntry.fetch(boostStakeEntryPDA);
                console.log("State fetched:", state);
        
                if (!state) {
                    console.log("State es null/undefined");
                    return null;
                }
        
        
                
        
                const data = {
                    deposit_amount: (Number(state.depositAmount.toString()) / 1_000_000).toFixed(6),
                    deposit_timestamp: new Date(Number(state.depositTimestamp.toString()) * 1000).toISOString()
                };
        
                console.log("Boost Stake Entry Data:", data);
                return data; */
    } catch (error) {
        console.error("Error fetching boost stake entry:", error);
        return null;
    }
};

const getAirdropClaimEntry = async () => {
    const user = getUserKeypair();
    console.log("User Wallet =>", user.publicKey.toString());

    const program = await getAirdropProgram();
    const [claimEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim_entry"), user.publicKey.toBuffer()],
        program.programId
    );
    const state = await program.account.claimEntry.fetch(claimEntryPDA);
    console.log("state", state);
    console.log("Claim Entry State =>", {
        lastClaimedNonce: state.lastClaimedNonce.toString(),
        totalClaimed: state.totalClaimed.toString(),
    });
};

type BaseParams = {
    receivingAddress: string;
    hoursAgo?: number;
    limit?: number;
    tokenAmount?: number;
};

type ClaimWCreditsParams = BaseParams & {
    senderType: "claim_w_credits";
};

type ClaimRewardsParams = BaseParams & {
    senderType: "claim_rewards";
    mintNFT: string;
};

type TransferParams = ClaimWCreditsParams | ClaimRewardsParams;

const getRecentWayruTokenTransfers = async (params: TransferParams) => {
    const { receivingAddress, senderType, tokenAmount, hoursAgo, limit } = params;
    const mintNFT = "mintNFT" in params ? params.mintNFT : undefined;

    if (senderType === "claim_rewards") {
        if (!mintNFT) {
            console.error("mintNFT is required for claim_rewards");
            return;
        }
    }
    // this defaults address are for the wayru token in mainnet
    const defaultClaimWCreditsAddress =
        "5KK2ThgEp1AZM8bo79ijJcumSqz9B48bszyhYhuw3K7o";
    const rewardsProgramId = "Ey6f9uyT1s3UrCGpc586aeHmEupYdfR2xo8Nh7TpqLhX";

    // prepare the wallet address
    const tokenMint = "CyVfcAhqHoY28roieSxAx9B4RCcGEDnVrxbwoc3oH7wa";
    const programAddress =
        senderType === "claim_w_credits"
            ? defaultClaimWCreditsAddress
            : rewardsProgramId;

    // convert string to public key
    const connection = new Connection(clusterApiUrl("devnet"));
    const receivingWalletAddress = new PublicKey(receivingAddress);
    const programId = new PublicKey(programAddress);
    const tokenMintAddress = new PublicKey(tokenMint);

    // Get user's Associated Token Account
    const userTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        receivingWalletAddress,
        false,
        TOKEN_PROGRAM_ID
    );

    // associated token account for the program
    const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_storage")],
        programId
    );

    // Get recent signatures
    const signatures = await connection.getSignaturesForAddress(
        userTokenAccount,
        {
            limit: limit ?? 100,
        },
        "finalized"
    );

    // Filter for last 5 hours Ago or hoursAgo if specified
    const timeAgo =
        moment()
            .subtract(hoursAgo ?? 5, "hours")
            .unix() * 1000;
    const recentSignatures = signatures.filter(
        (sig) => sig.blockTime && sig.blockTime * 1000 > timeAgo
    );

    // Check each transaction
    for (const sig of recentSignatures) {
        const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
        });

        if (!tx) continue;

        // check if it is a token transfer
        const isTokenTransfer = tx.meta?.postTokenBalances?.some(
            (balance) => balance.mint === tokenMintAddress.toString()
        );

        // check if it is a reward claim}
        const isOwnerClaimRewards = tx.meta?.logMessages?.some((log) =>
            log.includes("Instruction: OwnerClaimRewards")
        );
        const isOthersClaimRewards = tx.meta?.logMessages?.some((log) =>
            log.includes("Instruction: OthersClaimRewards")
        );
        const isClaimWCreditsClaim = tx.meta?.logMessages?.some((log) =>
            log.includes("Instruction: ClaimTokens")
        );

        const isRewardClaim = isOwnerClaimRewards || isOthersClaimRewards;

        if (!isRewardClaim && !isClaimWCreditsClaim) continue;

        // Separate the logic for better clarity
        let isNFTInvolved = false;

        // 1. First check if it is OthersClaimRewards (special case that does not require NFT token account)
        if (isOthersClaimRewards) {
            // For OthersClaimRewards, check if the NFT mint is in the transaction keys
            isNFTInvolved = tx.transaction.message
                ?.getAccountKeys()
                .staticAccountKeys.some((key) => key.toString() === mintNFT);

            console.log(
                "OthersClaimRewards detected, NFT in accounts:",
                isNFTInvolved
            );
        }
        // 2. For owner claim rewards, check if the NFT mint is in the transaction keys
        else {
            isNFTInvolved =
                tx.meta?.preTokenBalances?.some(
                    (instruction) =>
                        instruction.mint === mintNFT &&
                        instruction?.uiTokenAmount?.uiAmount === 1
                ) ?? false;
        }

        // Use the simplified variable in the condition
        if (!isTokenTransfer || (senderType === "claim_rewards" && !isNFTInvolved))
            continue;

        // check if the program is involved in the transaction
        const isProgramInvolved = tx.meta?.logMessages?.some(
            (log) =>
                log.includes(`Program ${programAddress} invoke`) ||
                log.includes(`Program ${programAddress} success`)
        );

        if (!isProgramInvolved) continue;

        // get the pre and post balances
        const preBalances = tx.meta?.preTokenBalances || [];
        const postBalances = tx.meta?.postTokenBalances || [];

        // check if the receiver received tokens
        const receiverPreBalance = preBalances.find(
            (balance) =>
                balance.owner === receivingAddress &&
                balance.mint === tokenMintAddress.toString()
        );
        const receiverPostBalance = postBalances.find(
            (balance) =>
                balance.owner === receivingAddress &&
                balance.mint === tokenMintAddress.toString()
        );

        const receiverPreAmount = receiverPreBalance?.uiTokenAmount.uiAmount || 0;
        const receiverPostAmount = receiverPostBalance?.uiTokenAmount.uiAmount || 0;
        const receiverReceivedTokens = receiverPostAmount > receiverPreAmount;

        if (receiverReceivedTokens) {
            const transferAmount = Number(
                receiverPostAmount - receiverPreAmount
            ).toFixed(6);

            // check if the amount is the specific amount
            const isAmountMatch = transferAmount
                ? compareTokenAmounts(Number(transferAmount), Number(tokenAmount))
                : false;

            return {
                signature: sig.signature,
                amount: transferAmount,
                timestamp: tx.blockTime,
                senderType: senderType,
                hash: sig.signature,
                receiver: receivingAddress,
                sender: tokenStorageAuthority.toString(),
                program: programId.toString(),
                confirmed: true,
                logs: tx.meta?.logMessages,
                isAmountMatch,
            };
        }
    }
    return null;
};

const compareTokenAmounts = (
    amount1: number,
    amount2: number,
    tolerance: number = 0.000001
): boolean => {
    // Get the integer part of both numbers
    const integerPart1 = Math.floor(amount1);
    const integerPart2 = Math.floor(amount2);

    // If the integer parts are different, the amounts are different
    if (integerPart1 !== integerPart2) {
        return false;
    }

    // If we only care about the integer part, return true
    // If we want to compare decimals, use the original comparison
    return true;

    // Or if you want to compare decimals with tolerance:
    // const decimalPart1 = amount1 - integerPart1;
    // const decimalPart2 = amount2 - integerPart2;
    // return Math.abs(decimalPart1 - decimalPart2) < tolerance;
};

const ownerPreviousClaim = {
    receivingAddress: "C6NJFArnd1kdZwsUHpX5jkWjNmt8wgdeCHP8b4xypsoa",
    senderType: "claim_rewards",
    mintNFT: "D5PLQFVu5mtPV9z9Dmv7KnZ7MXCaA8voXJLMSdAFH8MA",
    tokenAmount: 1374.97081,
    hoursAgo: 36,
};

const othersPreviousClaim = {
    receivingAddress: "4hUSVSxK9ygwrRHZVTjNJMJeEjxMAPoebBWQvjTfbyfP",
    senderType: "claim_rewards",
    mintNFT: "6Jdc3YSxkVhkm8FRXeY1h34bbqzhGyUjvSDEpH9S1RSa",
    tokenAmount: 500,
    hoursAgo: 5,
};
//getRecentWayruTokenTransfers(ownerPreviousClaim as ClaimRewardsParams).then(res => console.log(res))
//getRecentWayruTokenTransfers(othersPreviousClaim as ClaimRewardsParams).then(res => console.log(res))

const getRecentUpdateNfnodeTransactions = async (params: {
    nftMint: string;
    hoursAgo?: number;
    limit?: number;
}) => {
    const { nftMint, hoursAgo, limit } = params;

    // Convert string to public key
    const connection = new Connection(clusterApiUrl("devnet"));
    const nftMintAddress = new PublicKey(nftMint);

    // Get recent signatures for the NFT mint
    const signatures = await connection.getSignaturesForAddress(
        nftMintAddress,
        {
            limit: limit ?? 100,
        },
        "finalized"
    );

    // Filter for last 5 hours Ago or hoursAgo if specified
    const timeAgo =
        moment()
            .subtract(hoursAgo ?? 5, "hours")
            .unix() * 1000;
    const recentSignatures = signatures.filter(
        (sig) => sig.blockTime && sig.blockTime * 1000 > timeAgo
    );

    type NFTTransaction = {
        signature: string;
        timestamp: number | null | undefined;
        type: "transfer_in" | "transfer_out" | "unknown";
        from: string | undefined;
        to: string | undefined;
        confirmed: boolean;
        logs: string[] | null | undefined;
        nfnodeEntry?: any;
    };

    // Check each transaction
    for (const sig of recentSignatures) {
        const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
        });

        if (!tx) continue;

        // Get pre and post token balances for the NFT
        const preBalances = tx.meta?.preTokenBalances || [];
        const postBalances = tx.meta?.postTokenBalances || [];

        // Find NFT token accounts in the transaction
        const nftPreBalance = preBalances.find(
            (balance) => balance.mint === nftMintAddress.toString()
        );
        const nftPostBalance = postBalances.find(
            (balance) => balance.mint === nftMintAddress.toString()
        );

        if (!nftPreBalance || !nftPostBalance) continue;

        // Determine transaction type
        let transactionType: "transfer_in" | "transfer_out" | "unknown" = "unknown";
        if (
            nftPreBalance.uiTokenAmount.uiAmount === 1 &&
            nftPostBalance.uiTokenAmount.uiAmount === 0
        ) {
            transactionType = "transfer_out";
        } else if (
            nftPreBalance.uiTokenAmount.uiAmount === 0 &&
            nftPostBalance.uiTokenAmount.uiAmount === 1
        ) {
            transactionType = "transfer_in";
        }

        // if tx include update nfnode instruction get detail
        const isUpdateNfnode = tx.meta?.logMessages?.some((log) =>
            log.includes("Instruction: UpdateNfnode")
        );

        if (isUpdateNfnode) {
            try {
                // get nfnode entry
                const nfnodeEntry = await getNFNodeEntry(nftMint);

                // Return the first transaction with UpdateNfnode and its entry
                return {
                    signature: sig.signature,
                    timestamp: tx.blockTime,
                    type: transactionType,
                    from: nftPreBalance.owner,
                    to: nftPostBalance.owner,
                    confirmed: true,
                    logs: tx.meta?.logMessages,
                    nfnodeEntry,
                };
            } catch (error) {
                console.error("Error getting nfnode entry", error);
            }
        }
        continue;
    }

    return null;
};

// Example usage:
const nftTransactions = {
    nftMint: "8whsAuLu8frmfnh1YQRo5EDsMoBoTQzGVfXeGmPRW7Q9",
    hoursAgo: 24,
    limit: 50,
};

export const getLastTotalDepositBoosted = async (): Promise<number> => {
    const vaultAddress = "3GYv7K8bfkqpVgXk8qbksrddFgG86DePSGC6gMYbq4xj";
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const infoAccount = await connection.getAccountInfo(
        new PublicKey(vaultAddress)
    );

    if (!infoAccount) {
        console.log("Account not found");
        return 0;
    }

    console.log("Account Owner:", infoAccount.owner.toString());
    console.log("Account Lamports:", infoAccount.lamports);
    console.log("Account Data Length:", infoAccount.data.length);
    console.log("Raw Data Buffer:", infoAccount.data);

    // The data is a Buffer, you need to deserialize it according to the program's format
    // For most Solana programs, the first 8 bytes are the discriminator
    const discriminator = infoAccount.data.slice(0, 8);
    console.log("Discriminator:", discriminator);

    // This is an AdminAccount from the boost stake program
    // According to the IDL, AdminAccount has these fields:
    // - admin_pubkey: pubkey (32 bytes)
    // - admin_candidate_pubkey: pubkey (32 bytes)
    // - paused: bool (1 byte)
    // - admin_update_requested: bool (1 byte)
    // - valid_mint: pubkey (32 bytes)
    // - mint_authorities: vec<pubkey> (variable length)
    // - total_value_locked: u64 (8 bytes)

    try {
        // Skip discriminator (8 bytes) and read the rest
        const dataWithoutDiscriminator = infoAccount.data.slice(8);
        console.log(
            "Data without discriminator length:",
            dataWithoutDiscriminator.length
        );

        let offset = 0;

        // Read admin_pubkey (32 bytes)
        const adminPubkey = new PublicKey(
            dataWithoutDiscriminator.slice(offset, offset + 32)
        );
        offset += 32;
        console.log("Admin Pubkey:", adminPubkey.toString());

        // Read admin_candidate_pubkey (32 bytes)
        const adminCandidatePubkey = new PublicKey(
            dataWithoutDiscriminator.slice(offset, offset + 32)
        );
        offset += 32;
        console.log("Admin Candidate Pubkey:", adminCandidatePubkey.toString());

        // Read paused (1 byte)
        const paused = dataWithoutDiscriminator.readUInt8(offset);
        offset += 1;
        console.log("Paused:", Boolean(paused));

        // Read admin_update_requested (1 byte)
        const adminUpdateRequested = dataWithoutDiscriminator.readUInt8(offset);
        offset += 1;
        console.log("Admin Update Requested:", Boolean(adminUpdateRequested));

        // Read valid_mint (32 bytes)
        const validMint = new PublicKey(
            dataWithoutDiscriminator.slice(offset, offset + 32)
        );
        offset += 32;
        console.log("Valid Mint:", validMint.toString());

        // Read mint_authorities vector length (4 bytes for u32)
        const mintAuthoritiesLength = dataWithoutDiscriminator.readUInt32LE(offset);
        offset += 4;
        console.log("Mint Authorities Length:", mintAuthoritiesLength);

        // Read mint_authorities (each pubkey is 32 bytes)
        const mintAuthorities: string[] = [];
        for (let i = 0; i < mintAuthoritiesLength; i++) {
            const mintAuth = new PublicKey(
                dataWithoutDiscriminator.slice(offset, offset + 32)
            );
            mintAuthorities.push(mintAuth.toString());
            offset += 32;
        }
        console.log("Mint Authorities:", mintAuthorities);

        // Read total_value_locked (8 bytes as u64)
        const totalValueLocked = dataWithoutDiscriminator.readBigUInt64LE(offset);
        console.log("Total Value Locked (raw):", totalValueLocked.toString());

        // Format with 6 decimals (divide by 10^6)
        const totalValueLockedFormatted = Number(totalValueLocked) / 1_000_000;
        console.log(
            "Total Value Locked (formatted):",
            totalValueLockedFormatted.toFixed(6)
        );

        return totalValueLockedFormatted;
    } catch (error) {
        console.error("Error reading account data:", error);
        return 0;
    }

    return 0;
};

// Uncomment to test:
//getRecentUpdateNfnodeTransactions(nftTransactions).then(res => console.log(res));

// verify solana payment
//verifySolanaMintPaymentV6().then(res => console.log(res));

// check nfn entry
getNFNodeEntry("GwoprHbkFcq5gtFHniqQokvhUaFd1cKH96HRRg3gyTnq").then((res) =>
    console.log(res)
);
