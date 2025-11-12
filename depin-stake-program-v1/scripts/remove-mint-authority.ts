import { removeMintAuthority } from "../actions/remove-mint-authority";
import { getDepinStakingAdminKeypair, getUserKeyPair } from "../helpers/keypair";


(async () => {
    const admin = getDepinStakingAdminKeypair();
    const user = getUserKeyPair('user1');
    await removeMintAuthority({
        admin,
        user,
    });
    console.log("Mint authority removed successfully!");
    process.exit(0);
})();