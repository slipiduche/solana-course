import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { RewardSystem } from "../types/reward_system";
import { BN } from "bn.js";

interface InitializeNfnodeProps {
    program: Program<RewardSystem>;
    adminKeypair: Keypair;
    userNftOwner: Keypair;
    nftMint: PublicKey;
    userNFTTokenAccount: PublicKey;
    nfnodeEntryPDA: PublicKey;
    host: Keypair;
    manufacturer: Keypair;
}

export const initializeNfnode = async ({
    program,
    adminKeypair,
    userNftOwner,
    nftMint,
    userNFTTokenAccount,
    nfnodeEntryPDA,
    host,
    manufacturer
}: InitializeNfnodeProps) => {
    try {
        console.log("Initializing NFNode...");
        console.log("Admin:", adminKeypair.publicKey.toString());
        console.log("User:", userNftOwner.publicKey.toString());
        console.log("NFT Mint:", nftMint.toString());
        console.log("NFNode Entry PDA:", nfnodeEntryPDA.toString());
        const nonce = new BN(Date.now());

        // Crear la transacción sin enviarla
        const tx = await program.methods
            .initializeNfnode(nonce)
            .accounts({
                userAdmin: adminKeypair.publicKey,
                user: userNftOwner.publicKey,
                nftMintAddress: nftMint,
                host: host.publicKey,
                manufacturer: manufacturer.publicKey,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                userNftTokenAccount: userNFTTokenAccount,
            })
            .transaction(); // Usar .transaction() en lugar de .rpc()

        // Firma del admin
        tx.partialSign(adminKeypair);
        console.log("Admin has signed the transaction");

        // Firma del usuario
        tx.partialSign(userNftOwner);
        console.log("User has signed the transaction");

        // Enviar la transacción
        const signature = await program.provider.connection.sendRawTransaction(tx.serialize());
        await program.provider.connection.confirmTransaction(signature, "confirmed");

        console.log("Transaction sent:", signature);
        
        // Esperar 5 segundos después de la confirmación
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        // Verificar que el nodo se haya inicializado correctamente
        let nfnodeData = false;
        let times = 0;
        
        while (!nfnodeData && times < 10) {
            try {
                const nfnodeState = await program.account.nfNodeEntry.fetch(
                    nfnodeEntryPDA,
                    "finalized"
                );
                nfnodeData = nfnodeState.host.toBase58().length > 0;
            } catch (error) {
                console.log(`Attempt ${times + 1}/10: Waiting for account data...`);
                await new Promise((resolve) => setTimeout(resolve, 10000));
                times++;
            }
        }

        if (!nfnodeData) {
            throw new Error("Failed to verify NFNode initialization after multiple attempts");
        }

        console.log("NFNode initialized and verified successfully!");
        console.log("Transaction signature:", signature);
        console.log("View transaction: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
        
        return signature;
    } catch (error) {
        console.error("Error initializing NFNode:", error);
        throw error;
    }
}; 