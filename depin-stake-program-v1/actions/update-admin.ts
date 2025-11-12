import { Keypair, PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";

interface UpdateAdminProps {
    admin: Keypair;
    newAdmin: Keypair;
}
export const updateAdmin = async ({ admin, newAdmin }: UpdateAdminProps) => {
    try {
        const program = await getDepinStakingProgram();
        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // check if the admin account is already updated
        const adminAccountData = await program.account.adminAccount.fetch(
            adminAccountPDA
        );
        if (adminAccountData.adminPubkey.equals(newAdmin.publicKey)) {
            console.log("Admin account is already updated");
            return;
        }

        console.log("Admin account PDA:", adminAccountPDA.toString());
        const tx = await program.methods
            .updateAdminRequest(newAdmin.publicKey)
            .accounts({
                user: admin.publicKey,
            })
            .transaction();

        const { blockhash, lastValidBlockHeight } =
            await program.provider.connection.getLatestBlockhash();
        tx.feePayer = admin.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.sign(admin);

        const txHash = await program.provider.connection.sendRawTransaction(
            tx.serialize(),
            {
                preflightCommitment: "confirmed",
                skipPreflight: false,
            }
        );

        console.log("Transaction signature:", txHash);
    } catch (error) {
        console.error("Error updating admin:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}
