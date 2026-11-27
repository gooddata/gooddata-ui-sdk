// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

const clearInsightViewCachesSpy = vi.fn();

vi.mock("@gooddata/sdk-ui-ext", () => ({
    clearInsightViewCaches: clearInsightViewCachesSpy,
}));

describe("clearCaches", () => {
    it("should clear the insight view caches", async () => {
        const { clearCaches } = await import("./clearCaches.js");

        await clearCaches();

        expect(clearInsightViewCachesSpy).toHaveBeenCalledTimes(1);
    });
});
