import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system"; // Tu IDL generado
import { getAdminKeypair } from "./keypair";
import { clusterApiUrl, Keypair } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { REWARD_SYSTEM_PROGRAM_ID } from "../constants";

export const getRewardSystemProgram = async (onlyRead?: boolean) => {
    const admin_keypair = getAdminKeypair()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(admin_keypair as unknown as anchor.web3.Keypair), // Type cast to anchor's Keypair
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(REWARD_SYSTEM_PROGRAM_ID);

    //only for devnet because it required fee
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL not found");

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<RewardSystem>;

    return program;
}

export const getRewardSystemProgramReadOnly = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Para solo lectura podemos usar una wallet vacía
    const provider = new anchor.AnchorProvider(
        connection,
        // Wallet vacía para operaciones de solo lectura
        new anchor.Wallet(Keypair.generate()),
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(REWARD_SYSTEM_PROGRAM_ID);

    //only for devnet because it required fee
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL not found");

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<RewardSystem>;

    return program;
}