// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { computeFederationName, computeRemoteUrlEnvVar, computeRoute } from "../derived.js";

describe("computeRoute", () => {
    it("strips the gdc- prefix and prepends a slash", () => {
        expect(computeRoute("gdc-foo")).toBe("/foo");
    });

    it("preserves internal hyphens", () => {
        expect(computeRoute("gdc-foo-bar-baz")).toBe("/foo-bar-baz");
    });

    it("handles single-segment names", () => {
        expect(computeRoute("gdc-x")).toBe("/x");
    });
});

describe("computeFederationName", () => {
    it("converts hyphens to underscores so the result is a valid JS identifier", () => {
        expect(computeFederationName("gdc-foo-bar")).toBe("gdc_foo_bar");
    });

    it("preserves the gdc_ prefix (no leading-prefix stripping here)", () => {
        expect(computeFederationName("gdc-x")).toBe("gdc_x");
    });
});

describe("computeRemoteUrlEnvVar", () => {
    it("strips gdc-, uppercases, and adds the _REMOTE_URL suffix", () => {
        expect(computeRemoteUrlEnvVar("gdc-foo")).toBe("FOO_REMOTE_URL");
    });

    it("converts internal hyphens to underscores", () => {
        expect(computeRemoteUrlEnvVar("gdc-foo-bar")).toBe("FOO_BAR_REMOTE_URL");
    });
});
