import { Keypair } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);


const keypair2 = getKeypairFromEnvironment("SK");
console.log(`The public key is: `, keypair2.publicKey.toBase58());
console.log(`The secret key is: `, keypair2.secretKey);