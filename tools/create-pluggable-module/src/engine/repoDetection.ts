// (C) 2026 GoodData Corporation

import { existsSync } from "fs";
import { join, resolve } from "path";

import type { IRepoInfo, PackageManager } from "../types.js";

/**
 * Walks from `startDir` upward looking for a marker file. Returns the directory
 * containing the marker, or undefined if reached the filesystem root without
 * finding it. Used to locate `rush.json` from any subdir within a Rush monorepo.
 */
export function findUp(startDir: string, marker: string): string | undefined {
    let dir = resolve(startDir);
    while (true) {
        if (existsSync(join(dir, marker))) return dir;
        const parent = resolve(dir, "..");
        if (parent === dir) return undefined;
        dir = parent;
    }
}

/**
 * Detects the repo shape from `cwd`. The result drives:
 * - which postCopy command runs (rush update vs npm install vs ...)
 * - whether profiles register in rush.json
 * - the absolute `repoRoot` that other engine steps anchor against.
 *
 * Precedence: rush.json wins (Rush monorepos always have a lockfile too).
 * Otherwise, pick the package manager from whichever lockfile exists. Falls
 * back to `npm` for fresh repos with no lockfile yet.
 */
export function detectRepo(cwd: string): IRepoInfo {
    const rushRoot = findUp(cwd, "rush.json");
    if (rushRoot) {
        return { repoRoot: rushRoot, packageManager: "rush" };
    }

    const repoRoot = resolve(cwd);
    const packageManager = detectPackageManager(repoRoot);
    return { repoRoot, packageManager };
}

function detectPackageManager(repoRoot: string): PackageManager {
    if (existsSync(join(repoRoot, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(repoRoot, "yarn.lock"))) return "yarn";
    // package-lock.json or no lockfile at all → default to npm. A scaffolder
    // running in a fresh empty repo can still invoke `npm install` afterwards.
    return "npm";
}
