// (C) 2026 GoodData Corporation

import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "fs";
import { createRequire } from "module";
import { tmpdir } from "os";
import { dirname, join, relative } from "path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clientProfile } from "../../profiles/client.js";
import { BINARY_EXTENSIONS } from "../copyTemplate.js";
import { runProfileWithAnswers } from "../runProfile.js";

import { scrubPackageJsonVersions } from "./scrubPackageJsonVersions.js";

// Resolve workspace template paths via pnpm's symlinks. The template packages
// are devDependencies of @gooddata/create-pluggable-module — pnpm symlinks
// them into this package's node_modules in workspace mode. Probe target is
// `<pkg>/tsconfig.json` (template packages don't export `./package.json`).
const requireFromHere = createRequire(import.meta.url);
const WORKSPACE_TEMPLATE_ROOTS = {
    module: dirname(requireFromHere.resolve("gdc-app-template-name-module/tsconfig.json")),
    harness: dirname(requireFromHere.resolve("gdc-app-template-name-harness/tsconfig.json")),
};

/**
 * Walks a directory and returns a stable, sorted map of relative-path → file
 * content. Used to snapshot the entire scaffolded tree.
 */
function treeToMap(root: string): Record<string, string> {
    const out: Record<string, string> = {};
    function walk(dir: string): void {
        for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name),
        )) {
            const abs = join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(abs);
                continue;
            }
            const rel = relative(root, abs);
            // Binary files (images, fonts, cert fixtures) — record only their size so
            // changes surface in the snapshot without including raw bytes. Reuses the
            // engine's BINARY_EXTENSIONS so this list can never drift from copyTemplate.
            const ext = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
            if (BINARY_EXTENSIONS.has(ext)) {
                out[rel] = `<binary, ${statSync(abs).size} bytes>`;
                continue;
            }
            const raw = readFileSync(abs, "utf-8");
            out[rel] = entry.name === "package.json" ? scrubPackageJsonVersions(raw) : raw;
        }
    }
    walk(root);
    return out;
}

describe("snapshot: client profile end-to-end scaffold", () => {
    let testRoot: string;

    beforeEach(() => {
        testRoot = mkdtempSync(join(tmpdir(), "scaff-snapshot-"));
        // Silence the scaffolder's console output during tests.
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        rmSync(testRoot, { recursive: true, force: true });
        vi.restoreAllMocks();
    });

    it("produces a deterministic scaffold (client profile, fresh non-rush dir)", async () => {
        // Two overrides on the client profile for snapshot purposes:
        //   1. postCopy: client profile would otherwise try to run `npm install` —
        //      irrelevant to the file-tree snapshot.
        //   2. preferWorkspaceTemplate: hermetic source selection. The engine's
        //      default is "use dist/templates/ if it exists, else workspace" —
        //      which silently flips the test's source depending on whether anyone
        //      ran prepack on this machine. Force workspace so the snapshot is
        //      reproducible from a clean checkout.
        const profileForSnapshot = {
            ...clientProfile,
            preferWorkspaceTemplate: true,
            // Engine refuses to resolve workspace templates without explicit roots —
            // supply the require.resolve-derived paths.
            templateSubtreeRoots: WORKSPACE_TEMPLATE_ROOTS,
            postCopy: async () => {
                // no-op — snapshot only cares about the produced file tree
            },
        };

        await runProfileWithAnswers(
            profileForSnapshot,
            {
                appName: "gdc-snap-test",
                title: "Snapshot Test",
                scope: "workspace",
                maintainer: "team@gooddata.com",
            },
            {
                repo: {
                    repoRoot: testRoot,
                    packageManager: "npm",
                },
                steps: [], // no registration anchors needed in a non-rush dir
            },
        );

        const tree = treeToMap(join(testRoot, "modules", "gdc-snap-test"));
        expect(tree).toMatchSnapshot();
    });
});
