import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "dotenv/config";
const suppliedPublicKey = process.argv[2];
const apiUrl = process.env.API_URL
if (!suppliedPublicKey) {
    throw new Error("Provide a public key to check the balance of!");
}
const connection = new Connection(apiUrl ?? clusterApiUrl("devnet"));
const address = new PublicKey(suppliedPublicKey);
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;
console.log(`The balance of the account at ${address} is ${balance} lamports`);
console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`);
console.log(`✅ Finished!`)