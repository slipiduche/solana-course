import * as anchor from "@coral-xyz/anchor";
import { getRewardSystemProgram } from "./utils/program";
import { createTokenWithMetadata } from "./utils/token";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { BN } from "bn.js";
import { pinataSdk } from '../spl-token/helpers/pinata';
import { getKeypair } from '../spl-token/helpers/getKeyPair';
import { OWNER_TOKENS_PRIVATE_SEED } from "./constants";
import { getAdminKeypair, getWalletFromUnit8Array } from "../reward-system-v2/helpers/keypair";
import { MALICIOUS_USER2_PRIVATEKEY } from '../reward-system-v2/constants';

async function main() {
    try {
        console.log("1. Iniciando programa...");
        const program = await getRewardSystemProgram();
        const provider = program.provider as anchor.AnchorProvider;
        const ownerKeypair = getWalletFromUnit8Array(MALICIOUS_USER2_PRIVATEKEY); // malicious user is the owner
        console.log("Owner Keypair:", ownerKeypair.publicKey.toString());

        const DECIMALS = 6; // Definir explícitamente los decimales
        const INITIAL_SUPPLY = 10_000_000_000_000; // 10 mil tokens con 6 decimales

        // Metadata del token
        const tokenMetadata = {
            name: "WAYRU",
            symbol: "WAYRU",
            description: "Official token for the Wayru Network",
            image: "https://white-capable-coyote-202.mypinata.cloud/files/bafkreigiauh26m3bxnmrwjrk25esg322dvprz2l4xappalo6mh5xk2ybly",
            external_url: "https://wayru.io",
            properties: {
                files: [
                    {
                        uri: "https://white-capable-coyote-202.mypinata.cloud/files/bafkreigiauh26m3bxnmrwjrk25esg322dvprz2l4xappalo6mh5xk2ybly",
                        type: "image/png"
                    }
                ],
                category: "token",
                creators: [
                    {
                        address: ownerKeypair.publicKey.toString(),
                        share: 100
                    }
                ]
            }
        };

        // Crear nuevo token con metadata
        console.log("4. Creando nuevo token con metadata...");
        const mint = await createTokenWithMetadata({
            provider,
            adminKeypair: ownerKeypair,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            uri: 'https://ipfs.algonode.xyz/ipfs/bafkreia75xgum6jyr32figbxegvbb7uwdjyrjvmkmnalohun4zbe3nzqbe',
            decimals: DECIMALS
        });

        // Crear la cuenta ATA usando ownerKeypair como payer
        const ownerATA = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            ownerKeypair,
            mint,
            ownerKeypair.publicKey
        );

        // Mintear tokens usando ownerKeypair como authority
        console.log("\n=== Minteando tokens al owner ===");
        await mintTo(
            provider.connection,
            ownerKeypair,
            mint,
            ownerATA.address,
            ownerKeypair.publicKey,
            INITIAL_SUPPLY
        );
        console.log("✅ Tokens minteados al owner");

        // Verificar balance del owner
        const ownerBalance = await provider.connection.getTokenAccountBalance(ownerATA.address);
        console.log("\n=== Balance Final ===");
        console.log(`Balance del owner: ${ownerBalance.value.uiAmount} tokens`);
        console.log(`Decimales del token: ${ownerBalance.value.decimals}`);

        console.log("\n⚠️ GUARDA ESTA INFORMACIÓN:");
        console.log(`MINT="${mint.toString()}"`);
        console.log(`MINT_TOKEN_ADDRESS="${ownerATA.address.toString()}"`);
        console.log(`OWNER_TOKEN_ACCOUNT="${ownerATA.address.toString()}"`);

    } catch (error) {
        console.error("\n❌ Error:", error);
        if (error.logs) {
            console.error("\nLogs:", error.logs);
        }
    }
}

main(); 