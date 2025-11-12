import { clusterApiUrl } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { getDepinStakingAdminKeypair } from "./keypair";
import { DEPIN_STAKING_PROGRAM_ID } from "../constants";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DepinStake } from "../types/depin_stake";

export const getDepinStakingProgram = async () => {
    const admin_keypair = getDepinStakingAdminKeypair()

    const connection = new Connection('https://devnet.helius-rpc.com/?api-key=1cbf706a-696d-4a73-b201-816bdb44f39b', "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(admin_keypair as unknown as anchor.web3.Keypair), // Type cast to anchor's Keypair
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(DEPIN_STAKING_PROGRAM_ID);

    //only for devnet because it required fee
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL not found");

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<DepinStake>;

    return program;
}
