import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction, Connection, clusterApiUrl } from "@solana/web3.js";
import { AirdropsProgram } from "../types/AirdropsProgram";
import { BN } from "bn.js";

interface Props {
    program: Program<AirdropsProgram>,
    adminKeypair: Keypair,
    userKeypair: Keypair,
    mint: PublicKey,
    amount: number,
    nonce: number
}
export const claimTokens = async (props: Props) => {
    const { program, adminKeypair, userKeypair, mint, amount, nonce } = props;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const ix = await program.methods
        .claimTokens(new BN(amount), new BN(nonce))
        .accounts({
            userAdmin: adminKeypair.publicKey,
            user: userKeypair.publicKey,
            tokenMint: mint,
        })
        .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = userKeypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.partialSign(adminKeypair, userKeypair);

    const sig = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: false,
        maxRetries: 5,
        preflightCommitment: 'confirmed'
    });
    console.log("tokens claimed", sig);
    return sig;
}
