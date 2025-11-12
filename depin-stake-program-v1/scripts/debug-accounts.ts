import { PublicKey, clusterApiUrl, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getDepinStakingProgram } from "../helpers/program";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";
import { TOKENS } from "../constants";

async function debugAccounts() {
    const program = await getDepinStakingProgram();
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const user = getDepinStakingAdminKeypair();
    const externalNftMint = TOKENS.NFNODE_1_MINT;

    console.log("🔍 Debugging all accounts for initStakeNft...\n");

    // Admin account
    const [adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
    );
    const adminAccountInfo = await connection.getAccountInfo(adminAccountPDA);
    console.log("1. adminAccount:", adminAccountPDA.toString());
    console.log("   Owner:", adminAccountInfo?.owner.toString());
    console.log("   Expected:", program.programId.toString());
    console.log("   Match:", adminAccountInfo?.owner.toString() === program.programId.toString() ? "✅" : "❌");
    console.log("");

    // NFNode entry
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
        program.programId
    );
    const nfnodeEntryInfo = await connection.getAccountInfo(nfnodeEntryPDA);
    console.log("2. nfnodeEntry:", nfnodeEntryPDA.toString());
    console.log("   Owner:", nfnodeEntryInfo?.owner.toString());
    console.log("   Expected:", program.programId.toString());
    console.log("   Match:", nfnodeEntryInfo?.owner.toString() === program.programId.toString() ? "✅" : "❌");
    console.log("");

    // External NFT mint
    const externalNftMintInfo = await connection.getAccountInfo(externalNftMint);
    console.log("3. externalNftMint:", externalNftMint.toString());
    console.log("   Owner:", externalNftMintInfo?.owner.toString());
    console.log("   Expected: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA or TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
    console.log("");

    // Token mint
    const tokenMintInfo = await connection.getAccountInfo(TOKENS.T_WAYRU_TOKEN_MINT);
    console.log("4. tokenMint:", TOKENS.T_WAYRU_TOKEN_MINT.toString());
    console.log("   Owner:", tokenMintInfo?.owner.toString());
    console.log("   Expected: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    console.log("   Match:", tokenMintInfo?.owner.toString() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ? "✅" : "❌");
    console.log("");

    // User token account
    const userTokenAccount = getAssociatedTokenAddressSync(
        TOKENS.T_WAYRU_TOKEN_MINT,
        user.publicKey,
        false,
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    );
    const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
    console.log("5. userTokenAccount:", userTokenAccount.toString());
    console.log("   Owner:", userTokenAccountInfo?.owner.toString());
    console.log("   Expected: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    console.log("   Match:", userTokenAccountInfo?.owner.toString() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ? "✅" : "❌");
    console.log("");

    // Token storage authority
    const [tokenStorageAuthority] = PublicKey.findProgramAddressSync([
        Buffer.from("token_storage"),
        externalNftMint.toBuffer()
    ], program.programId);
    const tokenStorageAuthorityInfo = await connection.getAccountInfo(tokenStorageAuthority);
    console.log("6. tokenStorageAuthority:", tokenStorageAuthority.toString());
    console.log("   Owner:", tokenStorageAuthorityInfo?.owner.toString() || "DOES NOT EXIST");
    console.log("   Note: This is a PDA, might not exist yet");
    console.log("");

    // Token storage account
    const tokenStorageAccount = getAssociatedTokenAddressSync(
        TOKENS.T_WAYRU_TOKEN_MINT,
        tokenStorageAuthority,
        true,
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    );
    const tokenStorageAccountInfo = await connection.getAccountInfo(tokenStorageAccount);
    console.log("7. tokenStorageAccount:", tokenStorageAccount.toString());
    console.log("   Owner:", tokenStorageAccountInfo?.owner.toString());
    console.log("   Expected: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    console.log("   Match:", tokenStorageAccountInfo?.owner.toString() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ? "✅" : "❌");
    console.log("");

    // Fee receiving wallet (from admin account)
    const adminAccountData = await program.account.adminAccount.fetch(adminAccountPDA);
    const feeReceivingWallet = adminAccountData.feeReceivingWallet;
    const feeReceivingWalletInfo = await connection.getAccountInfo(feeReceivingWallet);
    console.log("8. feeReceivingWallet:", feeReceivingWallet.toString());
    console.log("   Owner:", feeReceivingWalletInfo?.owner.toString());
    console.log("   Expected: 11111111111111111111111111111111 (System Program)");
    console.log("   Match:", feeReceivingWalletInfo?.owner.toString() === "11111111111111111111111111111111" ? "✅" : "❌");
    console.log("");

    // Program authority
    const [programAuthority] = PublicKey.findProgramAddressSync([
        Buffer.from("program_authority")
    ], program.programId);
    const programAuthorityInfo = await connection.getAccountInfo(programAuthority);
    console.log("9. programAuthority:", programAuthority.toString());
    console.log("   Owner:", programAuthorityInfo?.owner.toString() || "DOES NOT EXIST");
    console.log("   Note: This is a PDA, might not exist yet");
    console.log("");

    console.log("🎯 Summary:");
    console.log("Program ID:", program.programId.toString());
    console.log("Token Program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    console.log("Associated Token Program: ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    console.log("System Program: 11111111111111111111111111111111");
}

debugAccounts().catch(console.error);

