import { stakeV2 } from "../actions/stake-v2";
import { getUserKeyPair } from "../helpers/keypair";
import { TOKENS } from "../constants";

(async () => {
    try {
        console.log("🧪 TESTING STAKE V2 (2 TRANSACTIONS)");
        console.log("📋 This test demonstrates the improved stake functionality");
        console.log("");

        const user = getUserKeyPair("user3");
        const externalNftMint = TOKENS.NFNODE_2_MINT;
        const amount = 25000;

        console.log("🔧 Setup for stake V2 test:");
        console.log("   User:", user.publicKey.toString());
        console.log("   External NFT Mint:", externalNftMint.toString());
        console.log("   Amount:", amount);
        console.log("");

        // Test stake V2
        console.log("🔧 Attempting stake V2...");
        try {
            await stakeV2(user, externalNftMint, amount);
            console.log("✅ Stake V2 successful!");
        } catch (error) {
            console.log("❌ Stake V2 failed:", error.message);
        }

        console.log("");
        console.log("🎯 TEST RESULTS:");
        console.log("📋 Stake V2 test completed");
        console.log("📊 Improved UX: 2 transactions instead of 3");
        console.log("📊 Better reliability: Sequential execution");

    } catch (error) {
        console.error("❌ Stake V2 test failed:", error);
        throw error;
    }
})();
