import { updateFeeWallet } from "../actions/update-fee-wallet";

async function main() {
    try {
        console.log("🔧 Updating Fee Wallet to Admin's ATA");

        // Update fee wallet to admin's associated token account (automatically calculated)
        await updateFeeWallet({});

        console.log("✅ Fee wallet update completed!");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
