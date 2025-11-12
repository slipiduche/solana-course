import { getDepinStakingProgram } from "../helpers/program";
import { PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { TOKENS } from "../constants";
import BN from "bn.js";

async function checkStakeStatus() {
    try {
        console.log("🔍 Checking Stake Status...");

        const program = await getDepinStakingProgram();
        const connection = program.provider.connection;

        // Check NFNode entry
        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), TOKENS.NFNODE_1_MINT.toBuffer()],
            program.programId
        );

        const nfnodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
        console.log("📊 NFNode Entry:");
        console.log("  - Local Value Locked:", nfnodeEntry.localValueLocked.toString());
        console.log("  - Stake NFT Counter:", nfnodeEntry.stakeNftCounter.toString());

        // Check stake NFT mint
        const [stakeNftMintPDA] = PublicKey.findProgramAddressSync([
            Buffer.from("stake_nft_mint"),
            TOKENS.NFNODE_1_MINT.toBuffer(),
            Buffer.from(new BN(nfnodeEntry.stakeNftCounter.toNumber() - 1).toArray('le', 8))
        ], program.programId);

        console.log("🎯 Stake NFT Mint (counter 0):", stakeNftMintPDA.toString());

        // Check if user has the NFT
        const user = new PublicKey("FbPi5HfmEnyZN4fbPj5erN5qTZcsfKgHuJvPCDB7Ezci");
        const { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token');

        const userStakeNftAccount = getAssociatedTokenAddressSync(
            stakeNftMintPDA,
            user,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log("👤 User Stake NFT Account:", userStakeNftAccount.toString());

        try {
            const userNftAccount = await getAccount(connection, userStakeNftAccount);
            console.log("📊 User NFT Balance:", userNftAccount.amount.toString());
            console.log("✅ User has the stake NFT!");
        } catch (error) {
            console.log("❌ User does not have the stake NFT");
            console.log("   This is expected - the NFT was created but not transferred to user");
        }

        // Check deposit entry
        const [depositEntryPDA] = PublicKey.findProgramAddressSync([
            Buffer.from("deposit_entry"),
            TOKENS.NFNODE_1_MINT.toBuffer(),
            stakeNftMintPDA.toBuffer()
        ], program.programId);

        try {
            const depositEntry = await program.account.depositEntry.fetch(depositEntryPDA);
            console.log("📊 Deposit Entry:");
            console.log("  - Deposit Amount:", depositEntry.depositAmount.toString());
            console.log("  - Deposit Timestamp:", depositEntry.depositTimestamp.toString());
        } catch (error) {
            console.log("❌ Deposit entry not found");
        }

    } catch (error) {
        console.error("❌ Error checking stake status:", error);
    }
}

checkStakeStatus();
