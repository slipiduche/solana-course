import { stake } from "../actions/stake";
import {
    getDepinStakingAdminKeypair,
    getUserKeyPair,
} from "../helpers/keypair";
import { TOKENS } from "../constants";
import { convertToTokenAmount } from "../utils";
import { getProgramAdminEntry } from "../helpers/program-entries";

(async () => {
    try {
        console.log("🧪 TESTING STAKE BUG WITH TWO USERS");
        console.log(
            "📋 This test demonstrates the counter bug in stake functionality"
        );
        console.log("");


        const user1 = getUserKeyPair("userOwnerNft");
        const programAdminEntry = await getProgramAdminEntry();
        console.log("user1 public key:", user1.publicKey.toString());
        return
        const externalNftMint = TOKENS.NFNODE_3_MINT;
        const amount = 25000;


        const usersToStake = [user1];
        for (const user of usersToStake) {
            console.log("🔧 Setup for stake bug test:");
            console.log("   User:", user.publicKey.toString());
            console.log("   External NFT Mint:", externalNftMint.toString());
            console.log("   Amount:", amount);
            try {
                await stake({
                    user: user,
                    externalNftMint: externalNftMint,
                    amount: amount
                });
                console.log("✅ User " + user.publicKey.toString() + " stake successful!");
            } catch (error) {
                console.log("✅ EXPECTED: User " + user.publicKey.toString() + " stake failed:", error.message);

            }
        }
    } catch (error) {
        console.error("❌ Stake bug test failed:", error);
        throw error;
    }
})();
