import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getRewardSystemProgram } from "./utils/program";
import { getAdminKeypair } from "./utils/keypar";
import { TOKENS, CLAIM_AMOUNT, USER_PRIVATE_SEED } from "./constants";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { initializeSystemIfNeeded } from "./utils/initialize-system";
import { BN } from "bn.js";
import { getKeypair } from "../helpers/getKeyPair";
import { convertToTokenAmount } from "./utils/token";

export const processClaimInBackend = async (
    userPublicKey: anchor.web3.PublicKey,
    nftMint: anchor.web3.PublicKey,
) => {
    try {
        console.log("Iniciando proceso de claim...");

        await initializeSystemIfNeeded();

        const program = await getRewardSystemProgram();
        const adminKeypair = getAdminKeypair();
        console.log("Admin keypair:", adminKeypair.publicKey.toString());

        const rewardAmount = new BN(convertToTokenAmount(1001));
        const nonce = new BN(Date.now());

        // Obtener PDAs y cuentas necesarias
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        const [rewardEntry] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("reward_entry"),
                userPublicKey.toBuffer(),
                nftMint.toBuffer()
            ],
            program.programId
        );

        const [adminAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        const userTokenAccount = await getAssociatedTokenAddress(
            TOKENS.WAYRU.MINT,
            userPublicKey,
            false
        );

        const claimAccounts = {
            userAdmin: adminKeypair.publicKey,
            user: userPublicKey,
            nftMintAddress: nftMint,
            rewardEntry,
            tokenMint: TOKENS.WAYRU.MINT,
            tokenStorageAuthority,
            tokenStorageAccount: TOKENS.WAYRU.STORAGE_ACCOUNT,
            userTokenAccount,
            adminAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        } as const;

        console.log("Preparando transacción...");
        const ix = await program.methods
            .claimRewards(rewardAmount, nonce)
            .accounts(claimAccounts)
            .instruction();

        let tx = new Transaction().add(ix);
        tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = userPublicKey;

        // Firmar con el admin primero
        tx.sign(adminKeypair);

        const serializedTx = tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false
        });

        console.log("Transacción preparada y serializada");
        return serializedTx.toString("base64");

    } catch (error) {
        console.error("Error en processClaimInBackend:", error);
        if (error.logs) {
            console.error("Logs de la transacción:", error.logs);
        }
        throw error;
    }
}

export const processClaimInFrontend = async (
    txBase64: string,
    connection: anchor.web3.Connection,
    userWallet: anchor.web3.Keypair
) => {
    try {
        console.log("Iniciando proceso en frontend...");

        // 1. Deserializar la transacción
        const recoveredTx = anchor.web3.Transaction.from(
            Buffer.from(txBase64, "base64")
        );

        // 3. Firmar con la wallet del usuario
        recoveredTx.partialSign(userWallet);

        // 4. Enviar transacción
        const serializedTx = recoveredTx.serialize({
            requireAllSignatures: true,
            verifySignatures: true,
        });

        // test with send encoded transaction
        const txId = await connection.sendEncodedTransaction(
            serializedTx.toString('base64'),
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
                maxRetries: 5
            }
        );
        console.log("Transaction ID:", txId);
        return txId;

    } catch (error) {
        console.error("Error en processClaimInFrontend:", error);
        if (error.logs) {
            console.error("Logs de la transacción:", error.logs);
        }
        throw error;
    }
}

async function executeClaim() {
    try {
        console.log("=== Iniciando proceso de claim ===");

        const userWallet = getKeypair(USER_PRIVATE_SEED);
        const userPublicKey = userWallet.publicKey;
        const nftMint = new anchor.web3.PublicKey("CqAMqKyJxFtipv28Sy4CjvyTAUtgY4N1BfmDQMauxUTa");
        const connection = new anchor.web3.Connection(
            anchor.web3.clusterApiUrl("devnet"),
            "confirmed"
        );

        console.log("\nVerificando balance inicial...");
        await checkUserBalance(connection, userPublicKey);

        // Verificar si podemos hacer claim
        console.log("\nVerificando último claim...");
        const claimStatus = await checkLastClaim(nftMint, userPublicKey);
        if (!claimStatus.canClaimNow) {
            console.log("\n❌ No se puede hacer claim todavía");
            console.log("Último claim:", claimStatus.lastClaimDate);
            console.log("Próximo claim disponible:", claimStatus.nextClaimDate);
            return;
        }

        console.log("\n✅ Claim disponible, procediendo...");

        // Continuar con el claim si es posible
        await initializeAdminAccount();
        const txBase64 = await processClaimInBackend(userPublicKey, nftMint);

        const txId = await processClaimInFrontend(txBase64, connection, userWallet);
        console.log("\n🎉 Claim exitoso!");
        console.log("Transaction ID:", txId);

        console.log("\nVerificando balance final...");
        await checkUserBalance(connection, userPublicKey);

    } catch (error) {
        console.error("\n❌ Error en el proceso:", error);
    }
}

async function initializeAdminAccount() {
    try {
        const program = await getRewardSystemProgram();
        const adminKeypair = getAdminKeypair();

        // Obtener PDA para admin_account
        const [adminAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // Verificar si la cuenta ya existe
        const accountInfo = await program.provider.connection.getAccountInfo(adminAccount);
        if (accountInfo !== null) {
            console.log("Admin account already initialized");
            return adminAccount;
        }

        console.log("Initializing admin account...");

        const accounts = {
            user: adminKeypair.publicKey,
            adminAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
        } as const;

        const tx = await program.methods
            .initializeSystem()
            .accounts(accounts)
            .signers([adminKeypair])
            .rpc();

        console.log("Admin account initialized. Tx:", tx);
        return adminAccount;
    } catch (error) {
        console.error("Error initializing admin account:", error);
        throw error;
    }
}

async function checkLastClaim(
    nftMint: PublicKey,
    userPublicKey: PublicKey
) {
    try {
        const program = await getRewardSystemProgram();

        // Obtener PDA para reward_entry
        const [rewardEntry] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("reward_entry"),
                userPublicKey.toBuffer(),
                nftMint.toBuffer()
            ],
            program.programId
        );

        // Obtener la cuenta
        const account = await program.account.rewardEntry.fetch(rewardEntry);

        // Convertir el timestamp a fecha
        const lastClaimDate = new Date(Number(account.lastClaimedTimestamp) * 1000);
        console.log("Último claim realizado:", lastClaimDate);

        // Calcular cuándo se puede hacer el próximo claim
        const nextClaimDate = new Date(lastClaimDate);
        nextClaimDate.setDate(nextClaimDate.getDate() + 1);
        console.log("Próximo claim disponible:", nextClaimDate);

        return {
            lastClaimDate,
            nextClaimDate,
            canClaimNow: Date.now() >= nextClaimDate.getTime()
        };
    } catch (error) {
        if (error.message.includes("Account does not exist")) {
            console.log("No se ha realizado ningún claim previo");
            return {
                lastClaimDate: null,
                nextClaimDate: null,
                canClaimNow: true
            };
        }
        throw error;
    }
}

async function checkUserBalance(connection: anchor.web3.Connection, userPublicKey: anchor.web3.PublicKey) {
    try {
        const tokenMint = TOKENS.WAYRU.MINT;
        const userATA = await getAssociatedTokenAddress(
            tokenMint,
            userPublicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        console.log("\nDetalles de la cuenta:");
        console.log("User Public Key:", userPublicKey.toString());
        console.log("Token Mint:", tokenMint.toString());
        console.log("User ATA:", userATA.toString());
        console.log("Token Program:", TOKEN_PROGRAM_ID.toString());

        // Obtener información de la cuenta
        const accountInfo = await connection.getAccountInfo(userATA);
        if (accountInfo) {
            console.log("Cuenta encontrada:");
            console.log("- Owner:", accountInfo.owner.toString());
            console.log("- Data length:", accountInfo.data.length);
            console.log("- Lamports:", accountInfo.lamports);
        }

        const balance = await connection.getTokenAccountBalance(userATA);
        console.log("\nBalance actual del usuario:", balance.value.uiAmount, "tokens");
        console.log("Decimales:", balance.value.decimals);
        console.log("Amount (raw):", balance.value.amount);

        // Intentar obtener información del mint
        const mintInfo = await connection.getAccountInfo(tokenMint);
        if (mintInfo) {
            console.log("\nInformación del Mint:");
            console.log("- Owner (programa):", mintInfo.owner.toString());
            console.log("- Data length:", mintInfo.data.length);
        }

        return balance.value.uiAmount;
    } catch (error) {
        console.error("\nError al verificar balance:", error);
        console.log("El usuario aún no tiene tokens o la cuenta no existe");
        return 0;
    }
}

async function checkStorageStatus() {
    try {
        const program = await getRewardSystemProgram();

        // 1. Verificar PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        console.log("\n=== Storage PDA ===");
        console.log("Expected Storage Authority:", tokenStorageAuthority.toString());

        // 2. Verificar cuenta de storage
        const storageInfo = await program.provider.connection.getAccountInfo(TOKENS.WAYRU.STORAGE_ACCOUNT);

        if (!storageInfo) {
            console.log("❌ Storage account no existe!");
            return;
        }

        console.log("\n=== Storage Account Info ===");
        console.log("Address:", TOKENS.WAYRU.STORAGE_ACCOUNT);
        console.log("Owner:", storageInfo.owner.toString());
        console.log("Is Token Program:", storageInfo.owner.equals(TOKEN_PROGRAM_ID));

        // 3. Verificar balance
        try {
            const accountInfo = await program.provider.connection.getTokenAccountBalance(
                TOKENS.WAYRU.STORAGE_ACCOUNT
            );
            console.log("\n=== Balance Info ===");
            console.log("Amount:", accountInfo.value.uiAmount);
            console.log("Decimals:", accountInfo.value.decimals);
        } catch (error) {
            console.log("❌ Error obteniendo balance:", error);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// Ejecutar el claim
executeClaim();