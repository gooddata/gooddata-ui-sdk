// (C) 2026 GoodData Corporation

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * The monorepo root: the nearest ancestor of `start` holding a `rush.json`. Resolved from the current
 * working directory rather than from this file, because an injected copy of this package lives under
 * `common/temp` and cannot reach the repo by a relative path of its own.
 */
export function findRepoRoot(start = process.cwd()): string {
    let dir = resolve(start);

    for (;;) {
        if (existsSync(join(dir, "rush.json"))) {
            return dir;
        }

        const parent = dirname(dir);
        if (parent === dir) {
            throw new Error(`No rush.json found in ${start} or any of its parent directories`);
        }
        dir = parent;
    }
}

/**
 * The `name` of the package whose config is being loaded, read from the package.json in `dir`.
 */
export function readPackageName(dir = process.cwd()): string {
    const packageJsonPath = join(dir, "package.json");
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: string };

    if (!pkg.name) {
        throw new Error(`${packageJsonPath} has no "name" field`);
    }

    return pkg.name;
}
