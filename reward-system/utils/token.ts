import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getAssociatedTokenAddress, createAssociatedTokenAccount, getMint } from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";

export const createTokenMint = async ({
    provider,
    adminKeypair
}: {
    provider: anchor.AnchorProvider,
    adminKeypair: Keypair
}) => {
    const mintKeypair = Keypair.generate();

    // Crear el mint token
    const mint = await createMint(
        provider.connection,
        adminKeypair,
        adminKeypair.publicKey,
        null,
        6, // decimales
        mintKeypair
    );

    console.log(`Created token mint: ${mint.toString()}`);
    return mint;
}

export const createAndDepositNewToken = async ({
    provider,
    program,
    adminKeypair,
    amount,
    tokenMetadata
}: {
    provider: anchor.AnchorProvider,
    program: Program<RewardSystem>,
    adminKeypair: Keypair,
    amount: number,
    tokenMetadata: {
        name: string,
        symbol: string,
        uri: string
    }
}) => {
    try {
        // 1. Crear el mint primero
        console.log("Creating new mint...");
        const mint = await createTokenMint({
            provider,
            adminKeypair
        });

        // 2. Verificar que el mint se creó correctamente
        const mintInfo = await getMint(provider.connection, mint);
        console.log("Mint info:", {
            address: mint.toString(),
            supply: mintInfo.supply.toString(),
            decimals: mintInfo.decimals,
            mintAuthority: mintInfo.mintAuthority?.toString(),
            freezeAuthority: mintInfo.freezeAuthority?.toString()
        });

        // 3. Crear metadata después de verificar el mint
        console.log("Creating metadata...");
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataAddress,
                mint: mint,
                mintAuthority: adminKeypair.publicKey,
                payer: adminKeypair.publicKey,
                updateAuthority: adminKeypair.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: tokenMetadata.name,
                        symbol: tokenMetadata.symbol,
                        uri: tokenMetadata.uri,
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: null,
                },
            }
        );

        const tx = new anchor.web3.Transaction().add(createMetadataInstruction);
        await provider.sendAndConfirm(tx, [adminKeypair]);

        // 4. Mintear tokens
        console.log("Minting tokens...");
        const { contractTokenAccount, tokenStoragePDA } = await mintTokensToContract({
            provider,
            program,
            amount,
            mint,
            adminKeypair
        });

        return {
            mint,
            contractTokenAccount,
            tokenStoragePDA
        };

    } catch (error) {
        console.error("Error in createAndDepositNewToken:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        throw error;
    }
}

export const mintTokensToContract = async ({
    provider,
    program,
    amount,
    mint,
    adminKeypair
}: {
    provider: anchor.AnchorProvider,
    program: Program<RewardSystem>,
    amount: number,
    mint: PublicKey,
    adminKeypair: Keypair
}) => {
    try {
        // 1. Verificar el mint primero
        const mintInfo = await getMint(provider.connection, mint);
        console.log("\nVerificando mint:", {
            address: mint.toString(),
            mintAuthority: mintInfo.mintAuthority?.toString(),
            supply: mintInfo.supply.toString(),
            decimals: mintInfo.decimals
        });

        // 2. Crear cuenta ATA del admin
        const adminATA = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            adminKeypair,
            mint,
            adminKeypair.publicKey
        );
        console.log("Admin ATA:", adminATA.address.toString());

        // 3. Crear PDA y cuenta del contrato
        const [tokenStoragePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage"), mint.toBuffer()],
            program.programId
        );

        console.log("Token Storage PDA:", tokenStoragePDA.toString());

        // 4. Crear cuenta ATA del contrato
        const contractTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            adminKeypair,
            mint,
            tokenStoragePDA,
            true // allowOwnerOffCurve
        );
        console.log("Contract Token Account:", contractTokenAccount.address.toString());

        // 5. Mintear tokens
        console.log("\nPreparando minteo de tokens...");
        console.log("Cantidad a mintear:", amount);

        await mintTo(
            provider.connection,
            adminKeypair,
            mint,
            contractTokenAccount.address, // Usar .address aquí
            adminKeypair.publicKey,
            amount,
            [],
            { commitment: 'confirmed' }
        );

        // 6. Verificar el balance final
        const balance = await provider.connection.getTokenAccountBalance(
            contractTokenAccount.address
        );
        console.log("\nBalance final:", balance.value.uiAmount);

        return {
            contractTokenAccount: contractTokenAccount.address,
            tokenStoragePDA
        };

    } catch (error) {
        console.error("\nError en mintTokensToContract:");
        console.error("Detalles del error:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        if (error.logs) {
            console.error("\nLogs de la transacción:");
            error.logs.forEach((log: string, i: number) => {
                console.error(`${i + 1}. ${log}`);
            });
        }
        throw error;
    }
}

interface CreateTokenWithMetadataParams {
    provider: anchor.AnchorProvider;
    adminKeypair: anchor.web3.Keypair;
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
}

export async function createTokenWithMetadata({
    provider,
    adminKeypair,
    name,
    symbol,
    uri,
    decimals = 6
}: CreateTokenWithMetadataParams): Promise<anchor.web3.PublicKey> {
    // Crear el mint
    const mint = await createMint(
        provider.connection,
        adminKeypair,
        adminKeypair.publicKey,
        adminKeypair.publicKey,
        6 // decimales
    );

    // Crear metadata
    const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const tokenMetadata = {
        name: name,
        symbol: symbol,
        uri: uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    };

    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataPDA,
            mint: mint,
            mintAuthority: adminKeypair.publicKey,
            payer: adminKeypair.publicKey,
            updateAuthority: adminKeypair.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: tokenMetadata,
                isMutable: true,
                collectionDetails: null
            }
        }
    );

    const tx = new Transaction().add(createMetadataInstruction);
    await sendAndConfirmTransaction(provider.connection, tx, [adminKeypair]);

    return mint;
}

export const checkContractTokenBalance = async (
    tokenAccount: PublicKey
) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const balance = await connection.getTokenAccountBalance(tokenAccount);
        console.log("\nBalance de tokens:", {
            uiAmount: balance.value.uiAmount,
            decimals: balance.value.decimals,
            address: tokenAccount.toString()
        });
        return balance.value.uiAmount;
    } catch (error) {
        console.error("Error al verificar balance:", error);
        throw error;
    }
}

export const convertToTokenAmount = (amount: number, decimals: number = 6) => {
    return Math.round(amount * Math.pow(10, decimals));
};