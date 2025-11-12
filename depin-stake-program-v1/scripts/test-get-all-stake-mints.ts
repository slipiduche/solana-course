import { PublicKey } from "@solana/web3.js";
import { getAllStakeNftMints } from "../helpers/program-entries";

async function main() {
    try {
        console.log("🧪 Testing getAllStakeNftMints...\n");

        const result = await getAllStakeNftMints(new PublicKey('9xB1p1YNvR3ARrEohE1b3c2KvGgjbgoB5f3eH3b1S9zZ'));

        console.log("\n📊 Results:");
        result.forEach(entry => {
            console.log('entry =>', entry);
        });

        console.log("\n✅ Test completed successfully!");
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

main();

