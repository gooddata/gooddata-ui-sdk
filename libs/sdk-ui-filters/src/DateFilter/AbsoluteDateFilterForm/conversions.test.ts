// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import { dateFilterValueToPeriodRange, periodRangeToDateFilterValue } from "./conversions.js";

const baseOption: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    name: "",
    visible: true,
};

describe("dateFilterValueToPeriodRange", () => {
    it("strips the time-of-day suffix the classic time-enabled picker needs but PeriodRangePicker doesn't", () => {
        expect(
            dateFilterValueToPeriodRange({ ...baseOption, from: "2026-07-31 00:00", to: "2026-08-31 23:59" }),
        ).toEqual({ from: "2026-07-31", to: "2026-08-31" });
    });

    it("passes an already day-only value through unchanged", () => {
        expect(dateFilterValueToPeriodRange({ ...baseOption, from: "2026-07-31", to: "2026-08-31" })).toEqual(
            {
                from: "2026-07-31",
                to: "2026-08-31",
            },
        );
    });

    it("leaves missing dates undefined", () => {
        expect(dateFilterValueToPeriodRange({ ...baseOption, from: undefined, to: undefined })).toEqual({
            from: undefined,
            to: undefined,
        });
    });
});

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
