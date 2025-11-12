import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { TOKENS } from "../constants";

interface NftDetails {
    mint: string;
    owner: string;
    amount: string;
    tokenAccount: string;
    metadata: { name: string } | null;
    isToken2022: boolean;
    mintAuthority: string | null;
    updateAuthority: string | null;
}

export const getWalletNftsByToken2022 = async ({
    walletAddress,
    connection
}: {
    walletAddress: PublicKey;
    connection?: Connection;
}) => {
    try {
        // Use provided connection or create a new one
        const conn = connection || new Connection(clusterApiUrl("devnet"), "confirmed");

        console.log(`Fetching Token-2022 NFTs for wallet: ${walletAddress.toString()}`);

        // Get all token accounts for the wallet
        const tokenAccounts = await conn.getTokenAccountsByOwner(walletAddress, {
            programId: TOKEN_2022_PROGRAM_ID
        });

        console.log(`Found ${tokenAccounts.value.length} Token-2022 accounts`);

        const nftDetails: NftDetails[] = [];

        for (const tokenAccount of tokenAccounts.value) {
            try {
                const accountInfo = tokenAccount.account;
                const tokenData = accountInfo.data;

                // Parse token account data
                const mint = new PublicKey(tokenData.slice(0, 32));
                const owner = new PublicKey(tokenData.slice(32, 64));
                const amount = tokenData.readBigUInt64LE(64);

                // Check if it's an NFT (amount = 1 and decimals = 0)
                if (amount === 1n) {
                    // Get mint info to check decimals
                    const mintInfo = await conn.getParsedAccountInfo(mint);

                    if (mintInfo.value && 'parsed' in mintInfo.value.data) {
                        const mintData = mintInfo.value.data.parsed.info;

                        // Check if it's an NFT (decimals = 0)
                        if (mintData.decimals === 0) {
                            // Get mint authority and update authority from mint data
                            let mintAuthority: string | null = null;
                            let updateAuthority: string | null = null;

                            try {
                                // Get raw mint account data to parse authorities
                                const mintAccountInfo = await conn.getAccountInfo(mint);
                                if (mintAccountInfo) {
                                    const mintAccountData = mintAccountInfo.data;

                                    // Parse mint authority (bytes 4-36 in mint account)
                                    const mintAuthorityBytes = mintAccountData.slice(4, 36);
                                    if (!mintAuthorityBytes.every(byte => byte === 0)) {
                                        mintAuthority = new PublicKey(mintAuthorityBytes).toString();
                                    }

                                    // Parse update authority (bytes 36-68 in mint account)
                                    const updateAuthorityBytes = mintAccountData.slice(36, 68);
                                    if (!updateAuthorityBytes.every(byte => byte === 0)) {
                                        updateAuthority = new PublicKey(updateAuthorityBytes).toString();
                                    }
                                }
                            } catch (authorityError) {
                                console.warn(`Could not fetch authorities for ${mint.toString()}:`, authorityError);
                            }

                            // Try to get metadata if it exists
                            let metadata: { name: string } | null = null;
                            try {
                                // Look for metadata account (this is a simplified approach)
                                const [metadataAddress] = PublicKey.findProgramAddressSync(
                                    [
                                        Buffer.from("metadata"),
                                        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
                                        mint.toBuffer()
                                    ],
                                    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
                                );

                                const metadataAccount = await conn.getAccountInfo(metadataAddress);
                                if (metadataAccount) {
                                    // Parse metadata (simplified)
                                    const metadataData = metadataAccount.data;
                                    const nameLength = metadataData.readUInt32LE(1 + 32 + 32 + 4);
                                    const name = metadataData.slice(1 + 32 + 32 + 4 + 4, 1 + 32 + 32 + 4 + 4 + nameLength).toString();

                                    metadata = {
                                        name: name,
                                        // Add more metadata parsing as needed
                                    };
                                }
                            } catch (metadataError) {
                                console.warn(`Could not fetch metadata for ${mint.toString()}:`, metadataError);
                            }

                            nftDetails.push({
                                mint: mint.toString(),
                                owner: owner.toString(),
                                amount: amount.toString(),
                                tokenAccount: tokenAccount.pubkey.toString(),
                                metadata: metadata,
                                isToken2022: true,
                                mintAuthority: mintAuthority,
                                updateAuthority: updateAuthority
                            } as NftDetails);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error processing token account ${tokenAccount.pubkey.toString()}:`, error);
            }
        }

        console.log(`Found ${nftDetails.length} Token-2022 NFTs`);
        return nftDetails;

    } catch (error) {
        console.error("Error fetching wallet Token-2022 NFTs:", error);
        throw error;
    }
};



// Alternative function using SPL Token library for more reliable balance reading
export const getWalletTokenStakeBalanceSPL = async ({
    walletAddress,
    connectionProps
}: {
    walletAddress: PublicKey;
    connectionProps?: Connection;
}) => {
    try {
        const connection = connectionProps || new Connection(clusterApiUrl("devnet"), "confirmed");
        const token = TOKENS.T_WAYRU_TOKEN_MINT;
        const tokenAccount = await getAssociatedTokenAddressSync(token, walletAddress);

        try {
            // Use SPL Token library to get account info
            const accountInfo = await getAccount(connection, tokenAccount);

            // Convert balance to formatted number (6 decimals)
            const formattedBalance = Number(accountInfo.amount) / Math.pow(10, 6);

            return formattedBalance;
        } catch (error) {
            // If account doesn't exist, return 0
            if (error.message.includes("could not find account")) {
                return 0;
            }
            throw error;
        }
    } catch (error) {
        console.error("Error getting wallet token stake balance (SPL):", error);
        throw error;
    }
};
