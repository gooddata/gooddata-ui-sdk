// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { getTimeTracker } from "./time_tracker.js";

describe("time tracker", () => {
    afterEach(() => vi.clearAllMocks());

    it("should measure time between ticks", () => {
        vi.spyOn(global.Date, "now")
            .mockImplementationOnce(() => 100)
            .mockImplementationOnce(() => 140)
            .mockImplementationOnce(() => 200);

        const tick = getTimeTracker();
        expect(tick()).toEqual(40);
        expect(tick()).toEqual(60);
    });
});
