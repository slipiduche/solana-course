import "dotenv/config";
import {
    getExplorerLink,
    getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
const apiUrl = process.env.API_URL
const connection = new Connection(apiUrl ?? clusterApiUrl("devnet"));

const sender = getKeypairFromEnvironment("SK");

console.log(
    `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`
);

// Add the recipient public key here.
const recipient = new PublicKey("G37BbUMZU3NgMZkHVLMWcFGQZwTJ455824Ps55rPRMfv");

// Subtitute in your token mint account
const tokenMintAccount = new PublicKey("GpnaPjEzqnpjbU4tPRm1AVnHvqbthFZTM9qm4xGS9Kwj");

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log(`💸 Attempting to send 1 token to ${recipient.toBase58()}...`);

// Get or create the source and destination token accounts to store this token
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMintAccount,
    sender.publicKey
);
console.log('senderTokenAccount:',sourceTokenAccount)
const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMintAccount,
    recipient
);
console.log('receiverTokenAccount:',destinationTokenAccount)

// Transfer the tokens
const signature = await transfer(
    connection,
    sender,
    sourceTokenAccount.address,
    destinationTokenAccount.address,
    sender,
    1 * MINOR_UNITS_PER_MAJOR_UNITS
);

const explorerLink = getExplorerLink("transaction", signature, apiUrl ? 'localnet' : "devnet");

console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}!`);