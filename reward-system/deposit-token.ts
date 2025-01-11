import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAdminKeypair } from "./utils/keypar";
import { getRewardSystemProgram } from "./utils/program";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from "@solana/spl-token";
import { BN } from "bn.js";
import { getKeypair } from "../helpers/getKeyPair";
import { OWNER_TOKENS_PRIVATE_SEED, TOKENS, DECIMALS } from "./constants";
import { convertToTokenAmount } from "./utils/token";

async function main() {
    try {
        console.log("1. Iniciando programa...");
        const program = await getRewardSystemProgram();
        const provider = program.provider as anchor.AnchorProvider;
        const adminKeypair = getAdminKeypair();
        const ownerKeypair = getKeypair(OWNER_TOKENS_PRIVATE_SEED);
        console.log("ownerKeypair", ownerKeypair.publicKey.toString());
        const mint = TOKENS.WAYRU.MINT;
        const amount = new BN(convertToTokenAmount(800, DECIMALS));

        // Calcular la ATA correcta para el owner
        const ownerATA = await getAssociatedTokenAddress(
            mint,
            ownerKeypair.publicKey
        );

        console.log("\n=== Token Accounts ===");
        console.log("Calculated Owner ATA:", ownerATA.toString());
        console.log("Owner Token Account:", TOKENS.WAYRU.OWNER_TOKEN_ACCOUNT.toString());

        // Verificar si la ATA del owner existe y crearla si no
        const ownerAccountInfo = await provider.connection.getAccountInfo(ownerATA);
        if (!ownerAccountInfo) {
            console.log("\n⚠️ La cuenta ATA del owner no existe. Creándola...");
            const createAtaIx = createAssociatedTokenAccountInstruction(
                adminKeypair.publicKey, // payer
                ownerATA, // ata
                ownerKeypair.publicKey, // owner
                mint // mint
            );

            const tx = new Transaction().add(createAtaIx);
            tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = adminKeypair.publicKey;

            const createAtaTxid = await anchor.web3.sendAndConfirmTransaction(
                provider.connection,
                tx,
                [adminKeypair]
            );
            console.log("ATA creada. Txid:", createAtaTxid);
        } else {
            console.log("✅ La cuenta ATA del owner ya existe");
        }

        // Verificar balance del owner
        const ownerBalance = await provider.connection.getTokenAccountBalance(ownerATA);
        console.log("\n=== Balance del Owner ===");
        console.log(`Balance actual: ${ownerBalance.value.uiAmount} tokens`);

        // Si no hay suficientes tokens, transferir desde la cuenta mint token
        if ((ownerBalance?.value?.uiAmount || 0) < amount.toNumber() / Math.pow(10, DECIMALS)) {
            console.log("\n⚠️ Balance insuficiente. Transfiriendo tokens desde mint token account...");
            
            const transferIx = createTransferInstruction(
                TOKENS.WAYRU.MINT_TOKEN_ADDRESS, // from (mint token account)
                ownerATA, // to
                ownerKeypair.publicKey, // authority
                convertToTokenAmount(1000, DECIMALS) // transferir más de lo necesario
            );

            const tx = new Transaction().add(transferIx);
            tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = adminKeypair.publicKey;

            const transferTxid = await anchor.web3.sendAndConfirmTransaction(
                provider.connection,
                tx,
                [ownerKeypair, adminKeypair]
            );
            console.log("Tokens transferidos. Txid:", transferTxid);
        }

        // Obtener el PDA del storage
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        // Crear nueva cuenta de storage con el PDA
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true
        );

        console.log("\n=== Storage Account Info ===");
        console.log("Storage Account:", storageAccount.toString());

        const accounts = {
            user: ownerKeypair.publicKey,
            tokenMint: mint,
            tokenStorageAuthority,
            tokenStorageAccount: storageAccount,
            userTokenAccount: ownerATA,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
        } as const;

        console.log("\n=== Creando transacción ===");
        const ix = await program.methods
            .fundTokenStorage(amount)
            .accounts(accounts)
            .instruction();

        const tx = new Transaction().add(ix);
        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = adminKeypair.publicKey;

        console.log("Enviando transacción...");
        const txid = await anchor.web3.sendAndConfirmTransaction(
            provider.connection,
            tx,
            [ownerKeypair, adminKeypair]
        );

        console.log("\n✅ Transacción exitosa!");
        console.log("Transaction ID:", txid);
        console.log("\n⚠️ GUARDA ESTA INFORMACIÓN:");
        console.log(`STORAGE_ACCOUNT="${storageAccount.toString()}"`);

    } catch (error) {
        console.error("\n❌ Error:", error);
        if (error.logs) {
            console.error("\nLogs:", error.logs);
        }
    }
}

main();