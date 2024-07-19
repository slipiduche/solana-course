// This uses "@metaplex-foundation/mpl-token-metadata@2" to create tokens
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
const apiUrl = process.env.API_URL
const user = getKeypairFromEnvironment("SK");

const connection = new Connection(apiUrl ?? clusterApiUrl("devnet"));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"//'FhWND83wDwWNmDKZC9RcH2Pm74AXuwZdhZCkvBMfr5fE'//
);

const balance = await connection.getBalance(TOKEN_METADATA_PROGRAM_ID);

console.log(`The balance of the account at ${TOKEN_METADATA_PROGRAM_ID} is ${balance} lamports`);

// Subtitute in your token mint account
const tokenMintAccount = new PublicKey("3SPAiTqVT6izV6eCpxu862do1BU2Awzp539VfiTRPECL");

const balance2 = await connection.getBalance(tokenMintAccount);

console.log(`The balance of the account at ${tokenMintAccount} is ${balance2} lamports`);

const metadataData = {
  name: "NFNode on SOLANA",
  symbol: "NFN",
  // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
  uri: "https://ipfs.algonode.xyz/ipfs/bafkreiegjkbeaj4jqmw77yjpuivxpix7io6uemwpn3knmpi5bfzxmm5yni",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const metadataPDAAndBump = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

const metadataPDA = metadataPDAAndBump[0];

const transaction = new Transaction();

const createMetadataAccountInstruction =
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  );

transaction.add(createMetadataAccountInstruction);
console.log('sending tx...', apiUrl)

const transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [user]
);

console.log('transactionSignature:', transactionSignature)

const transactionLink = getExplorerLink(
  "transaction",
  transactionSignature,
  apiUrl ? 'localnet' : "devnet"
);

console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}!`);

const tokenMintLink = getExplorerLink(
  "address",
  tokenMintAccount.toString(),
  apiUrl ? 'localnet' : "devnet"
);

console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);