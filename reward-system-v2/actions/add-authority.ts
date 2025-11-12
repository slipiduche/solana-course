import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { RewardSystem } from "../types/reward_system";
import { StakingProgram } from "../types/staking_program";

export async function addMintAuthority(
  program: Program<RewardSystem>,
  adminKeypair: Keypair,
  newMintAuthority: PublicKey,
  adminAccountPDA: PublicKey
) {
  try {
    await program.methods
      .addMintAuthority(newMintAuthority)
      .accounts({
        user: adminKeypair.publicKey,
      })
      .signers([adminKeypair])
      .rpc({ commitment: "confirmed" });

  } catch (error) {
    console.log('error:', error)
  }


  await new Promise((resolve) => setTimeout(resolve, 5000));
  let updated = false;
  let times = 0;
  while (!updated && times < 10) {
    try {
      const adminAccountState = await program.account.adminAccount.fetch(
        adminAccountPDA,
        "finalized"
      );
      const mintAuthorities = adminAccountState.mintAuthorities.map((mintAuthority) => mintAuthority.toBase58());
      updated = mintAuthorities.includes(newMintAuthority.toBase58());
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      times++;
    }
  }
}

export async function addMintAuthorityStaking(
  program: Program<RewardSystem>,
  adminKeypair: Keypair,
  newMintAuthority: PublicKey,
  adminAccountPDA: PublicKey
) {
  const tx = await program.methods
    .addMintAuthority(newMintAuthority)
    .accounts({
      user: adminKeypair.publicKey,
    })
    .transaction()

  const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();

  // Set transaction properties before signing
  tx.feePayer = adminKeypair.publicKey;
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.sign(adminKeypair);

  const txHash = await program.provider.connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    preflightCommitment: 'finalized',
    maxRetries: 5,
  });

  console.log("Transaction signature:", txHash);
  console.log("Mint authority added successfully");

  await new Promise((resolve) => setTimeout(resolve, 5000));
  let updated = false;
  let times = 0;
  while (!updated && times < 10) {
    try {
      const adminAccountState = await program.account.adminAccount.fetch(
        adminAccountPDA,
        "finalized"
      );
      console.log('adminAccountState:', adminAccountState?.mintAuthorities);
      const mintAuthorities = adminAccountState.mintAuthorities.map((mintAuthority) => mintAuthority.toBase58());
      updated = mintAuthorities.includes(newMintAuthority.toBase58());
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      times++;
    }
  }
}
