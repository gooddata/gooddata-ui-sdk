// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IUiAbsoluteDateFilterForm,
    type IUiAbsoluteGranularityDateFilterForm,
} from "../interfaces/index.js";

import {
    dateFilterValueToPeriodRange,
    dateRangeToDateFilterValue,
    periodRangeToAbsoluteGranularityForm,
    periodRangeToDateFilterValue,
    switchAbsoluteFormTab,
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

    it("writes day granularity", () => {
        expect(
            periodRangeToDateFilterValue({
                range,
                localIdentifier: "ABS",
                isTimeForAbsoluteRangeEnabled: false,
            }),
        ).toMatchObject({ type: "absoluteForm", granularity: "GDC.time.date" });
    });
});

describe("dateFilterValueToPeriodRange of whole periods", () => {
    it("passes the period literals through", () => {
        const option: IUiAbsoluteGranularityDateFilterForm = {
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteGranularityForm",
            name: "",
            visible: true,
            granularity: "GDC.time.week",
            from: "2026-07",
            to: "2026-09",
        };
        expect(dateFilterValueToPeriodRange(option)).toEqual({ from: "2026-07", to: "2026-09" });
    });
});

describe("periodRangeToAbsoluteGranularityForm", () => {
    it("writes the period literals with their granularity", () => {
        expect(
            periodRangeToAbsoluteGranularityForm(
                { from: "2026-04", to: "2026-06" },
                "GDC.time.month",
                "ABS",
                "exclude",
            ),
        ).toEqual({
            type: "absoluteGranularityForm",
            localIdentifier: "ABS",
            name: "",
            visible: true,
            granularity: "GDC.time.month",
            from: "2026-04",
            to: "2026-06",
            emptyValueHandling: "exclude",
        });
    });
});

describe("switchAbsoluteFormTab", () => {
    const dayOption: IUiAbsoluteDateFilterForm = {
        ...baseOption,
        from: "2026-04-01",
        to: "2026-04-30",
        emptyValueHandling: "include",
    };

    it("switches days to the empty week option, keeping the identity and empty value handling", () => {
        expect(switchAbsoluteFormTab(dayOption, "GDC.time.week_us")).toEqual({
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteGranularityForm",
            name: "",
            visible: true,
            granularity: "GDC.time.week",
            emptyValueHandling: "include",
        });
    });

    it("switches whole periods to the empty day option", () => {
        const monthOption = switchAbsoluteFormTab(dayOption, "GDC.time.month");
        expect(
            switchAbsoluteFormTab({ ...monthOption, from: "2026-04", to: "2026-05" }, "GDC.time.date"),
        ).toEqual({
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteForm",
            name: "",
            visible: true,
            granularity: "GDC.time.date",
            emptyValueHandling: "include",
        });
    });
});
