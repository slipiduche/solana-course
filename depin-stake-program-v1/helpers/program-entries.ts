import { Connection, PublicKey } from "@solana/web3.js";
import {
    getAssociatedTokenAddressSync,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    getMint,
    MintLayout,
} from "@solana/spl-token";
import { getDepinStakingProgram } from "./program";
import BN from "bn.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getNFTEntry = async (externalNftMint: PublicKey) => {
    try {
        const program = await getDepinStakingProgram();
        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
            program.programId
        );
        const nfnodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
        return {
            localValueLocked: nfnodeEntry.localValueLocked.toNumber() / 10 ** 6,
            stakeNftCounter: nfnodeEntry.stakeNftCounter.toNumber(),
        };
    } catch (error) {
        console.error("Error getting NFTEntry:", error);
        throw error;
    }
};

export const getDepositEntry = async (
    externalNftMint: PublicKey,
    stakeNftMint: PublicKey
) => {
    try {
        const program = await getDepinStakingProgram();
        console.log("program id =>", program.programId.toString());
        const [depositEntryPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("deposit_entry"),
                externalNftMint.toBuffer(),
                stakeNftMint.toBuffer(),
            ],
            program.programId
        );
        console.log("depositEntryPDA =>", depositEntryPDA.toString());
        const depositEntry = await program.account.depositEntry.fetch(
            depositEntryPDA
        );
        return {
            depositAmount: depositEntry.depositAmount.toNumber() / 10 ** 6,
            depositTimestamp: depositEntry.depositTimestamp.toNumber(),
        };
    } catch (error) {
        console.error("Error getting DepositEntry:", error);
        throw error;
    }
};

export const getProgramAdminEntry = async () => {
    try {
        const program = await getDepinStakingProgram();
        const [programAdminEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        const programAdminEntry = await program.account.adminAccount.fetch(
            programAdminEntryPDA
        );
        return {
            adminPubkey: programAdminEntry.adminPubkey.toString(),
            feeAmount: programAdminEntry.feeAmount.toNumber() / 10 ** 6,
            adminCandidatePubkey: programAdminEntry.adminCandidatePubkey.toString(),
            mintAuthorities: programAdminEntry.mintAuthorities.map((authority) =>
                authority.toString()
            ),
        };
    } catch (error) {
        console.error("Error getting ProgramAdminEntry:", error);
        throw error;
    }
};

// Returns the total deposited by a specific wallet for a given external NFT.
// Assumption: each stake NFT mint is owned by exactly one wallet (the owner of its ATA),
// and that wallet is the only one allowed to make deposits for that stake NFT.
// We sum all deposit entries whose stake NFT ATA is held by the provided wallet.
export const getWalletStakeTotals = async (
    externalNftMint: PublicKey,
    wallet: PublicKey
) => {
    const program = await getDepinStakingProgram();
    console.log("program id =>", program.programId.toString());
    console.log("externalNftMint =>", externalNftMint.toString());
    console.log("wallet =>", wallet.toString());

    // Fetch nfnode entry to know the range of stake NFT counters
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
        program.programId
    );
    const nfnodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
    const totalCounters: number = nfnodeEntry.stakeNftCounter.toNumber
        ? nfnodeEntry.stakeNftCounter.toNumber()
        : Number(nfnodeEntry.stakeNftCounter);

    let totalRaw = BigInt(0); // bigint to avoid overflow

    for (let i = 0; i < totalCounters; i++) {
        const counterBuffer = Buffer.from(new BN(i).toArray("le", 8));

        const [stakeNftMintPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("stake_nft_mint"),
                externalNftMint.toBuffer(),
                counterBuffer,
            ],
            program.programId
        );

        // Compute the user's ATA for this stake NFT mint (Token-2022)
        const userStakeNftAccount = getAssociatedTokenAddressSync(
            stakeNftMintPDA,
            wallet,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Check if the wallet actually holds this stake NFT (balance > 0)
        try {
            const { getAccount } = await import("@solana/spl-token");
            const ataInfo = await getAccount(
                program.provider.connection,
                userStakeNftAccount,
                "confirmed",
                TOKEN_2022_PROGRAM_ID
            );
            if (ataInfo.amount > BigInt(0)) {
                // Fetch deposit entry for this stake NFT and add to total
                const [depositEntryPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("deposit_entry"),
                        externalNftMint.toBuffer(),
                        stakeNftMintPDA.toBuffer(),
                    ],
                    program.programId
                );
                try {
                    const depositEntry = await program.account.depositEntry.fetch(
                        depositEntryPDA
                    );
                    const amountRaw: bigint = BigInt(
                        depositEntry.depositAmount.toString()
                    );
                    totalRaw += amountRaw;
                } catch (_) {
                    // no deposit entry; skip
                }
            }
        } catch (_) {
            // ATA does not exist or not owned by wallet; skip
        }
    }

    const totalHuman = Number(totalRaw) / 1e6; // assuming 6 decimals
    return {
        totalStakedByWallet: totalHuman,
        totalStaked: nfnodeEntry?.localValueLocked.toNumber() / 10 ** 6,
    };
};

/**
 * Get all stake NFT mints that have the programAuthority as their mint authority.
 * This finds all stake NFTs created by the program by:
 * 1. Searching for all nfNodeEntry accounts (each represents an external NFT)
 * 2. For each nfNodeEntry, extracting externalNftMint from the PDA seeds
 * 3. Calculating all possible stakeNftMint PDAs based on the counter
 */
export const getAllStakeNftMints = async (userWallet: PublicKey) => {
    try {
        const program = await getDepinStakingProgram();
        const connection = program.provider.connection;

        // PASO 1: Obtener el programAuthority PDA (mint authority de los stake NFTs)
        const [programAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_authority")],
            program.programId
        );

        console.log(
            "🔍 Program Authority (mint authority de stake NFTs):",
            programAuthority.toString()
        );
        console.log("🔍 Buscando NFTs del usuario con este mint authority...");

        let tokenAccounts;
        try {
            tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                userWallet,
                {
                    programId: TOKEN_2022_PROGRAM_ID, // Solo Token-2022 NFTs
                },
                "confirmed"
            );
            console.log(
                `✅ Encontrados ${tokenAccounts.value.length} token accounts del usuario (Token-2022)`
            );
        } catch (error: any) {
            console.error(
                "❌ Error al obtener token accounts del usuario:",
                error.message
            );
            throw error;
        }

        // Filter for NFTs
        const nftAccounts = tokenAccounts.value.filter((account) => {
            const info = account.account.data.parsed.info;
            return info.tokenAmount.decimals === 0 && info.tokenAmount.amount === "1";
        });

        // PASO 3: Para cada token account, verificar si el mint tiene programAuthority como mint_authority
        const userStakeNftMints: Array<{
            mint: PublicKey;
            tokenAccount: PublicKey;
            balance: string;
        }> = [];

        const mintAddresses = nftAccounts.map(
            (tokenAccount) =>
                new PublicKey(tokenAccount.account.data.parsed.info.mint)
        );
        // get multiple mint authorities
        const multiplesMint = await connection.getMultipleAccountsInfo(
            mintAddresses
        );

        const allEntries: {
            localValueLocked: number;
            stakeNftCounter: number;
            nfnodeMint: string;
            metadata: {
                name: string;
                symbol: string;
                uri: string;
                metadata?: any;
            } | null;
        }[] = [];
        for (let i = 0; i < multiplesMint.length; i++) {
            const mintAccount = multiplesMint[i];
            if (mintAccount) {
                try {
                    const mintInfo = MintLayout.decode(mintAccount.data);

                    if (
                        mintInfo.mintAuthority &&
                        mintInfo.mintAuthority.toBase58() === programAuthority.toString()
                    ) {
                        const metadata = await getNFTMetadata(
                            mintAddresses[i].toString(),
                            connection
                        );
                        // for nfnode mints, the uri is not https
                        const nfnodeMint =
                            metadata?.uri && !metadata?.uri.includes("https")
                                ? new PublicKey(metadata?.uri)
                                : undefined;
                        // if uri not includes https, get the metadata from the uri
                        const nfnodeEntry = nfnodeMint
                            ? await getNFTEntry(nfnodeMint)
                            : undefined;

                        if (nfnodeEntry && nfnodeMint) {
                            // get metadata of the nfnode
                            const metadata = await getNFTMetadata(
                                nfnodeMint.toString(),
                                connection
                            );
                            allEntries.push({
                                nfnodeMint: nfnodeMint.toString(),
                                localValueLocked: nfnodeEntry.localValueLocked,
                                stakeNftCounter: nfnodeEntry.stakeNftCounter,
                                metadata: metadata?.metadata
                            });
                        }
                    }
                } catch (e) {
                    console.log("Error deserializing mint:", e);
                }
            }
        }
        return allEntries;
    } catch (error) {
        console.error("Error getting all stake NFT mints:", error);
        throw error;
    }
};

export const getNFTMetadata = async (
    mintAddress: string,
    connection: Connection
): Promise<{
    name: string;
    symbol: string;
    uri: string;
    metadata?: any;
} | null> => {
    try {
        const mintPublicKey = new PublicKey(mintAddress);

        const mintInfo = await getMint(
            connection,
            mintPublicKey,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );

        if (!mintInfo.tlvData) {
            throw new Error("No TLV data found");
        }
        let metadata = {
            name: "",
            symbol: "",
            uri: "",
        };

        const tlvData = mintInfo.tlvData;
        let offset = 0;

        while (offset < tlvData.length) {
            const type = tlvData.readUInt16LE(offset);
            offset += 2;
            const length = tlvData.readUInt16LE(offset);
            offset += 2;

            if (type === 19) {
                // Metadata
                // Skip the first 64 bytes of the extension
                const metadataStart = offset + 64;

                // Read name
                const nameLength = tlvData.readUInt32LE(metadataStart);
                const name = tlvData
                    .slice(metadataStart + 4, metadataStart + 4 + nameLength)
                    .toString("utf8");

                // Read symbol
                const symbolStart = metadataStart + 4 + nameLength;
                const symbolLength = tlvData.readUInt32LE(symbolStart);
                const symbol = tlvData
                    .slice(symbolStart + 4, symbolStart + 4 + symbolLength)
                    .toString("utf8");

                // Read URI
                const uriStart = symbolStart + 4 + symbolLength;
                const uriLength = tlvData.readUInt32LE(uriStart);
                const uri = tlvData
                    .slice(uriStart + 4, uriStart + 4 + uriLength)
                    .toString("utf8");

                metadata = { name, symbol, uri };
            }
            offset += length;
        }

        // if the metadata uri is not https, return the metadata
        if (
            !metadata.uri.includes("https") ||
            metadata?.uri?.includes("example.com")
        ) {
            return metadata;
        }
        // if the metadata uri is https, get the metadata from the uri
        const url = getIpfsUrl(metadata.uri);
        const { data } = (await axios.get<{
            name: string;
            symbol: string;
            uri: string;
            metadata: any;
        }>(url)) || {
            data: undefined,
        };
        console.log('data =>', data);
        return {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            metadata: data
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error getting token metadata:", error.response?.data);
        } else {
            console.error("Error getting token metadata:", error);
        }
        return null;
    }
};
const getIpfsUrl = (uri: string) => {
    let newUri;
    if (uri.startsWith("https://ipfs.algonode.xyz/ipfs/"))
        newUri = uri.replace(
            "https://ipfs.algonode.xyz/ipfs/",
            "https://olive-actual-guanaco-430.mypinata.cloud/ipfs/"
        );
    else if (uri.startsWith("https://ipfs.io/ipfs//"))
        newUri = uri.replace(
            "https://ipfs.io/ipfs//",
            "https://olive-actual-guanaco-430.mypinata.cloud/ipfs/"
        );
    else if (uri.startsWith("https://ipfs.io/ipfs/"))
        newUri = uri.replace(
            "https://ipfs.io/ipfs/",
            "https://olive-actual-guanaco-430.mypinata.cloud/ipfs/"
        );
    else newUri = uri;

    //console.log('newUri', newUri)
    newUri = newUri + `?pinataGatewayToken=${process.env.PINATA_GATEWAY_KEY}`;

    return newUri;
};
