import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system"; // Tu IDL generado
import { getAdminKeypair } from "./keypair";
import { clusterApiUrl, Keypair } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { AIRDROP_PROGRAM_ID, REWARD_SYSTEM_PROGRAM_ID, REWARD_SYSTEM_PROGRAM_ID_MAINNET, REWARD_SYSTEM_PROGRAM_ID_V2, STAKING_PROGRAM_ID } from "../constants";
import { AirdropsProgram } from "../types/airdrops_program";
import { StakingProgram } from "../types/staking_program";
import { BoostStake } from "../types/boost_stake";

const CUSTOM_ENDPOINT = `https://mainnet.helius-rpc.com/?api-key=f1447b45-dbed-4220-bbea-64acb04b3404`;
const CUSTOM_ENDPOINT_DEVNET = `https://devnet.helius-rpc.com/?api-key=1cbf706a-696d-4a73-b201-816bdb44f39b`;
export const getRewardSystemProgram = async (onlyRead?: boolean) => {
    const admin_keypair = getAdminKeypair()

    const connection = new Connection(CUSTOM_ENDPOINT_DEVNET, "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(admin_keypair as unknown as anchor.web3.Keypair), // Type cast to anchor's Keypair
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(REWARD_SYSTEM_PROGRAM_ID_V2);

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

    const programId = new anchor.web3.PublicKey(REWARD_SYSTEM_PROGRAM_ID_V2);

    //only for devnet because it required fee
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL not found");

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<RewardSystem>;

    return program;
}

export const getAirdropProgram = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(Keypair.generate()),
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(AIRDROP_PROGRAM_ID);

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<AirdropsProgram>;

    return program;
}

export const getStakingProgram = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(Keypair.generate()),
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(STAKING_PROGRAM_ID);

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<StakingProgram>;

    return program;
}

export const getBoostStakeProgram = async () => {
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(Keypair.generate()),
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey('2W41afA7PC45mmmbDfsBanKr2s4ac8EPJLrL1DKdxLj9');

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<BoostStake>;

    return program;
}