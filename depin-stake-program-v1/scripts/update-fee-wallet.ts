import { PublicKey } from "@solana/web3.js";
import { updateFeeWallet } from "../actions/update-fee-wallet";

async function main() {
    try {
        console.log("🔧 Updating Fee Wallet");

        // New fee wallet address
        const newFeeWallet = new PublicKey("EWsaCs3fdR8zt26FRX2zum8Yui5DYqTzsawawKkG8gPL");

        await updateFeeWallet({
            newFeeWallet: newFeeWallet
        });

        console.log("✅ Fee wallet update completed!");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
