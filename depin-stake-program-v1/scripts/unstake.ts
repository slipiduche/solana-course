import { unstake } from "../actions/unstake";
import { getDepinStakingAdminKeypair, getUserKeyPair } from "../helpers/keypair";
import { TOKENS } from "../constants";

(async () => {
    try {
        console.log("🧪 TESTING UNSTAKE FUNCTIONALITY");
        console.log("📋 This test demonstrates the unstake functionality");
        console.log("");

        const user = getUserKeyPair("user3");
        const externalNftMint = TOKENS.NFNODE_1_MINT;

        console.log("🔧 Setup for unstake test:");
        console.log("   User:", user.publicKey.toString());
        console.log("   External NFT Mint:", externalNftMint.toString());
        console.log("");

        // Test unstake
        console.log("🔧 Attempting to unstake...");
        try {
            await unstake({
                user: user,
                externalNftMint: externalNftMint
            });
            console.log("✅ Unstake successful!");
        } catch (error) {
            console.log("❌ Unstake failed:", error.message);
        }

        console.log("");
        console.log("🎯 TEST RESULTS:");
        console.log("📋 Unstake test completed");

    } catch (error) {
        console.error("❌ Unstake test failed:", error);
        throw error;
    }
})();
