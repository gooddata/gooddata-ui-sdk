// (C) 2021-2022 GoodData Corporation

import { execSync } from "child_process";

export function runPrettierOnFile(filePath) {
    execSync(`prettier --write '${filePath}'`, { stdio: "inherit" });
}
