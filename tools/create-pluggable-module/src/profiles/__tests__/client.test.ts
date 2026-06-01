// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IProfileContext, IRepoInfo } from "../../types.js";
import { clientProfile } from "../client.js";

function mockCtx(overrides: Partial<IProfileContext> = {}): IProfileContext {
    return {
        answers: { appName: "gdc-mock", title: "Mock", scope: "workspace" },
        derived: {
            route: "/mock",
            federationName: "gdc_mock",
            remoteUrlEnvVar: "MOCK_REMOTE_URL",
            devPort: 8500,
            moduleDevPort: 8600,
            menuOrder: 100,
        },
        repoRoot: "/fake/repo",
        destRoot: "/fake/repo/modules/gdc-mock",
        packageManager: "npm",
        ...overrides,
    };
}

describe("clientProfile", () => {
    it("declares the expected templateSubtrees in dep-aware order", () => {
        // harness imports from module → module must build first
        expect(clientProfile.templateSubtrees).toEqual(["module", "harness"]);
    });

    it("does not prefer workspace templates (would leak workspace tsconfig paths to clients)", () => {
        expect(clientProfile.preferWorkspaceTemplate ?? false).toBe(false);
    });

    describe("buildReplacements", () => {
        const replacements = clientProfile.buildReplacements(mockCtx());
        const map = Object.fromEntries(replacements);

        it("substitutes -module and -harness package names BEFORE the bare app name (longer-first ordering)", () => {
            const keys = replacements.map(([k]) => k);
            const idxBare = keys.indexOf("gdc-app-template-name");
            const idxModule = keys.indexOf("gdc-app-template-name-module");
            expect(idxModule).toBeLessThan(idxBare);
        });

        it("provides every template token used in scaffolded files", () => {
            expect(map["gdc-app-template-name"]).toBe("gdc-mock");
            expect(map["gdc-app-template-name-module"]).toBe("gdc-mock-module");
            expect(map["gdc-app-template-name-harness"]).toBe("gdc-mock-harness");
            expect(map["{applicationTemplateTitle}"]).toBe("Mock");
            expect(map["{applicationTemplateScope}"]).toBe("workspace");
            expect(map["{applicationTemplateFederationName}"]).toBe("gdc_mock");
            expect(map["APP_TEMPLATE_REMOTE_URL"]).toBe("MOCK_REMOTE_URL");
            expect(map["/app-template-route"]).toBe("/mock");
            expect(map["{harnessPort}"]).toBe("8500");
            expect(map["{modulePort}"]).toBe("8600");
        });

        it("strips the gdc-ui internal clean-command-state.sh prefix (helper not present in client repos)", () => {
            expect(map["../../../../common/scripts/clean-command-state.sh && "]).toBe("");
        });

        it("does NOT carry the internal workspace-path depth adjustment (only the internal profile owns that)", () => {
            // The 4→3 depth shift only makes sense inside gdc-ui where `common/`
            // exists at the repo root. For clients, no depth shift can rescue
            // the missing helper — strip the call instead (asserted above).
            expect(map["../../../../common/"]).toBeUndefined();
        });
    });

    describe("resolveDestRoot", () => {
        it("uses modules/<appName> when destPath is not overridden", () => {
            const destRoot = clientProfile.resolveDestRoot(
                { appName: "gdc-x", title: "X", scope: "workspace" },
                "/fake/repo",
            );
            expect(destRoot).toBe("/fake/repo/modules/gdc-x");
        });

        it("accepts an in-cwd destPath override", () => {
            const destRoot = clientProfile.resolveDestRoot(
                { appName: "gdc-x", title: "X", scope: "workspace", destPath: "apps/gdc-x" },
                "/fake/repo",
            );
            expect(destRoot).toBe("/fake/repo/apps/gdc-x");
        });

        it("rejects path-traversal destPath that resolves outside cwd", () => {
            expect(() =>
                clientProfile.resolveDestRoot(
                    {
                        appName: "gdc-x",
                        title: "X",
                        scope: "workspace",
                        destPath: "../../../etc",
                    },
                    "/fake/repo",
                ),
            ).toThrow(/resolves outside the current directory/);
        });

        it("rejects an absolute destPath outside cwd", () => {
            expect(() =>
                clientProfile.resolveDestRoot(
                    {
                        appName: "gdc-x",
                        title: "X",
                        scope: "workspace",
                        destPath: "/somewhere/else",
                    },
                    "/fake/repo",
                ),
            ).toThrow(/resolves outside the current directory/);
        });

        it("does NOT confuse a cwd-prefix-overlap (e.g. `/fake/repo-other`) as inside cwd", () => {
            expect(() =>
                clientProfile.resolveDestRoot(
                    {
                        appName: "gdc-x",
                        title: "X",
                        scope: "workspace",
                        destPath: "../repo-other/sub",
                    },
                    "/fake/repo",
                ),
            ).toThrow(/resolves outside the current directory/);
        });
    });

    describe("registrations", () => {
        it("registers in rush.json when target repo IS a Rush monorepo", () => {
            const steps = clientProfile.registrations({
                repoRoot: "/tmp",
                packageManager: "rush",
            } satisfies IRepoInfo);
            expect(steps.map((s) => s.file)).toEqual(["rush.json"]);
        });

        it("does NOT register anywhere when target repo is not Rush (purely additive scaffold)", () => {
            const steps = clientProfile.registrations({
                repoRoot: "/tmp",
                packageManager: "npm",
            } satisfies IRepoInfo);
            expect(steps).toEqual([]);
        });
    });

    describe("transformPackageJson", () => {
        it("rewrites workspace:* deps to concrete versions", () => {
            const after = clientProfile.transformPackageJson(
                {
                    dependencies: {
                        "@gooddata/sdk-ui": "workspace:*",
                        lodash: "^4.17.23",
                    },
                },
                mockCtx(),
            );
            const deps = after["dependencies"] as Record<string, string>;
            expect(deps["@gooddata/sdk-ui"]).not.toBe("workspace:*");
            expect(deps.lodash).toBe("^4.17.23"); // non-workspace deps untouched
        });

        it("preserves workspace:* for the just-scaffolded siblings (they have no published version yet)", () => {
            const after = clientProfile.transformPackageJson(
                {
                    dependencies: {
                        "gdc-mock-module": "workspace:*",
                        "gdc-mock-harness": "workspace:*",
                        "@gooddata/sdk-ui": "workspace:*",
                    },
                },
                mockCtx(),
            );
            const deps = after["dependencies"] as Record<string, string>;
            // sibling refs stay workspace:* — rush/pnpm/yarn workspaces resolve them locally
            expect(deps["gdc-mock-module"]).toBe("workspace:*");
            expect(deps["gdc-mock-harness"]).toBe("workspace:*");
            // SDK deps still get a concrete version
            expect(deps["@gooddata/sdk-ui"]).not.toBe("workspace:*");
        });

        it("strips _phase:* scripts (Rush-only, would break in non-Rush repos)", () => {
            const after = clientProfile.transformPackageJson(
                {
                    scripts: {
                        "_phase:build": "npm run build",
                        build: "tsc",
                        test: "vitest",
                    },
                },
                mockCtx(),
            );
            const scripts = after["scripts"] as Record<string, string>;
            expect(scripts["_phase:build"]).toBeUndefined();
            expect(scripts.build).toBe("tsc");
            expect(scripts.test).toBe("vitest");
        });
    });
});
