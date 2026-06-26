// (C) 2026 GoodData Corporation

// Injection test: any NEW src/model or src/presentation/filterBar import added to the shared
// automationFilters layer that is NOT in the frozen exact-file carve-out list in
// .dependency-cruiser.js will make this test fail, blocking the PR in CI.
// Before adding a new entry to that list, confirm it is legitimate GDP-3167 Phase-3 debt and
// document it with a Phase-3 note next to the entry.

import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import { describe, expect, it } from "vitest";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../");
const AUTOMATION_FILTERS = "src/presentation/automations/shared/automationFilters";

describe("automationFilters dep-cruiser boundary (GDP-3167 Phase-3 debt freeze)", () => {
    it("frozen exact-file carve-out list covers all model/filterBar imports — no new coupling", () => {
        // Validate only the automationFilters subtree against the package rules.
        // Exit 0 = every dependency is within the frozen carve-out list. Non-zero = a new
        // unlisted src/model or src/presentation/filterBar import was introduced.
        const result = spawnSync(
            "node_modules/.bin/depcruise",
            [
                "--validate",
                ".dependency-cruiser.js",
                "--output-type",
                "err",
                "--focus",
                AUTOMATION_FILTERS,
                AUTOMATION_FILTERS,
            ],
            { cwd: PACKAGE_ROOT, encoding: "utf-8" },
        );

        expect(
            result.status,
            `automationFilters imports a module outside the frozen carve-out list — add it to the ` +
                `automationFilters allowlist in .dependency-cruiser.js (with a GDP-3167 Phase-3 note) ` +
                `only if it is legitimate debt:\n${result.stdout ?? ""}${result.stderr ?? ""}`,
        ).toBe(0);
    });
});
