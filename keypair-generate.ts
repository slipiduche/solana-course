import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


const keypair2 = getKeypairFromEnvironment("SK");
console.log(`The public key is: `, keypair2.publicKey.toBase58());
console.log(`The secret key is: `, keypair2.secretKey);