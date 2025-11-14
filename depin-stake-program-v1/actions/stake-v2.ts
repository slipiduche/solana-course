import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { getDepinStakingProgram } from "../helpers/program";
import { getNFTEntry } from "../helpers/program-entries";
import { TOKENS } from "../constants";
import { convertToTokenAmount } from "../helpers/token-utils";

export const stakeV2 = async (user: any, externalNftMint: PublicKey, amount: number) => {
    try {
        console.log("🔧 Starting stake V2 operation (1-2 transactions)...");

        const program = await getDepinStakingProgram();
        const connection = program.provider.connection;

        // Detect which token program owns the external NFT mint
        const externalNftMintInfo = await connection.getAccountInfo(externalNftMint);
        if (!externalNftMintInfo) throw new Error("External NFT mint does not exist");

        const externalNftTokenProgram = externalNftMintInfo.owner;
        console.log("🔍 External NFT Token Program:", externalNftTokenProgram.toString());

        // TRANSACTION 1: Initialize NFNode entry if needed
        console.log("🔧 TRANSACTION 1: Checking NFNode entry...");
        try {
            const nfnodeEntry = await getNFTEntry(externalNftMint);
            console.log("✅ NFNode entry already exists, proceeding with stake...");
        } catch (error) {
            console.log("🔧 NFNode entry does not exist, creating it...");

            const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
                program.programId
            );

            const initializeNfnodeTx = await program.methods.initializeNfnode()
                .accounts({
                    user: user.publicKey,
                    externalNftMint: externalNftMint,
                    nfnodeEntry: nfnodeEntryPDA,
                    systemProgram: new PublicKey('11111111111111111111111111111111')
                })
                .signers([user])
                .rpc({
                    commitment: 'confirmed',
                    skipPreflight: false
                });

            console.log("✅ NFNode entry created successfully!");
            console.log("📝 Initialize NFNode tx signature:", initializeNfnodeTx);

            // Wait for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Get current counter and find existing stake NFT mint
        const entry = await getNFTEntry(externalNftMint);
        const currentCounter = entry.stakeNftCounter;
        console.log("📊 Current counter:", currentCounter);

        // Find existing stake NFT mint or use current counter for new mint
        let stakeNftMintPda: PublicKey | null = null;
        let isNewMint = false;

        // First, try to find existing stake NFT mints
        for (let counter = currentCounter - 1; counter >= 0; counter--) {
            const counterBuffer = Buffer.from(new BN(counter).toArray('le', 8));

            const [mintPda] = PublicKey.findProgramAddressSync([
                Buffer.from("stake_nft_mint"),
                externalNftMint.toBuffer(),
                counterBuffer
            ], program.programId);

            const mintAccountInfo = await program.provider.connection.getAccountInfo(mintPda);
            if (mintAccountInfo) {
                stakeNftMintPda = mintPda;
                console.log("🎯 Found existing stake NFT mint (counter " + counter + "):", mintPda.toString());
                break;
            }
        }

        // If no existing mint found, create a new one using current counter
        if (!stakeNftMintPda) {
            const counterBuffer = Buffer.from(new BN(currentCounter).toArray('le', 8));

            const [mintPda] = PublicKey.findProgramAddressSync([
                Buffer.from("stake_nft_mint"),
                externalNftMint.toBuffer(),
                counterBuffer
            ], program.programId);

            stakeNftMintPda = mintPda;
            isNewMint = true;
            console.log("🎯 Creating new stake NFT mint (counter " + currentCounter + "):", mintPda.toString());
        }

        // Check if user has the stake NFT
        const userStakeNftAccount = getAssociatedTokenAddressSync(
            stakeNftMintPda,
            user.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let userHasNft = false;
        try {
            const { getAccount } = await import('@solana/spl-token');
            const userStakeNftAccountInfo = await getAccount(connection, userStakeNftAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
            if (userStakeNftAccountInfo.amount > 0) {
                userHasNft = true;
                console.log("📊 User NFT balance:", userStakeNftAccountInfo.amount.toString());
            } else {
                console.log("📊 User NFT account exists but has no balance");
                userHasNft = false;
            }
        } catch (error) {
            console.log("📊 User NFT account does not exist");
            userHasNft = false;
        }

        console.log("📊 User has stake NFT:", userHasNft ? "YES" : "NO");
        console.log("📊 Is new mint:", isNewMint ? "YES" : "NO");

        // TRANSACTION 2: Stake operation (use initStakeNft only if user does NOT have the NFT)
        if (!userHasNft) {
            console.log("🔧 TRANSACTION 2: First stake - Creating NFT and staking...");
            try {
                // Calculate all required accounts for initStakeNft
                const [adminAccountPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("admin_account")],
                    program.programId
                );

                // Get fee receiving wallet from admin account
                const adminAccountInfo = await program.account.adminAccount.fetch(adminAccountPDA);
                const feeReceivingWallet = adminAccountInfo.feeReceivingWallet;

                const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
                    program.programId
                );

                const counterBuffer = Buffer.from(new BN(currentCounter).toArray('le', 8));

                const [stakeNftMintPDA] = PublicKey.findProgramAddressSync([
                    Buffer.from("stake_nft_mint"),
                    externalNftMint.toBuffer(),
                    counterBuffer // currentCounter as u64 (8 bytes)
                ], program.programId);

                const userStakeNftAccount = getAssociatedTokenAddressSync(
                    stakeNftMintPDA,
                    user.publicKey,
                    false,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const [depositEntryPDA] = PublicKey.findProgramAddressSync([
                    Buffer.from("deposit_entry"),
                    externalNftMint.toBuffer(),
                    stakeNftMintPDA.toBuffer(),
                ], program.programId);

                const userTokenAccount = getAssociatedTokenAddressSync(
                    TOKENS.T_WAYRU_TOKEN_MINT,
                    user.publicKey,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const [tokenStorageAuthority] = PublicKey.findProgramAddressSync([
                    Buffer.from("token_storage"),
                    externalNftMint.toBuffer()
                ], program.programId);

                const tokenStorageAccount = getAssociatedTokenAddressSync(
                    TOKENS.T_WAYRU_TOKEN_MINT,
                    tokenStorageAuthority,
                    true,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                console.log("🔍 Debug - Account addresses:");
                console.log("  - stakeNftMintPDA:", stakeNftMintPDA.toString());
                console.log("  - depositEntryPDA:", depositEntryPDA.toString());
                console.log("  - userStakeNftAccount:", userStakeNftAccount.toString());
                console.log("  - tokenStorageAccount:", tokenStorageAccount.toString());

                const [programAuthority] = PublicKey.findProgramAddressSync([
                    Buffer.from("program_authority")
                ], program.programId);

                // feeReceivingWallet is now the token account itself
                const feeWalletTokenAccount = feeReceivingWallet;

                // Verify that the fee wallet token account exists and is a valid SPL Token account
                console.log("🔍 Verifying fee wallet token account:", feeWalletTokenAccount.toString());

                // Check if the account exists and is a valid token account
                let feeAccountExists = false;
                try {
                    const { getAccount } = await import('@solana/spl-token');
                    const feeAccountInfo = await getAccount(
                        connection,
                        feeWalletTokenAccount,
                        'confirmed',
                        TOKEN_PROGRAM_ID
                    );

                    // Verify the mint is correct
                    if (!feeAccountInfo.mint.equals(TOKENS.T_WAYRU_TOKEN_MINT)) {
                        throw new Error(`Fee wallet token account has incorrect mint. Expected: ${TOKENS.T_WAYRU_TOKEN_MINT.toString()}, Got: ${feeAccountInfo.mint.toString()}`);
                    }

                    feeAccountExists = true;
                    console.log("✅ Fee wallet token account exists and is valid");
                    console.log("   - Owner:", feeAccountInfo.owner.toString());
                    console.log("   - Mint:", feeAccountInfo.mint.toString());
                    console.log("   - Amount:", feeAccountInfo.amount.toString());
                } catch (error: any) {
                    // Check if the account doesn't exist or is invalid
                    if (error.name === 'TokenAccountNotFoundError' ||
                        error.code === 'TokenAccountNotFoundError' ||
                        error.name === 'TokenInvalidAccountOwnerError' ||
                        error.message?.includes('InvalidAccountOwner') ||
                        error.message?.includes('invalid account data')) {
                        console.log("⚠️ Fee wallet token account does not exist or is invalid, creating it...");
                        feeAccountExists = false;
                    } else {
                        throw error;
                    }
                }

                // If the fee wallet token account doesn't exist, try to create it
                if (!feeAccountExists) {
                    console.log("🔧 Attempting to create fee wallet token account...");
                    const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');

                    // Try to create the account assuming it's the admin's ATA
                    const adminWallet = adminAccountInfo.adminPubkey;

                    // Calculate what the admin's ATA should be
                    const expectedAdminATA = getAssociatedTokenAddressSync(
                        TOKENS.T_WAYRU_TOKEN_MINT,
                        adminWallet,
                        false,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    );

                    // If the stored address matches the admin's ATA, create it
                    if (expectedAdminATA.equals(feeWalletTokenAccount)) {
                        console.log("✅ Fee wallet is admin's ATA, creating it...");
                        const createATAInstruction = createAssociatedTokenAccountInstruction(
                            user.publicKey, // payer
                            feeWalletTokenAccount, // associated token account
                            adminWallet, // owner
                            TOKENS.T_WAYRU_TOKEN_MINT, // mint
                            TOKEN_PROGRAM_ID,
                            ASSOCIATED_TOKEN_PROGRAM_ID
                        );

                        const createATATx = new Transaction().add(createATAInstruction);
                        const latestBlockhash = await connection.getLatestBlockhash({ commitment: "recent" });
                        createATATx.recentBlockhash = latestBlockhash.blockhash;
                        createATATx.feePayer = user.publicKey;
                        createATATx.sign(user);

                        try {
                            const createATAHash = await connection.sendRawTransaction(createATATx.serialize(), {
                                skipPreflight: false,
                                preflightCommitment: "confirmed",
                            });

                            console.log("✅ Fee wallet token account created!");
                            console.log("📝 Create ATA tx signature:", createATAHash);

                            // Wait for the account to be created
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                        } catch (createError: any) {
                            console.log("⚠️ Could not create fee wallet token account:", createError.message);
                            throw new Error(`Fee wallet token account does not exist and could not be created. The fee wallet address (${feeWalletTokenAccount.toString()}) stored in the admin account may be incorrect. Please update the admin account with a valid token account address. Error: ${createError.message}`);
                        }
                    } else {
                        // The stored address doesn't match the admin's ATA
                        // We can't create it without knowing the owner
                        console.log("⚠️ Fee wallet address does not match admin's ATA");
                        console.log(`   Stored address: ${feeWalletTokenAccount.toString()}`);
                        console.log(`   Expected admin ATA: ${expectedAdminATA.toString()}`);
                        throw new Error(`Fee wallet token account does not exist and cannot be automatically created. The stored address (${feeWalletTokenAccount.toString()}) does not match the admin's associated token account (${expectedAdminATA.toString()}). Please ensure the admin account has been properly configured with a valid token account address, or update it using the updateFeeWallet instruction.`);
                    }
                }

                // Perform first stake operation using initStakeNft
                console.log("🔧 Performing first stake operation...");
                const stakeTx = await program.methods.initStakeNft(
                    {
                        name: "Stake NFT",
                        symbol: "STAKE",
                        uri: "https://example.com/metadata.json"
                    },
                    new BN(convertToTokenAmount(amount))
                )
                    .accounts({
                        user: user.publicKey,
                        tokenMint: TOKENS.T_WAYRU_TOKEN_MINT,
                        adminAccount: adminAccountPDA,
                        nfnodeEntry: nfnodeEntryPDA,
                        depositEntry: depositEntryPDA,
                        externalNftMint: externalNftMint,
                        stakeNftMint: stakeNftMintPDA,
                        userStakeNftAccount: userStakeNftAccount,
                        userTokenAccount: userTokenAccount,
                        tokenStorageAuthority: tokenStorageAuthority,
                        tokenStorageAccount: tokenStorageAccount,
                        feeReceivingWallet: feeWalletTokenAccount,
                        programAuthority: programAuthority,
                        tokenProgram: externalNftTokenProgram,
                        tokenProgramSpl: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId
                    } as any)
                    .signers([user])
                    .rpc({
                        commitment: 'confirmed',
                        skipPreflight: false
                    });

                console.log("✅ First stake operation successful!");
                console.log("📝 Stake tx signature:", stakeTx);

            } catch (stakeError) {
                console.log("❌ First stake failed:", stakeError.message);
                throw stakeError;
            }
        } else {
            console.log("🔧 TRANSACTION 2: Additional stake - Using existing NFT...");
            try {
                // Calculate all required accounts for stake
                const [adminAccountPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("admin_account")],
                    program.programId
                );

                // Get fee receiving wallet from admin account
                const adminAccountInfo = await program.account.adminAccount.fetch(adminAccountPDA);
                const feeReceivingWallet = adminAccountInfo.feeReceivingWallet;

                const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
                    program.programId
                );

                const [depositEntryPDA] = PublicKey.findProgramAddressSync([
                    Buffer.from("deposit_entry"),
                    externalNftMint.toBuffer(),
                    stakeNftMintPda.toBuffer(),
                ], program.programId);

                const userStakeNftAccount = getAssociatedTokenAddressSync(
                    stakeNftMintPda,
                    user.publicKey,
                    false,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const userTokenAccount = getAssociatedTokenAddressSync(
                    TOKENS.T_WAYRU_TOKEN_MINT,
                    user.publicKey,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const [tokenStorageAuthority] = PublicKey.findProgramAddressSync([
                    Buffer.from("token_storage"),
                    externalNftMint.toBuffer()
                ], program.programId);

                const tokenStorageAccount = getAssociatedTokenAddressSync(
                    TOKENS.T_WAYRU_TOKEN_MINT,
                    tokenStorageAuthority,
                    true,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const [programAuthority] = PublicKey.findProgramAddressSync([
                    Buffer.from("program_authority")
                ], program.programId);

                // feeReceivingWallet is now the token account itself
                const feeWalletTokenAccount = feeReceivingWallet;

                // User already has the NFT, so the associated token account should exist
                console.log("✅ User has NFT, associated token account should exist");

                // Perform additional stake operation using stake
                console.log("🔧 Performing additional stake operation...");
                const stakeTx = await program.methods.stake(
                    new BN(convertToTokenAmount(amount))
                )
                    .accounts({
                        user: user.publicKey,
                        tokenMint: TOKENS.T_WAYRU_TOKEN_MINT,
                        adminAccount: adminAccountPDA,
                        nfnodeEntry: nfnodeEntryPDA,
                        depositEntry: depositEntryPDA,
                        externalNftMint: externalNftMint,
                        stakeNftMint: stakeNftMintPda,
                        userStakeNftAccount: userStakeNftAccount,
                        userTokenAccount: userTokenAccount,
                        tokenStorageAuthority: tokenStorageAuthority,
                        tokenStorageAccount: tokenStorageAccount,
                        feeReceivingWallet: feeWalletTokenAccount,
                        programAuthority: programAuthority,
                        tokenProgram: TOKEN_2022_PROGRAM_ID,
                        tokenProgramSpl: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId
                    } as any)
                    .signers([user])
                    .rpc({
                        commitment: 'confirmed',
                        skipPreflight: false
                    });

                console.log("✅ Additional stake operation successful!");
                console.log("📝 Stake tx signature:", stakeTx);

            } catch (stakeError) {
                console.log("❌ Additional stake failed:", stakeError.message);
                throw stakeError;
            }
        }

        // Wait for the transaction to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("✅ Stake V2 completed successfully!");
        console.log("📊 Final summary:");
        console.log("   - Transaction 1: Initialize NFNode (if needed)");
        console.log("   - Transaction 2: Complete stake operation");
        console.log("   - Total signatures: 1-2 (depending on what's needed)");
        console.log("   - Note: initStakeNft does complete stake, stake() for additional stakes");

    } catch (error) {
        console.error("Error in stake V2:", error);
        throw error;
    }
};