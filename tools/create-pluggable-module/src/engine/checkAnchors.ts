// (C) 2026 GoodData Corporation

import { existsSync, readFileSync } from "fs";
import { join } from "path";

import type { IRegistrationStep } from "../types.js";

import { fullAnchor } from "./anchors.js";

interface IMissingAnchor {
    file: string;
    suffix?: string;
    reason: string;
}

/**
 * Pre-flight check. Files edited by the scaffolder must already contain the
 * PLUGGABLE_APP_SCAFFOLD_ANCHOR comment (with the right suffix where applicable)
 * — otherwise the script would prompt the user, copy template files, and only
 * THEN fail mid-way leaving a half-scaffolded state. Bail before any of that
 * happens.
 *
 * Iterates over the profile's `registrations()` list — same list used by the
 * insertion pass, so the two cannot drift.
 */
export function checkAnchors(steps: readonly IRegistrationStep[], repoRoot: string): void {
    const missing: IMissingAnchor[] = [];

    for (const { file, suffix } of steps) {
        const fullPath = join(repoRoot, file);
        if (!existsSync(fullPath)) {
            missing.push({ file, suffix, reason: "file not found" });
            continue;
        }
        const content = readFileSync(fullPath, "utf-8");
        const needle = fullAnchor(suffix);
        if (!content.includes(needle)) {
            missing.push({ file, suffix, reason: `missing "${needle}" comment` });
        }
    }

    if (missing.length === 0) return;

    console.error("\n  Error: required PLUGGABLE_APP_SCAFFOLD_ANCHOR comments are missing.\n");
    console.error("  The scaffolder inserts new entries before an anchor comment in each file");
    console.error("  it touches. Without the anchor it cannot register the new pluggable app.\n");
    console.error("  Missing in:");
    for (const { file, suffix, reason } of missing) {
        const label = suffix ? `${file} (anchor "${suffix}")` : file;
        console.error(`    - ${label}: ${reason}`);
    }
    console.error(`\n  Each file needs a comment containing "PLUGGABLE_APP_SCAFFOLD_ANCHOR"`);
    console.error(`  (with the listed suffix in parentheses if applicable) at the line where new`);
    console.error(`  entries should be inserted. See an existing entry in any of the other anchor`);
    console.error(`  files for the exact comment format used in that file type.\n`);
    process.exit(1);
}
