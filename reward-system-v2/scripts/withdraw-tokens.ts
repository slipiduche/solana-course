import { TOKENS } from "../constants";
import { getUserKeypair } from "../helpers/keypair";
import { getRewardSystemProgram, getStakingProgram } from "../helpers/program";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { depositTokens, withdrawTokens } from "../actions/withdraw-tokens";
import { PublicKey } from "@solana/web3.js";
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

const executeDeposit = async () => {
    try {
        // Inicializar programa y keypair del usuario
        const program = await getStakingProgram();
        const userNftOwner = getUserKeypair();

        // Obtener direcciones de los tokens
        const nftMint = new PublicKey('D5PLQFVu5mtPV9z9Dmv7KnZ7MXCaA8voXJLMSdAFH8MA')
        const tokenMint = TOKENS.WAYRU.T_WAYRU_TOKEN_MINT;

        console.log("Depositing tokens...");
        console.log("User:", userNftOwner.publicKey.toString());

        // Ejecutar el deposit
        const signature = await depositTokens({
            program,
            userNftOwner,
            tokenMint,
            nftMint
        });

        console.log("Deposit successful! Signature:", signature);

    } catch (error) {
        console.error("Error executing deposit:", error);
        if (error.logs) {
            console.error("Transaction logs:", error.logs);
        }
        process.exit(1);
    }
};

executeDeposit();