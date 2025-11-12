import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getDepinStakingProgram } from "../helpers/program";
import { TOKENS } from "../constants";
import { getNFTEntry } from "../helpers/program-entries";
import { BN } from "bn.js";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { getWalletTokenStakeBalanceSPL } from "../helpers/wallet-nft";
import { convertToTokenAmount } from "../utils";

interface StakeProps {
    user: Keypair;
    externalNftMint: PublicKey;
    amount: number;
}

export const stake = async ({ user, externalNftMint, amount }: StakeProps) => {
    try {
        // check if the user has enough tokens to stake
        const program = await getDepinStakingProgram();
        const tokenStakeBalance = await getWalletTokenStakeBalanceSPL({
            walletAddress: user.publicKey,
            connectionProps: program.provider.connection
        });
        if (tokenStakeBalance < amount) {
            console.log("❌ User does not have enough tokens to stake");
            console.log("user wallet has: ", tokenStakeBalance);
            console.log("amount to stake: ", amount);
            return;
        }

        console.log("🔧 Starting stake operation...");

        // Check current counter
        const nfnodeEntry = await getNFTEntry(externalNftMint);
        const currentCounter = nfnodeEntry.stakeNftCounter;
        console.log("📊 Current counter:", currentCounter.toString());

        // Find existing stake NFT mint by checking previous counters
        let stakeNftMintPda: PublicKey | null = null;
        let foundCounter = -1;

        // Check if there's an existing mint by trying previous counters
        for (let counter = currentCounter; counter >= 0; counter--) {
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

        // If no existing mint found, create new one with current counter
        if (!stakeNftMintPda) {
            const counterBuffer = Buffer.alloc(8);
            counterBuffer.writeUInt32LE(currentCounter, 0);

            const [mintPda] = PublicKey.findProgramAddressSync([
                Buffer.from("stake_nft_mint"),
                externalNftMint.toBuffer(),
                counterBuffer
            ], program.programId);

            stakeNftMintPda = mintPda;
            foundCounter = currentCounter;
            console.log("🎯 Will create new stake NFT mint (counter " + currentCounter + "):", mintPda.toString());
        }

        // Calculate user's stake NFT token account (using standard token program)
        const userStakeNftAccount = getAssociatedTokenAddressSync(
            stakeNftMintPda,
            user.publicKey,
            false, // allowOwnerOffCurve
            TOKEN_PROGRAM_ID, // Use standard TOKEN_PROGRAM_ID
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("🎯 User stake NFT account:", userStakeNftAccount.toString());

        // Calculate deposit entry PDA (following the test guide)
        const [depositEntryPDA] = PublicKey.findProgramAddressSync([
            Buffer.from("deposit_entry"),
            externalNftMint.toBuffer(),
            stakeNftMintPda.toBuffer(),
        ], program.programId);

        console.log("🎯 Deposit entry PDA:", depositEntryPDA.toString());

        // Get connection once
        const connection = program.provider.connection;

        // Check if stake NFT mint already exists
        console.log("🔍 Checking if stake NFT mint exists...");
        const mintAccountInfo = await connection.getAccountInfo(stakeNftMintPda);
        console.log("📊 Stake NFT mint exists:", mintAccountInfo ? "YES" : "NO");
        console.log("📊 Using counter:", foundCounter);

        // Only create stake NFT mint if it doesn't exist
        if (!mintAccountInfo) {
            console.log("🔧 Creating stake NFT mint...");
            try {
                const createStakeNftTx = await program.methods.initStakeNft()
                    .accounts({
                        user: user.publicKey,
                        externalNftMint: externalNftMint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: new PublicKey('11111111111111111111111111111111')
                    } as any)
                    .signers([user])
                    .rpc({
                        commitment: 'confirmed',
                        skipPreflight: false
                    });

                console.log("✅ Stake NFT mint created successfully!");
                console.log("📝 Create stake NFT mint transaction:", createStakeNftTx);

                // Wait a bit for the stake NFT mint to be created
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Now mint the stake NFT to the user
                console.log("🔧 Minting stake NFT to user...");
                const mintStakeNftTx = await program.methods.mintStakeNft()
                    .accounts({
                        user: user.publicKey,
                        externalNftMint: externalNftMint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        stakeNftMint: stakeNftMintPda
                    } as any)
                    .signers([user])
                    .rpc({
                        commitment: 'confirmed',
                        skipPreflight: false
                    });

                console.log("✅ Stake NFT minted successfully!");
                console.log("📝 Mint stake NFT transaction:", mintStakeNftTx);

                // Wait a bit for the stake NFT to be minted
                await new Promise((resolve) => setTimeout(resolve, 2000));

            } catch (createError) {
                console.log("❌ Stake NFT creation/minting failed:", createError.message);
                throw createError;
            }
        } else {
            console.log("✅ Stake NFT mint already exists, proceeding with stake...");
            console.log("📋 Reusing existing stake NFT mint for additional stake");

            // Check if user has the stake NFT
            console.log("🔍 Checking if user has the stake NFT...");
            const userTokenAccountInfo = await connection.getAccountInfo(userStakeNftAccount);
            console.log("📊 User has stake NFT:", userTokenAccountInfo ? "YES" : "NO");

            if (!userTokenAccountInfo) {
                console.log("⚠️ User doesn't have the stake NFT - minting it...");
                try {
                    const mintStakeNftTx = await program.methods.mintStakeNft()
                        .accounts({
                            user: user.publicKey,
                            externalNftMint: externalNftMint,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            stakeNftMint: stakeNftMintPda
                        } as any)
                        .signers([user])
                        .rpc({
                            commitment: 'confirmed',
                            skipPreflight: false
                        });

                    console.log("✅ Stake NFT minted successfully!");
                    console.log("📝 Mint stake NFT transaction:", mintStakeNftTx);

                    // Wait a bit for the stake NFT to be minted
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                } catch (mintError) {
                    console.log("❌ Stake NFT minting failed:", mintError.message);
                    throw mintError;
                }
            } else {
                console.log("✅ User already has the stake NFT, proceeding with stake...");
            }
        }

        // Now try to stake
        try {
            // Wait a bit as in the test
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Calculate admin account PDA
            const [adminAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("admin_account")],
                program.programId
            );

            // Calculate NFNode entry PDA
            const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("nfnode_entry"), externalNftMint.toBuffer()],
                program.programId
            );

            // Get fee receiving wallet from admin account
            const adminAccountInfo = await program.account.adminAccount.fetch(adminAccountPDA);
            const feeReceivingWallet = adminAccountInfo.feeReceivingWallet;

            console.log("💰 Fee receiving wallet:", feeReceivingWallet.toString());
            console.log("👤 User wallet:", user.publicKey.toString());

            // Calculate additional required accounts
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
                true, // allowOwnerOffCurve for PDA
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const [programAuthority] = PublicKey.findProgramAddressSync([
                Buffer.from("program_authority")
            ], program.programId);

            // Calculate fee wallet token account
            const feeWalletTokenAccount = getAssociatedTokenAddressSync(
                TOKENS.T_WAYRU_TOKEN_MINT,
                feeReceivingWallet,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );


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
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenProgramSpl: TOKEN_PROGRAM_ID,
                associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
                systemProgram: new PublicKey('11111111111111111111111111111111'),
                feeReceivingWallet: feeWalletTokenAccount
            } as const;

            // Create the transaction with explicit account specification
            const tx = await program.methods.stake(new BN(convertToTokenAmount(amount)))
                .accounts(accounts)
                .transaction();

            // Manually add the fee wallet token account as writable
            const feeWalletTokenAccountInfo = {
                pubkey: feeWalletTokenAccount,
                isSigner: false,
                isWritable: true
            };

            // Add the account to the transaction
            tx.instructions[0].keys.push(feeWalletTokenAccountInfo);

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

            console.log("✅ Stake successful!");
            console.log("📝 Transaction signature:", txHash);

            // Check counter after stake
            const entryAfterStake = await getNFTEntry(externalNftMint);
            console.log("📊 Counter after stake:", entryAfterStake.stakeNftCounter.toString());

            if (entryAfterStake.stakeNftCounter === currentCounter) {
                console.log("🐛 BUG CONFIRMED: Counter did not increment!");
            } else {
                console.log("✅ Counter incremented correctly");
            }

        } catch (error) {
            console.log("❌ Stake failed:", error.message);

            if (error.message.includes("already in use")) {
                console.log("🚨 COLLISION DETECTED: Account already exists!");
                console.log("📋 This proves the counter bug prevents proper staking");
            }

            throw error;
        }

    } catch (error) {
        console.error("Error staking:", error);
        throw error;
    }
}