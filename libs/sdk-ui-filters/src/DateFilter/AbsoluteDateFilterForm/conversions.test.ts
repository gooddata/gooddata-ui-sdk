// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import {
    dateFilterValueToPeriodRange,
    dateRangeToDateFilterValue,
    periodRangeToDateFilterValue,
} from "./conversions.js";

const baseOption: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    name: "",
    visible: true,
};

describe("dateRangeToDateFilterValue", () => {
    it("writes day granularity", () => {
        expect(
            dateRangeToDateFilterValue(
                { from: new Date(2026, 3, 5), to: new Date(2026, 5, 30) },
                "ABS",
                false,
            ),
        ).toMatchObject({ from: "2026-04-05", to: "2026-06-30", granularity: "GDC.time.date" });
    });
});

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
                granularity: "GDC.time.date",
            }),
        ).toMatchObject({ from: "2026-04-01", to: "2026-04-30" });
    });

    it("extends to start/end of day when time is enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
                granularity: "GDC.time.date",
            }),
        ).toMatchObject({ from: "2026-04-01 00:00", to: "2026-04-30 23:59" });
    });

    it("extends to start/end of day with seconds when seconds are enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
                granularity: "GDC.time.date",
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
                granularity: "GDC.time.date",
            }),
        ).toMatchObject({ from: undefined, to: undefined });
    });

    it("keeps bare days at month granularity even when time is enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range: { from: "2026-04-01", to: "2026-04-30" },
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
                granularity: "GDC.time.month",
            }),
        ).toMatchObject({ from: "2026-04-01", to: "2026-04-30" });
    });

    it("keeps bare days at week granularity even when seconds are enabled", () => {
        expect(
            periodRangeToDateFilterValue({
                range: { from: "2026-04-01", to: "2026-04-30" },
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: true,
                granularity: "GDC.time.week_us",
                isSecondsForAbsoluteRangeEnabled: true,
            }),
        ).toMatchObject({ from: "2026-04-01", to: "2026-04-30" });
    });

    it("carries the granularity of the period picker", () => {
        expect(
            periodRangeToDateFilterValue({
                range: { from: "2026-03-30", to: "2026-04-12" },
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: false,
                granularity: "GDC.time.week_us",
            }),
        ).toMatchObject({ granularity: "GDC.time.week_us" });
    });
});
