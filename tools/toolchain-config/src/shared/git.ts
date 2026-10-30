// (C) 2026 GoodData Corporation

import { execSync } from "node:child_process";

/**
 * Runs a shell command and returns its trimmed stdout, or `fallback` when it fails or prints nothing.
 */
export function tryExecSync(command: string, fallback: string): string {
    try {
        return execSync(command, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim() || fallback;
    } catch {
        return fallback;
    }
}

/**
 * The current git commit hash, falling back to `GIT_COMMIT` (set by CI checkouts without a `.git`)
 * and then to `dev`.
 */
export function gitCommitHash(fallback = process.env["GIT_COMMIT"] ?? "dev"): string {
    return tryExecSync("git rev-parse HEAD --quiet", fallback);
}
