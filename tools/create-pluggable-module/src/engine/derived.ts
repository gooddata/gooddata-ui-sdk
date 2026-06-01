// (C) 2026 GoodData Corporation

import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Pure name transformations shared between profiles. No filesystem access —
 * these turn an `appName` into the conventionally-derived route, federation
 * name, and remote-URL env-var name.
 */

export function computeRoute(appName: string): string {
    return "/" + appName.replace(/^gdc-/, "");
}

/** Module Federation `name` must be a valid JS identifier. */
export function computeFederationName(appName: string): string {
    return appName.replaceAll("-", "_");
}

/**
 * Compile-time global name. Follows the existing host pattern
 * (HOME_UI_REMOTE_URL): strip "gdc-", uppercase, "-" → "_", add suffix.
 */
export function computeRemoteUrlEnvVar(appName: string): string {
    return appName.replace(/^gdc-/, "").replaceAll("-", "_").toUpperCase() + "_REMOTE_URL";
}

/**
 * Scans every harness vite.config.ts under <repoRoot>/modules/ (and apps/) for
 * the PORT default literal, returns the next available port. The harness port
 * vs module-federation preview port live in pairs separated by +100, hence the
 * +1 here (caller adds +100 for the federation port).
 *
 * `extraDirs` adds host-shaped directories beyond `modules/` to also scan —
 * gdc-ui includes `apps/` here, the lean repo passes nothing.
 */
export function computeDevPort(repoRoot: string, extraDirs: readonly string[] = []): number {
    // 8449 is the seed: gdc-sample-users sits at 8450; new apps start above it.
    let maxPort = 8449;

    const scanForHarnessPorts = (root: string, viteRelativePath: string): void => {
        if (!existsSync(root)) return;
        for (const entry of readdirSync(root, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const viteConfig = join(root, entry.name, viteRelativePath);
            if (!existsSync(viteConfig)) continue;
            const content = readFileSync(viteConfig, "utf-8");
            const portMatch = content.match(/["']PORT["']\]?\)?\s*\|\|\s*["'](\d+)["']/);
            if (portMatch) {
                const port = parseInt(portMatch[1], 10);
                if (port > maxPort) maxPort = port;
            } else {
                // The regex is tuned to the harness template shape
                // (`env["PORT"] || "NNNN"`). A miss usually means the harness
                // was hand-refactored — warn so the next scaffolded app's port
                // collision doesn't surprise the user at dev-server start time.
                console.warn(
                    `  Warning: could not detect port literal in ${viteConfig} — port collision possible.`,
                );
            }
        }
    };

    scanForHarnessPorts(join(repoRoot, "modules"), "harness/vite.config.ts");
    for (const extra of extraDirs) {
        scanForHarnessPorts(join(repoRoot, extra), "vite.config.ts");
    }

    return maxPort + 1;
}

/**
 * Returns this package's own version, read at runtime from its package.json.
 * Used by the client profile to stamp `workspace:*` SDK deps with a concrete
 * version that matches the SDK release this scaffolder shipped against.
 *
 * Resolved via import.meta.url so it works whether the engine runs from src/
 * (during local dev) or esm/ (after publish).
 */
export function getOwnPackageVersion(): string {
    const here = dirname(fileURLToPath(import.meta.url));
    // engine/derived.{ts,js} → src or esm, then up one more to package root.
    const pkgPath = join(here, "..", "..", "package.json");
    const raw = readFileSync(pkgPath, "utf-8");
    const parsed = JSON.parse(raw) as { version?: string };
    if (!parsed.version) {
        throw new Error(`create-pluggable-module package.json at ${pkgPath} has no "version" field.`);
    }
    return parsed.version;
}
