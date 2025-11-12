import { Keypair } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";

interface RemoveMintAuthorityProps {
    admin: Keypair;
    user: Keypair;
}
export const removeMintAuthority = async ({ admin, user }: RemoveMintAuthorityProps) => {
    try {
        const program = await getDepinStakingProgram();

        // Remove user mint authority
        console.log('Admin public key:', admin.publicKey.toString());
        console.log('User public key to remove:', user.publicKey.toString());

        const tx = await program.methods.removeMintAuthority(user.publicKey)
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
        console.log('Mint authority removed successfully for user');

    } catch (error) {
        console.error("Error removing mint authority:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}
