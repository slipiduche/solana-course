import { Keypair, PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";

interface AcceptAdminProps {
    newAdmin: Keypair;
}
export const acceptAdmin = async ({ newAdmin }: AcceptAdminProps) => {
    try {
        const program = await getDepinStakingProgram();

        // Use the new admin (the candidate) to accept the change
        console.log('New admin (candidate) public key:', newAdmin.publicKey.toString());

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log('Admin account PDA:', adminAccountPDA.toString());

        // Check current state before accepting
        const adminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);
        console.log('\n=== Before Accept ===');
        console.log('Current admin:', adminAccountData.adminPubkey.toString());
        console.log('Admin candidate:', adminAccountData.adminCandidatePubkey.toString());
        console.log('Admin update requested:', adminAccountData.adminUpdateRequested);

        // Accept the admin change
        console.log('\nAccepting admin change...');
        const txHash = await program.methods.acceptAdminRequest()
            .accounts({
                user: newAdmin.publicKey, // The candidate admin
            })
            .signers([newAdmin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: false
            });

        console.log('Transaction signature:', txHash);

        // Check state after accepting
        console.log('\nChecking final state...');
        const finalAdminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);
        console.log('\n=== After Accept ===');
        console.log('Current admin:', finalAdminAccountData.adminPubkey.toString());
        console.log('Admin candidate:', finalAdminAccountData.adminCandidatePubkey.toString());
        console.log('Admin update requested:', finalAdminAccountData.adminUpdateRequested);

        if (finalAdminAccountData.adminPubkey.equals(newAdmin.publicKey)) {
            console.log('\n✅ Admin change completed successfully!');
        } else {
            console.log('\n❌ Admin change failed');
        }

    } catch (error) {
        console.error("Error accepting admin:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}
