import { TOKENS } from "../constants";
import { getUserKeypair } from "../helpers/keypair";
import { getRewardSystemProgram } from "../helpers/program";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { withdrawTokens } from "../actions/withdraw-tokens";

const execute = async () => {
    try {
        // Inicializar programa y keypair del usuario
        const program = await getRewardSystemProgram();
        const userNftOwner = getUserKeypair();
        
        // Obtener direcciones de los tokens
        const nftMint = TOKENS.WAYRU.NFT_MINT_ADDRESS;
        const tokenMint = TOKENS.WAYRU.REWARD_TOKEN_MINT;


        console.log("Withdrawing tokens...");
        console.log("User:", userNftOwner.publicKey.toString());

        // Ejecutar el withdraw
        const signature = await withdrawTokens({
            program,
            userNftOwner,
            tokenMint,
            nftMint
        });

        console.log("Withdraw successful! Signature:", signature);

    } catch (error) {
        console.error("Error executing withdraw:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        process.exit(1);
    }
};

execute();