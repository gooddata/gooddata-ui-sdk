// (C) 2021-2025 GoodData Corporation
import fs from "fs";

import { log } from "@gooddata/fixtures";

export function deleteVariableFromEnv(envVariableName, envFilePath) {
    if (!fs.existsSync(envFilePath)) {
        log(`Env file ${envFilePath} does not exist, skipping to remove test workspace from there\n`);
        return;
    }

    const envFileContent = fs.readFileSync(envFilePath, "utf-8");
    const newEnvFileContent = envFileContent
        .split("\n")
        .filter((line) => line.indexOf(envVariableName) === -1)
        .join("\n");

    log(`Removing ${envVariableName} from the .env file\n`);
    fs.writeFileSync(envFilePath, newEnvFileContent);
}
