import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "./program";

export async function getTokenStoragePDA() {
    const program = await getRewardSystemProgram();
    const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_storage")],
        program.programId
    );
    console.log("PDA para token_storage:", tokenStorageAuthority.toString());
    return tokenStorageAuthority;
} 