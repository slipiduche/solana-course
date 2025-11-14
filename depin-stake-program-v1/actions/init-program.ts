import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";
import { getDepinStakingProgram } from "../helpers/program";
import { TOKENS } from "../constants";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";

export const initStakingProgram = async () => {
    try {
        const program = await getDepinStakingProgram();
        const admin = getDepinStakingAdminKeypair();
        const [programDataAddress] = PublicKey.findProgramAddressSync(
            [program.programId.toBuffer()],
            new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
        );

        // Calculate adminAccount PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // Calculate admin's associated token account for fee receiving
        const adminTokenAccount = getAssociatedTokenAddressSync(
            TOKENS.T_WAYRU_TOKEN_MINT,
            admin.publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // prepare transaction
        console.log('preparing transaction...')
        console.log('Admin public key:', admin.publicKey.toString())
        console.log('Admin token account (fee wallet):', adminTokenAccount.toString())
        console.log('AdminAccount PDA:', adminAccountPDA.toString())
        console.log('ProgramData address:', programDataAddress.toString())

        const accounts = {
            user: admin.publicKey,
            adminAccount: adminAccountPDA,
            programData: programDataAddress,
            tokenMint: TOKENS.T_WAYRU_TOKEN_MINT,
            mintAuthority: admin.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: program.programId,
            systemProgram: SystemProgram.programId,
            feeReceivingWallet: adminTokenAccount
        } as const

        console.log('sending transaction...')
        const txHash = await program.methods.initializeSystem(new BN(10))
            .accounts(accounts)
            .signers([admin])
            .rpc({
                commitment: 'confirmed',
                skipPreflight: false
            });

        console.log("Transaction signature:", txHash);
        console.log("Program initialized successfully!");
    } catch (error) {
        console.error("Error initializing program:", error);
        console.error("Error details:", error.toString());
        throw error;
    }
}