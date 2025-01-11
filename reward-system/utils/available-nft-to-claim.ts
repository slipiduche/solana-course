import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "./program";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { USER_PRIVATE_SEED } from "./constants";
import { getKeypair } from "../../helpers/getKeyPair";

export async function checkAvailableNFTs() {
    try {
        console.log("\n=== Verificando NFTs Token-2022 disponibles para claim ===");
        const program = await getRewardSystemProgram();
        const userPublicKey = getKeypair(USER_PRIVATE_SEED).publicKey;
        console.log("User Public Key:", userPublicKey.toString());
        
        // 1. Obtener todas las cuentas token-2022 del usuario
        const tokenAccounts = await program.provider.connection.getParsedTokenAccountsByOwner(
            userPublicKey,
            { programId: TOKEN_2022_PROGRAM_ID }
        );

        console.log(`\nEncontradas ${tokenAccounts.value.length} cuentas token-2022`);

        const nftList: any[] = [];

        // 2. Filtrar solo NFTs (cantidad = 1)
        for (const tokenAccount of tokenAccounts.value) {
            const accountInfo = tokenAccount.account.data.parsed.info;
            const amount = accountInfo.tokenAmount.uiAmount;
            const mint = new PublicKey(accountInfo.mint);

            if (amount === 1) {
                // 3. Verificar si ya se hizo claim hoy
                const [rewardEntry] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("reward_entry"),
                        userPublicKey.toBuffer(),
                        mint.toBuffer()
                    ],
                    program.programId
                );

                let lastClaimTime = 0;
                try {
                    const rewardEntryAccount = await program.account.rewardEntry.fetch(rewardEntry);
                    lastClaimTime = rewardEntryAccount.lastClaimedTimestamp.toNumber();
                } catch (e) {
                    // Si no existe la cuenta, nunca se ha hecho claim
                }

                const currentDay = Math.floor(Date.now() / 86400000);
                const lastClaimDay = Math.floor(lastClaimTime / 86400);
                const canClaimToday = currentDay > lastClaimDay;

                nftList.push({
                    mint: mint.toString(),
                    tokenAccount: tokenAccount.pubkey.toString(),
                    lastClaimTime: lastClaimTime ? new Date(lastClaimTime * 1000).toLocaleString() : 'Nunca',
                    canClaimToday
                });
            }
        }

        // 4. Mostrar resultados
        if (nftList.length === 0) {
            console.log("\n❌ No se encontraron NFTs Token-2022");
        } else {
            console.log(`\n✅ Se encontraron ${nftList.length} NFTs Token-2022:`);
            nftList.forEach((nft, index) => {
                console.log(`\nNFT #${index + 1}:`);
                console.log("Mint:", nft.mint);
                console.log("Token Account:", nft.tokenAccount);
                console.log("Último claim:", nft.lastClaimTime);
                console.log("Puede reclamar hoy:", nft.canClaimToday ? "✅ Sí" : "❌ No");
            });
        }

        return nftList;

    } catch (error) {
        console.error("Error verificando NFTs:", error);
        throw error;
    }
}