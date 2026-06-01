// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { scrubPackageJsonVersions } from "./scrubPackageJsonVersions.js";

/**
 * Direct tests for the package.json version-scrubber used by the snapshot test.
 * The scrubber's contract:
 *   1. Replaces top-level `version` with "<VERSION>".
 *   2. Replaces every string value inside the four dep maps with "<VERSION>".
 *   3. Leaves everything else alone — descriptions, URLs, engines, repository,
 *      author, etc. — even when those strings happen to contain an X.Y.Z
 *      substring.
 *
 * Without these tests the scrubber's correctness is only inferred from the
 * full snapshot, which would also pass if the function quietly over-matched.
 */
describe("scrubPackageJsonVersions", () => {
    function scrubAndParse(pkg: Record<string, unknown>): Record<string, unknown> {
        return JSON.parse(scrubPackageJsonVersions(JSON.stringify(pkg, null, 4) + "\n")) as Record<
            string,
            unknown
        >;
    }

    it("scrubs the top-level version field", () => {
        const out = scrubAndParse({ name: "x", version: "1.2.3-alpha.0" });
        expect(out["version"]).toBe("<VERSION>");
    });

    it("scrubs every entry in dependencies, devDependencies, peerDependencies, optionalDependencies", () => {
        const out = scrubAndParse({
            dependencies: { react: "19.1.1", "@gooddata/sdk-ui": "workspace:*" },
            devDependencies: { vite: "^8.0.0" },
            peerDependencies: { typescript: ">=5.0.0" },
            optionalDependencies: { fsevents: "2.3.3" },
        });
        expect((out["dependencies"] as Record<string, unknown>)["react"]).toBe("<VERSION>");
        expect((out["dependencies"] as Record<string, unknown>)["@gooddata/sdk-ui"]).toBe("<VERSION>");
        expect((out["devDependencies"] as Record<string, unknown>)["vite"]).toBe("<VERSION>");
        expect((out["peerDependencies"] as Record<string, unknown>)["typescript"]).toBe("<VERSION>");
        expect((out["optionalDependencies"] as Record<string, unknown>)["fsevents"]).toBe("<VERSION>");
    });

    it("does NOT scrub a description containing an X.Y.Z substring (regression: this is what the old regex broke on)", () => {
        const out = scrubAndParse({
            name: "x",
            description: "Works against the GoodData API v2.5.1 endpoint",
        });
        expect(out["description"]).toBe("Works against the GoodData API v2.5.1 endpoint");
    });

    it("does NOT scrub a URL containing a version-shaped path segment", () => {
        const out = scrubAndParse({
            name: "x",
            homepage: "https://example.com/docs/v1.2.3/intro",
            repository: { type: "git", url: "https://github.com/foo/bar/tree/v3.4.5" },
        });
        expect(out["homepage"]).toBe("https://example.com/docs/v1.2.3/intro");
        expect((out["repository"] as Record<string, unknown>)["url"]).toBe(
            "https://github.com/foo/bar/tree/v3.4.5",
        );
    });

    it("does NOT scrub engines (different drift cadence; informative to surface in snapshots)", () => {
        const out = scrubAndParse({ engines: { node: ">=24.12.0" } });
        expect((out["engines"] as Record<string, unknown>)["node"]).toBe(">=24.12.0");
    });

    it("does NOT scrub author / name / license / type fields", () => {
        const out = scrubAndParse({
            name: "my-pkg",
            author: "Acme",
            license: "MIT",
            type: "module",
        });
        expect(out["name"]).toBe("my-pkg");
        expect(out["author"]).toBe("Acme");
        expect(out["license"]).toBe("MIT");
        expect(out["type"]).toBe("module");
    });

    it("survives missing / non-object dep maps without throwing", () => {
        expect(() => scrubPackageJsonVersions(JSON.stringify({ name: "x" }))).not.toThrow();
        // dep maps deliberately wrong shape — should not crash, just skip.
        expect(() =>
            scrubPackageJsonVersions(JSON.stringify({ name: "x", dependencies: null })),
        ).not.toThrow();
    });

    it("emits 4-space indent + trailing newline (matches what the scaffolder itself writes)", () => {
        const raw = scrubPackageJsonVersions(JSON.stringify({ name: "x", version: "1.0.0" }));
        expect(raw.endsWith("\n")).toBe(true);
        expect(raw).toContain('\n    "name"');
    });
});
