import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { TOKENS } from "../constants";
import { getNFTEntry } from "../helpers/program-entries";
import { BN } from "bn.js";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

interface UnstakeProps {
    user: Keypair;
    externalNftMint: PublicKey;
}

export const unstake = async ({ user, externalNftMint }: UnstakeProps) => {
    try {
        console.log("🔧 Starting unstake operation...");
        const program = await getDepinStakingProgram();

        // Check current counter
        const nfnodeEntry = await getNFTEntry(externalNftMint);
        const currentCounter = nfnodeEntry.stakeNftCounter;
        console.log("📊 Current counter:", currentCounter.toString());

        // Find the correct stake NFT mint by checking previous counters
        let stakeNftMintPda: PublicKey | null = null;
        let foundCounter = -1;

        // Check if there's an existing mint by trying previous counters
        for (let counter = currentCounter - 1; counter >= 0; counter--) {
            const counterBuffer = Buffer.alloc(8);
            counterBuffer.writeUInt32LE(counter, 0);

            const [mintPda] = PublicKey.findProgramAddressSync([
                Buffer.from("stake_nft_mint"),
                externalNftMint.toBuffer(),
                counterBuffer
            ], program.programId);

            const mintAccountInfo = await program.provider.connection.getAccountInfo(mintPda);
            if (mintAccountInfo) {
                stakeNftMintPda = mintPda;
                foundCounter = counter;
                console.log("🎯 Found existing stake NFT mint (counter " + counter + "):", mintPda.toString());
                break;
            }
        }

        if (!stakeNftMintPda) {
            throw new Error("❌ No stake NFT mint found. User has no active stake to unstake.");
        }
        console.log("✅ Stake NFT mint exists");

        // Calculate user's stake NFT token account (using TOKEN_2022_PROGRAM_ID like in stake)
        const userStakeNftAccount = getAssociatedTokenAddressSync(
            stakeNftMintPda,
            user.publicKey,
            false, // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("🎯 User stake NFT account:", userStakeNftAccount.toString());

        // Check if user has the stake NFT
        const userStakeNftAccountInfo = await program.provider.connection.getAccountInfo(userStakeNftAccount);
        if (!userStakeNftAccountInfo) {
            throw new Error("❌ User does not have the stake NFT. Cannot unstake.");
        }
        console.log("✅ User has the stake NFT");

        // Calculate deposit entry PDA
        const [depositEntryPDA] = PublicKey.findProgramAddressSync([
            Buffer.from("deposit_entry"),
            externalNftMint.toBuffer(),
            stakeNftMintPda.toBuffer(),
        ], program.programId);

        console.log("🎯 Deposit entry PDA:", depositEntryPDA.toString());

        // Check if deposit entry exists
        try {
            const depositEntryInfo = await program.account.depositEntry.fetch(depositEntryPDA);
            console.log("✅ Deposit entry exists, amount:", depositEntryInfo.depositAmount.toString());
        } catch (error) {
            throw new Error("❌ Deposit entry does not exist. User has no active stake to unstake.");
        }

        // Calculate user's token account
        const userTokenAccount = getAssociatedTokenAddressSync(
            TOKENS.T_WAYRU_TOKEN_MINT,
            user.publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("🎯 User token account:", userTokenAccount.toString());

        // Calculate token storage authority PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage"), externalNftMint.toBuffer()],
            program.programId
        );

        console.log("🎯 Token storage authority:", tokenStorageAuthority.toString());

        // Calculate token storage account
        const tokenStorageAccount = getAssociatedTokenAddressSync(
            TOKENS.T_WAYRU_TOKEN_MINT,
            tokenStorageAuthority,
            true, // allowOwnerOffCurve for PDA
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("🎯 Token storage account:", tokenStorageAccount.toString());

        // Calculate program authority PDA
        const [programAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_authority")],
            program.programId
        );

        console.log("🎯 Program authority:", programAuthority.toString());

        // Calculate admin account PDA
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        console.log("🎯 Admin account PDA:", adminAccountPDA.toString());

        // Calculate NFNode entry PDA
        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
            program.programId
        );

        console.log("🎯 NFNode entry PDA:", nfnodeEntryPDA.toString());

        // Get fee receiving wallet from admin account
        const adminAccountInfo = await program.account.adminAccount.fetch(adminAccountPDA);
        const feeReceivingWallet = adminAccountInfo.feeReceivingWallet;

        // feeReceivingWallet is now the token account itself (not a wallet)
        const feeWalletTokenAccount = feeReceivingWallet;

        // Try to unstake
        try {
            console.log("🔧 Attempting to unstake...");

            const accounts = {
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
                programAuthority: programAuthority,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                tokenProgramSpl: TOKEN_PROGRAM_ID,
                associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
                systemProgram: new PublicKey('11111111111111111111111111111111'),
                feeReceivingWallet: feeWalletTokenAccount
            } as const;

            const tx = await program.methods.unstake()
                .accounts(accounts)
                .transaction();

            // Manually add the fee wallet token account as writable
            const feeWalletTokenAccountInfo = {
                pubkey: feeWalletTokenAccount,
                isSigner: false,
                isWritable: true
            };

            // Manually add the stake NFT mint as writable
            const stakeNftMintInfo = {
                pubkey: stakeNftMintPda,
                isSigner: false,
                isWritable: true
            };

            // Manually add the user stake NFT account as writable
            const userStakeNftAccountInfo = {
                pubkey: userStakeNftAccount,
                isSigner: false,
                isWritable: true
            };

            // Manually add the token storage account as writable
            const tokenStorageAccountInfo = {
                pubkey: tokenStorageAccount,
                isSigner: false,
                isWritable: true
            };

            // Manually add the user token account as writable
            const userTokenAccountInfo = {
                pubkey: userTokenAccount,
                isSigner: false,
                isWritable: true
            };

            // Add the accounts to the transaction
            tx.instructions[0].keys.push(feeWalletTokenAccountInfo);
            tx.instructions[0].keys.push(stakeNftMintInfo);
            tx.instructions[0].keys.push(userStakeNftAccountInfo);
            tx.instructions[0].keys.push(tokenStorageAccountInfo);
            tx.instructions[0].keys.push(userTokenAccountInfo);

            // Get latest blockhash and set it
            const latestBlockhash = await program.provider.connection.getLatestBlockhash({ commitment: "recent" });
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = user.publicKey;
            tx.sign(user);

            // Send and confirm transaction
            const txHash = await program.provider?.connection.sendRawTransaction(tx.serialize(), {
                skipPreflight: false,
                preflightCommitment: "confirmed",
            });

            console.log("✅ Unstake successful!");
            console.log("📝 Transaction signature:", txHash);

            // Check counter after unstake
            const entryAfterUnstake = await getNFTEntry(externalNftMint);
            console.log("📊 Counter after unstake:", entryAfterUnstake.stakeNftCounter.toString());
            console.log("📊 Local value locked after unstake:", entryAfterUnstake.localValueLocked.toString());

        } catch (error) {
            console.log("❌ Unstake failed:", error.message);

            if (error.message.includes("WithdrawTooEarly")) {
                console.log("⏰ UNSTAKING TOO EARLY: Must wait for the time period to pass");
            }

            if (error.message.includes("InsufficientNftBalance")) {
                console.log("🚫 INSUFFICIENT NFT BALANCE: User doesn't have the stake NFT");
            }

            if (error.message.includes("WithdrawAlreadyMade")) {
                console.log("✅ WITHDRAWAL ALREADY MADE: User has already unstaked");
            }

            throw error;
        }

    } catch (error) {
        console.error("Error unstaking:", error);
        throw error;
    }
}
