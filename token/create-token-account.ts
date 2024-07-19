import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const apiUrl = process.env.API_URL
const connection = new Connection(apiUrl??clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SK");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

// Subtitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey("GpnaPjEzqnpjbU4tPRm1AVnHvqbthFZTM9qm4xGS9Kwj");

// Here we are making an associated token account for our own address, but we can 
// make an ATA on any other wallet in devnet!
//const recipient = new PublicKey("2MC991bsQhmf1ZZGoQGrZY12mdCE3zsRioZEfESaPs7a");
const recipient = user.publicKey;

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient
);

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

const link = getExplorerLink(
  "address",
  tokenAccount.address.toBase58(),
  apiUrl?'localnet':"devnet"
);

console.log(`✅ Created token Account: ${link}`);