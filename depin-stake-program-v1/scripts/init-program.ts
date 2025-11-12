import { initStakingProgram } from "../actions/init-program";

(async () => {
    await initStakingProgram();
    console.log("Program initialized successfully!");
    process.exit(0);
})();