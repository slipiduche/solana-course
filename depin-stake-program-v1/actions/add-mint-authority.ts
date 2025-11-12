import { Keypair, PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { checkMintAuthorities } from "./check-mint-authorities";

interface AddMintAuthorityProps {
    admin: Keypair;
    newMintAuthority: PublicKey;
}
export const addMintAuthority = async ({ admin, newMintAuthority }: AddMintAuthorityProps) => {
    try {
        const program = await getDepinStakingProgram();

        // add new mint authority to add mint authority
        console.log('New mint authority public key:', newMintAuthority.toString());
        const tx = await program.methods.addMintAuthority(newMintAuthority)
            .accounts({
                user: admin.publicKey,
            })
            .transaction();

        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = admin.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.sign(admin);

        const txHash = await program.provider.connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });
        console.log('Transaction signature:', txHash);
        console.log('Mint authority added successfully by user 1');

        await checkMintAuthorities()
    } catch (error) {
        console.error("Error adding mint authority:", error);
    }
}