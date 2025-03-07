import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { AirdropsProgram } from "../types/AirdropsProgram";


interface Props {
    program: Program<AirdropsProgram>,
    adminKeypair: Keypair,
    pause: boolean
}
export const pauseUnpauseSystem = async (props: Props) => {
    const { program, adminKeypair, pause } = props;
    let tx = "";
    const [_adminAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_account")],
        program.programId
      );

      // pause unpause system
      if (pause) {
        tx = await program.methods
        .pauseProgram()
        .accounts({
          user: adminKeypair.publicKey,
      })
      .signers([adminKeypair])
      .rpc({ commitment: "confirmed" });
      } else {
        tx = await program.methods
        .unpauseProgram()
        .accounts({
          user: adminKeypair.publicKey,
        })
        .signers([adminKeypair])
        .rpc({ commitment: "confirmed" });
      }
    const programState = await program.account.adminAccount.fetch(
      _adminAccountPDA
    );
    console.log("Transaction =>", tx);
    console.log("Program state", programState); 
}