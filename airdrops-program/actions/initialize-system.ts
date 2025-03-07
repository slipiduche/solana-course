import { PublicKey } from "@solana/web3.js";
import { AirdropsProgram } from "../types/AirdropsProgram";
import { Keypair } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

interface Props {
    program: Program<AirdropsProgram>,
    adminKeypair: Keypair,
    tokenMint: PublicKey,
}
export const initializeAirdropsSystem = async (props: Props) => {
    const { program, adminKeypair, tokenMint } = props;

    // get program data address
    const [programDataAddress] = PublicKey.findProgramAddressSync(
        [program.programId.toBuffer()],
        new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    );

    // initialize system
   const tx = await program.methods
        .initializeSystem()
        .accounts({
            user: adminKeypair.publicKey,
            programData: programDataAddress,
            tokenMint,
            mintAuthority: adminKeypair.publicKey
        })
        .signers([adminKeypair])
        .rpc({ commitment: 'confirmed' });
    console.log("Airdrops system initialized successfully", tx);
}