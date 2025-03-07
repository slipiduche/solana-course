import * as anchor from "@coral-xyz/anchor";
import { getRewardSystemProgram } from "./utils/program";
import { createTokenWithMetadata } from "./utils/token";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { BN } from "bn.js";
import { pinataSdk } from '../spl-token/helpers/pinata';
import { getKeypair } from '../spl-token/helpers/getKeyPair';
import { OWNER_TOKENS_PRIVATE_SEED } from "./constants";
import { getAdminKeypair, getWalletFromUnit8Array } from "../reward-system-v2/helpers/keypair";
import { MALICIOUS_USER1_PRIVATEKEY } from '../reward-system-v2/constants';
import bs58 from 'bs58';

async function main() {
    try {
        console.log("1. Iniciando programa...");
        const program = await getRewardSystemProgram();
        const provider = program.provider as anchor.AnchorProvider;
        const ownerKeypair = getWalletFromUnit8Array(MALICIOUS_USER1_PRIVATEKEY); // malicious user is the owner
        console.log("Owner Keypair:", ownerKeypair.publicKey.toString());

        // view owner secret to import to phantom wallet
        const secretKeyBase58 = bs58.encode(ownerKeypair.secretKey);
        console.log("Owner Secret (Base58):", secretKeyBase58);

        const DECIMALS = 6;
        const INITIAL_SUPPLY = 10_000_000_000_000_000; // 10 mil millones de tokens (10,000,000,000.000000)
        const image = "https://ipfs.algonode.xyz/ipfs/bafkreifwvjebc5rul43627nrjf27hp3nz43imwin2ke2wi7xiswt63mwte";

        // Metadata del token
        const tokenMetadata = {
            name: "TWAYRU",
            symbol: "TWAYRU",
            description: "WAYRU official token for the testnet network",
            image: image,
            attributes: [],
            seller_fee_basis_points: 0,
            properties: {
                files: [
                    {
                        uri: image,
                        type: "image/png",
                        cdn: true
                    }
                ],
                category: "image",
                creators: [
                    {
                        address: ownerKeypair.publicKey.toString(),
                        share: 100,
                        verified: true
                    }
                ],
                collection: {
                    name: "WAYRU Collection",
                    family: "WAYRU"
                }
            }
        };

        // create metadata
        const pinataResponse = await pinataSdk.pinJSONToIPFS(tokenMetadata, {
            pinataMetadata: {
                name: `${tokenMetadata.name}-metadata`,
            },
            pinataOptions: { 
                cidVersion: 0
            },
        });

        // Crear nuevo token con metadata
        console.log("4. Creando nuevo token con metadata...");
        const mint = await createTokenWithMetadata({
            provider,
            adminKeypair: ownerKeypair,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            uri: `https://ipfs.algonode.xyz/ipfs/${pinataResponse.IpfsHash}`,
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