// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { periodRangeToDateFilterValue } from "./conversions.js";

describe("periodRangeToDateFilterValue", () => {
    const range = { from: "2026-04-01", to: "2026-04-30" };

    it("keeps bare dates when time is not enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: false,
            }),
        ).toMatchObject({ from: "2026-04-01", to: "2026-04-30" });
    });

    it("extends to start/end of day when time is enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
            }),
        ).toMatchObject({ from: "2026-04-01 00:00", to: "2026-04-30 23:59" });
    });

    it("extends to start/end of day with seconds when seconds are enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
                isSecondsForAbsoluteRangeEnabled: true,
            }),
        ).toMatchObject({ from: "2026-04-01 00:00:00", to: "2026-04-30 23:59:59" });
    });

    it("leaves undefined from/to untouched", () => {
        expect(
            periodRangeToDateFilterValue({
                range: {},
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
            }),
        ).toMatchObject({ from: undefined, to: undefined });
    });
});
