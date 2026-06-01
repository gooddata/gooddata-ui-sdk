// (C) 2026 GoodData Corporation

import { spawnSync } from "child_process";

import type { PackageManager } from "../types.js";

/**
 * Runs `<command> <args>` synchronously, inheriting stdio so the user sees the
 * output as it streams. Returns true on exit code 0, false otherwise — the
 * caller decides whether to surface the failure as fatal or as a hint in the
 * "Next steps" message.
 */
export function runCommand(command: string, args: readonly string[], cwd: string): boolean {
    const result = spawnSync(command, [...args], {
        cwd,
        stdio: "inherit",
        // Rush on Windows ships as `rush.cmd`; without shell:true spawnSync can't find it.
        shell: process.platform === "win32",
    });
    return result.status === 0;
}

/** Returns the install command for a given package manager. */
export function installCommand(pm: PackageManager): { command: string; args: string[] } {
    switch (pm) {
        case "rush":
            return { command: "rush", args: ["update"] };
        case "pnpm":
            return { command: "pnpm", args: ["install"] };
        case "yarn":
            return { command: "yarn", args: ["install"] };
        case "npm":
            return { command: "npm", args: ["install"] };
    }
}
