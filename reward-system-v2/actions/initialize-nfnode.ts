import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { RewardSystem } from "../types/reward_system";
import { BN } from "bn.js";
import { TOKENS } from "../constants";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { StakingProgram } from "../types/staking_program";
import { convertToTokenAmount } from "../../reward-system/utils/token";

interface InitializeNfnodeProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userNftOwner: Keypair;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    nfnodeEntryPDA: PublicKey;
    host: Keypair;
    manufacturer: Keypair;
    nfnodeType: { don: {} } | { byod: {} } | { wayruHotspot: {} }
}

interface InitializeNfnodePropsV2 {
    program: Program<StakingProgram>;
    adminKeypair: Keypair;
    userNftOwner: Keypair;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    nfnodeEntryPDA: PublicKey;
    host: Keypair;
    manufacturer: Keypair;
}

export const initializeNfnode = async ({
    program,
    adminKeypair,
    userNftOwner,
    nftMint,
    userNFTTokenAccount,
    nfnodeEntryPDA,
    host,
    manufacturer,
    nfnodeType
}: InitializeNfnodeProps) => {
    try {
        // Derivar admin account PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        const TOKEN_MINT = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT;

        // Verificar balance del usuario según el tipo de nodo
        switch (true) {
            case 'wayruHotspot' in nfnodeType:
            case 'byod' in nfnodeType:
                const userTokenAccount = await getAssociatedTokenAddress(
                    TOKEN_MINT,
                    userNftOwner.publicKey
                );

                try {
                    const balance = await program.provider.connection
                        .getTokenAccountBalance(userTokenAccount);
                    console.log("User token balance:", balance.value.uiAmount);

                    if ((balance.value.uiAmount || 0) < 5000) {
                        const nodeType = 'wayruHotspot' in nfnodeType ? 'Wayru Hotspot' : 'BYOD';
                        throw new Error(`Insufficient WAYRU tokens. Need 5000 WAYRU tokens for ${nodeType} nodes.`);
                    }
                } catch (error) {
                    if (error.message.includes("Insufficient")) throw error;
                    throw new Error("Failed to verify user token balance. Make sure the account exists and has sufficient WAYRU tokens.");
                }
                break;
            case 'don' in nfnodeType:
                console.log("DON node type selected - no token deposit required");
                break;
            default:
                throw new Error("Invalid NFNode type. Must be 'don', 'byod', or 'wayruHotspot'");
        }

        console.log("Initializing NFNode...");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("Token Mint:", TOKEN_MINT.toString());
        console.log('programId', program.programId.toString());
        console.log("User:", userNftOwner.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("NFNode Entry PDA:", nfnodeEntryPDA.toString());

        // Derivar token storage authority PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage"), nftMint.toBuffer()],
            program.programId
        );

        // Obtener la cuenta de token del usuario
        const userTokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT,
            userNftOwner.publicKey
        );

        // Obtener la cuenta de token storage
        const tokenStorageAccount = await getAssociatedTokenAddress(
            TOKEN_MINT,
            tokenStorageAuthority,
            true // allowOwnerOffCurve = true para PDAs
        );

        const accounts = {
            userAdmin: adminKeypair.publicKey,
            user: userNftOwner.publicKey,
            nftMintAddress: nftMint,
            userNftTokenAccount: userNFTTokenAccount,
            host: host.publicKey,
            manufacturer: manufacturer.publicKey,
            tokenMint: TOKEN_MINT,
            nfnodeEntry: nfnodeEntryPDA,
            adminAccount: adminAccountPDA,
            tokenStorageAuthority,
            tokenStorageAccount,
            userTokenAccount,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        } as const;

        const signature = await program.methods
            .initializeNfnode(new BN(Date.now()), nfnodeType)
            .accounts(accounts)
            .signers([adminKeypair, userNftOwner])
            .rpc({ commitment: "confirmed" });

        console.log("Transaction signature:", signature);

        // Esperar y verificar que el nodo se inicializó correctamente
        console.log("Waiting for confirmation...");
        let nfnodeData = false;
        let times = 0;
        while (!nfnodeData && times < 10) {
            try {
                const nfnodeState = await program.account.nfNodeEntry.fetch(
                    nfnodeEntryPDA,
                    "finalized"
                );
                nfnodeData = nfnodeState.host.toBase58().length > 0;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                times++;
            }
        }

        if (!nfnodeData) {
            throw new Error("Failed to verify NFNode initialization");
        }

        console.log("NFNode initialized successfully");
        return signature;

    } catch (error) {
        console.error("Error initializing NFNode:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        throw error;
    }
};

export const initializationNFNodeStaking = async ({
    program,
    adminKeypair,
    userNftOwner,
    nftMint,
    userNFTTokenAccount,
    nfnodeEntryPDA,
    host,
    manufacturer,
}: InitializeNfnodePropsV2) => {
    try {
        // Derivar admin account PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        const TOKEN_MINT = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT
        const amount = 50;
        const depositAmount = convertToTokenAmount(amount, 6);

        console.log("Initializing NFNode...");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("Token Mint:", TOKEN_MINT.toString());
        console.log('programId', program.programId.toString());
        console.log("User:", userNftOwner.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("NFNode Entry PDA:", nfnodeEntryPDA.toString());

        // Derivar token storage authority PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage"), nftMint.toBuffer()],
            program.programId
        );

        // Obtener la cuenta de token del usuario
        const userTokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT,
            userNftOwner.publicKey
        );

        // Obtener la cuenta de token storage
        const tokenStorageAccount = await getAssociatedTokenAddress(
            TOKEN_MINT,
            tokenStorageAuthority,
            true // allowOwnerOffCurve = true para PDAs
        );

        const accounts = {
            userAdmin: adminKeypair.publicKey,
            user: userNftOwner.publicKey,
            nftMintAddress: nftMint,
            userNftTokenAccount: userNFTTokenAccount,
            host: host.publicKey,
            manufacturer: manufacturer.publicKey,
            tokenMint: TOKEN_MINT,
            nfnodeEntry: nfnodeEntryPDA,
            adminAccount: adminAccountPDA,
            tokenStorageAuthority,
            tokenStorageAccount,
            userTokenAccount,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        } as const;

        const tx = await program.methods
            .initializeNfnode(new BN(depositAmount))
            .accounts(accounts)
            .transaction()

        // Get the latest blockhash first
        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();

        // Set transaction properties before signing
        tx.feePayer = adminKeypair.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;

        // Sign the transaction
        tx.sign(adminKeypair);
        tx.partialSign(userNftOwner);

        const txHash = await program.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            preflightCommitment: 'finalized',
            maxRetries: 5,
        });

        console.log("Transaction signature:", txHash);
        console.log("NFNode initialized successfully");
        return txHash;

    } catch (error) {
        console.error("Error initializing NFNode:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        throw error;
    }
};
