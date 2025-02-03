import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../types/reward_system";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import { Transaction } from "@solana/web3.js";

interface UpdateNfnodeProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userKeypair: Keypair;
    newHostKeypair: Keypair;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    nfnodeEntryPDA: PublicKey;
}

export const updateNfnode = async ({
    program,
    adminKeypair,
    userKeypair,
    newHostKeypair,
    nftMint,
    userNFTTokenAccount,
    nfnodeEntryPDA
}: UpdateNfnodeProps) => {
    try {
        console.log("\n=== Updating NFNode ===");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("User:", userKeypair.publicKey.toString());
        console.log("New Host (User2):", newHostKeypair.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());

        // Obtener estado actual para comparar
        const currentState = await program.account.nfNodeEntry.fetch(
            nfnodeEntryPDA
        );
        console.log("\n=== Current State ===");
        console.log("Current Host:", currentState.host.toString());
        console.log("Current Host Share:", currentState.hostShare.toNumber());

        // 1. Crear y firmar la transacción por el admin
        const transaction = await program.methods
            .updateNfnode(new BN(50))
            .accounts({
                userAdmin: adminKeypair.publicKey,
                user: userKeypair.publicKey,
                host: newHostKeypair.publicKey,
                nftMintAddress: nftMint,
                userNftTokenAccount: userNFTTokenAccount,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            })
            .transaction(); // Usar .transaction() en lugar de .rpc()

        // Firmar con el admin
        transaction.sign(adminKeypair);

        // Serializar la transacción
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false // Permitir serialización sin todas las firmas
        });

        // 2. Deserializar y firmar por el usuario
        const deserializedTransaction = Transaction.from(serializedTransaction);
        deserializedTransaction.partialSign(userKeypair);

        // Enviar la transacción
        const tx = await program.provider.connection.sendRawTransaction(
            deserializedTransaction.serialize()
        );

        console.log("Transaction Hash:", tx);

        // Verificar actualización
        const updatedState = await program.account.nfNodeEntry.fetch(
            nfnodeEntryPDA
        );

        console.log("\n=== Updated State ===");
        console.log("New Host:", updatedState.host.toString());
        console.log("New Host Share:", updatedState.hostShare.toNumber());

        // Validaciones
        if (updatedState.host.toBase58() !== newHostKeypair.publicKey.toBase58()) {
            throw new Error("Host update failed: new host does not match");
        }

        if (updatedState.hostShare.toNumber() !== 50) {
            throw new Error("Host share update failed: new share is not 50");
        }

        console.log("NFNode updated successfully!");
        
        return updatedState;
    } catch (error) {
        console.error("\nError updating NFNode:", error);
        throw error;
    }
}; 