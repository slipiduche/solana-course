import { Keypair, PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { sleep } from "../utils";
import { TOKENS } from "../constants";
import { getNFTEntry } from "../helpers/program-entries";

interface InitializeNFNodeProps {
    initializer: Keypair;
    externalNftMint: PublicKey;
}
export const initializeNFNode = async ({ initializer, externalNftMint }: InitializeNFNodeProps) => {
    try {

        console.log('Initializing NFNode...');
        const program = await getDepinStakingProgram();
        console.log('Initializer user NFT public key:', initializer.publicKey.toString());

        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
            program.programId
        );

        const tx = await program.methods.initializeNfnode()
            .accounts({
                user: initializer.publicKey,
                externalNftMint: externalNftMint,
                tokenMint: TOKENS.T_WAYRU_TOKEN_MINT,
                nfnodeEntry: nfnodeEntryPDA,
            } as any)
            .transaction();
        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = initializer.publicKey; // User should pay the fees
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.sign(initializer); // User should sign the transaction
        const txHash = await program.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });
        console.log('Transaction signature:', txHash);

        // await 2 seconds and check nfnode entry
        await sleep(2);
        const nfnodeEntry = await getNFTEntry(externalNftMint);
        console.log('NFNode entry:', nfnodeEntry);
    } catch (error) {
        console.error("Error initializing NFNode:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}