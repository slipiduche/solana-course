import { updateFeeAmount } from "../actions/update-fee-amount";
import { convertToTokenAmount } from "../utils";

async function main() {
    try {
        console.log("🔧 Updating Fee Amount");

        // New fee amount (in lamports/tokens)
        const newFeeAmount = 10; // charge 10 tokens for each stake/unstake

        await updateFeeAmount({
            newFeeAmount: convertToTokenAmount(newFeeAmount)
        });

        console.log("✅ Fee amount update completed!");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
