import { updateAdmin } from "../actions/update-admin";
import { getDepinStakingAdminKeypair } from "../helpers/keypair";
import { acceptAdmin } from "../actions/accept-admin";

(async () => {
    const admin = getDepinStakingAdminKeypair();
    const newAdmin = getDepinStakingAdminKeypair("new");
    await updateAdmin({
        admin,
        newAdmin,
    });
    console.log("Admin updated successfully!");

    // accept admin request
    await acceptAdmin({
        newAdmin,
    });
    console.log("Admin request accepted successfully!");
    process.exit(0);
})();
