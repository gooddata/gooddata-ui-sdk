// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { claimAnalyticalDesignerRuntime, releaseAnalyticalDesignerRuntime } from "./mountGuard.js";

describe("mount guard", () => {
    afterEach(() => {
        releaseAnalyticalDesignerRuntime();
    });

    it("lets one instance claim the runtime at a time", () => {
        expect(claimAnalyticalDesignerRuntime()).toBe(true);
        expect(claimAnalyticalDesignerRuntime()).toBe(false);
    });

    it("lets the next instance claim the runtime after the release", () => {
        claimAnalyticalDesignerRuntime();
        releaseAnalyticalDesignerRuntime();

        expect(claimAnalyticalDesignerRuntime()).toBe(true);
    });
});
