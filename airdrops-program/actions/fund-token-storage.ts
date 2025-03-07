import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction, Connection, clusterApiUrl } from "@solana/web3.js";
import { AirdropsProgram } from "../types/AirdropsProgram";
import { BN } from "bn.js";
import { 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction, 
    TOKEN_PROGRAM_ID,
    getAccount
} from "@solana/spl-token";


interface Props {
    program: Program<AirdropsProgram>,
    adminKeypair: Keypair,
    tokenOwnerKeypair: Keypair,
    tokenMint: PublicKey,
    amount: number
}
export const fundTokenStorage = async (props: Props) => {
    const { program, tokenOwnerKeypair, tokenMint, amount } = props;
    console.log("amount => ", amount);

    // Create connection to devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Derive PDAs
    const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_storage")],
        program.programId
    );

    // Get the token storage account (which should be an ATA)
    const tokenStorageAccount = await getAssociatedTokenAddress(
        tokenMint,
        tokenStorageAuthority,
        true // allowOwnerOffCurve: true para permitir PDAs como propietarios
    );

    // Get the token owner's ATA
    const userTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        tokenOwnerKeypair.publicKey
    );

    // Check if ATA exists and get balance
    try {
        const accountInfo = await connection.getAccountInfo(userTokenAccount);
        if (!accountInfo) {
            console.log("Creating ATA account...");
            const createAtaIx = createAssociatedTokenAccountInstruction(
                tokenOwnerKeypair.publicKey,
                userTokenAccount,
                tokenOwnerKeypair.publicKey,
                tokenMint
            );
            const createAtaTx = new Transaction().add(createAtaIx);
            createAtaTx.feePayer = tokenOwnerKeypair.publicKey;
            createAtaTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            
            createAtaTx.sign(tokenOwnerKeypair);
            const signature = await connection.sendRawTransaction(
                createAtaTx.serialize(),
                { skipPreflight: false, preflightCommitment: 'confirmed' }
            );
            console.log("ATA account created", signature);
        }

        // Check token balance
        const tokenAccount = await getAccount(connection, userTokenAccount);
        console.log("Current token balance:", tokenAccount.amount.toString());
        
        if (BigInt(tokenAccount.amount.toString()) < BigInt(amount)) {
            throw new Error(`Insufficient token balance. Required: ${amount}, Available: ${tokenAccount.amount}`);
        }

    } catch (error) {
        console.error("Error checking/creating ATA or checking balance:", error);
        throw error;
    }
    
    // prepare accounts params
    const accounts = {
        user: tokenOwnerKeypair.publicKey,
        tokenMint,
        tokenStorageAuthority,
        tokenStorageAccount,
        userTokenAccount,
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: new PublicKey("11111111111111111111111111111111"),
    } as const;

    // fund token storage
    const tx = await program.methods
    .fundTokenStorage(new BN(amount))
    .accounts(accounts)
    .signers([tokenOwnerKeypair])
    .rpc({ commitment: "confirmed" });
    console.log("Token storage funded successfully", tx);
}