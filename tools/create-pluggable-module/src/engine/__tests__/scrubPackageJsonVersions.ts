// (C) 2026 GoodData Corporation

/**
 * Replace dep/SDK version strings in a scaffolded package.json with the
 * placeholder `<VERSION>`. Walks the JSON tree (rather than regex-matching
 * raw text) so it only touches `version` and values inside the dep maps —
 * `description`, URLs, `engines`, etc. stay verbatim.
 *
 * Re-serializes with the same 4-space indent + trailing newline the scaffolder
 * itself writes (runProfile.ts), so the output is byte-identical to the
 * scaffolded file except for the scrubbed slots.
 *
 * Lives outside `*.test.ts` so vitest's auto-discovery doesn't re-run callers
 * as duplicate tests; both `snapshot.test.ts` and `scrubPackageJsonVersions.test.ts`
 * import it.
 */

const DEP_MAPS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

export function scrubPackageJsonVersions(content: string): string {
    const pkg = JSON.parse(content) as Record<string, unknown>;
    if (typeof pkg["version"] === "string") {
        pkg["version"] = "<VERSION>";
    }
    for (const key of DEP_MAPS) {
        const deps = pkg[key];
        if (deps && typeof deps === "object" && !Array.isArray(deps)) {
            const depsRecord = deps as Record<string, unknown>;
            for (const dep of Object.keys(depsRecord)) {
                if (typeof depsRecord[dep] === "string") {
                    depsRecord[dep] = "<VERSION>";
                }
            }
        }
    }
    return JSON.stringify(pkg, null, 4) + "\n";
}
