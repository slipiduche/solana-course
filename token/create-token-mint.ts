import { createMint } from "@solana/spl-token";
import "dotenv/config";
import {
    getKeypairFromEnvironment,
    getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl } from "@solana/web3.js";
const apiUrl = process.env.API_URL
const connection = new Connection(apiUrl ?? clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SK");

console.log(
    `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

// This is a shortcut that runs:
// SystemProgram.createAccount
// token.createInitializeMintInstruction
// See https://www.soldev.app/course/token-program
const tokenMint = await createMint(connection, user, user.publicKey, null, 0);

const link = getExplorerLink("address", tokenMint.toString(), apiUrl ? 'localnet' : "devnet");

console.log(`✅ Finished! Created token mint: ${link}`);