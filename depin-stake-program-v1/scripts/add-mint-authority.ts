import { PublicKey } from "@solana/web3.js";
import { addMintAuthority } from "../actions/add-mint-authority";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";

(async () => {
    const admin = getDepinStakingAdminKeypair();
    const newMintAuthority = new PublicKey('8QMK1JHzjydq7qHgTo1RwK3ateLm4zVQF7V7BkriNkeD')
    await addMintAuthority({
        admin,
        newMintAuthority,
    });
    console.log("Mint authority added successfully!");
    process.exit(0);
})();