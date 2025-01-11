import * as anchor from "@coral-xyz/anchor";
import { getRewardSystemProgram } from "./program";
import { getAdminKeypair } from "./keypar";

export async function initializeSystemIfNeeded() {
    try {
        const program = await getRewardSystemProgram();
        const adminKeypair = getAdminKeypair();

        // Obtener PDA para admin_account
        const [adminAccount] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // Verificar si el sistema ya está inicializado
        try {
            await program.account.adminAccount.fetch(adminAccount);
            console.log("Sistema ya inicializado");
            return;
        } catch (error) {
            console.log("Inicializando sistema...");
        }

        // Inicializar el sistema (igual que en los tests)
        await program.methods
            .initializeSystem()
            .accounts({
                user: adminKeypair.publicKey,
            })
            .signers([adminKeypair])
            .rpc();

        console.log("Sistema inicializado correctamente");
    } catch (error) {
        console.error("Error inicializando sistema:", error);
        throw error;
    }
} 