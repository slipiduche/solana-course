import { PublicKey } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";

export const checkMintAuthorities = async () => {
    try {
        const program = await getDepinStakingProgram();

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log('Admin account PDA:', adminAccountPDA.toString());

        // Fetch admin account data
        const adminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);

        console.log('\n=== Mint Authorities ===');
        console.log('Current admin:', adminAccountData.adminPubkey.toString());
        console.log('Number of mint authorities:', adminAccountData.mintAuthorities.length);

        if (adminAccountData.mintAuthorities.length > 0) {
            console.log('\nMint authorities:');
            adminAccountData.mintAuthorities.forEach((authority, index) => {
                console.log(`  ${index + 1}. ${authority.toString()}`);
            });
        } else {
            console.log('\nNo mint authorities found');
        }

    } catch (error) {
        console.error("Error checking mint authorities:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}

