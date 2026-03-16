// (C) 2021-2026 GoodData Corporation

import { execSync } from "child_process";

export function runOxfmtOnFile(filePath) {
    execSync(`oxfmt '${filePath}'`, { stdio: "inherit" });
}
