// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IRelativeDateFilterPreset } from "@gooddata/sdk-model";

import { type DateFilterOption } from "../interfaces/index.js";

import {
    applyExcludeCurrentPeriod,
    canExcludeCurrentPeriod,
    excludeCurrentPeriodFromRange,
    revertExcludedCurrentPeriodRange,
} from "./PeriodExclusion.js";

describe("canExcludeCurrentPeriod", () => {
    it.each([
        [
            false,
            "allTime",
            {
                type: "allTime",
                name: "filters.allTime.title",
                localIdentifier: "ALL_TIME",
                visible: true,
            },
        ],
        [
            true,
            "relativePreset ending in today",
            {
                from: -29,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "LAST_30_DAYS",
                visible: true,
            },
        ],
        [
            false,
            "invisible relativePreset ending in today",
            {
                from: -29,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "LAST_30_DAYS",
                visible: false,
            },
        ],
        [
            false,
            "relativePreset not ending in today",
            {
                from: -29,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "FOO",
                visible: true,
            },
        ],
        [
            false,
            "relativePreset ending for just today",
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "TODAY",
                visible: true,
            },
        ],
        [
            false,
            "relativeForm",
            {
                from: -299,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativeForm",
                localIdentifier: "RELATIVE_FORM",
                visible: true,
            },
        ],
        [
            false,
            "absoluteForm",
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absoluteForm",
                localIdentifier: "ABSOLUTE_FORM",
                visible: true,
            },
        ],
        [
            false,
            "absolutePreset",
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absolutePreset",
                localIdentifier: "FOO",
                visible: true,
            },
        ],
    ])("should return %p for %s", (expected: boolean, _, input: any) => {
        const actual = canExcludeCurrentPeriod(input);
        expect(actual).toEqual(expected);
    });
});

describe("applyExcludeCurrentPeriod", () => {
    it("should do nothing when passed excludeCurrentPeriod: false", () => {
        const input: IRelativeDateFilterPreset = {
            from: -29,
            to: 0,
            granularity: "GDC.time.date",
            type: "relativePreset",
            name: "filters.last30days.title",
            localIdentifier: "LAST_30_DAYS",
            visible: true,
        };
        const actual = applyExcludeCurrentPeriod(input, false);
        expect(actual).toEqual(input);
    });

    const Scenarios: Array<[string, DateFilterOption, DateFilterOption]> = [
        [
            "allTime",
            {
                type: "allTime",
                name: "filters.allTime.title",
                localIdentifier: "ALL_TIME",
                visible: true,
            },
            {
                type: "allTime",
                name: "filters.allTime.title",
                localIdentifier: "ALL_TIME",
                visible: true,
            },
        ],
        [
            "relativePreset ending in today",
            {
                from: -29,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "LAST_30_DAYS",
                visible: true,
            },
            {
                from: -30,
                to: -1,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "",
                localIdentifier: "LAST_30_DAYS",
                visible: true,
            },
        ],
        [
            "relativePreset not ending in today",
            {
                from: -29,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "FOO",
                visible: true,
            },
            {
                from: -29,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "FOO",
                visible: true,
            },
        ],
        [
            "relativePreset ending for just today",
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "TODAY",
                visible: true,
            },
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.date",
                type: "relativePreset",
                name: "filters.last30days.title",
                localIdentifier: "TODAY",
                visible: true,
            },
        ],
        [
            "relativeForm",
            {
                from: -299,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativeForm",
                localIdentifier: "RELATIVE_FORM",
                visible: true,
                name: "",
            },
            {
                from: -299,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativeForm",
                localIdentifier: "RELATIVE_FORM",
                visible: true,
                name: "",
            },
        ],
        [
            "absoluteForm",
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absoluteForm",
                localIdentifier: "ABSOLUTE_FORM",
                name: "",
                visible: true,
            },
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absoluteForm",
                localIdentifier: "ABSOLUTE_FORM",
                name: "",
                visible: true,
            },
        ],
        [
            "absolutePreset",
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absolutePreset",
                localIdentifier: "FOO",
                name: "",
                visible: true,
            },
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absolutePreset",
                localIdentifier: "FOO",
                name: "",
                visible: true,
            },
        ],
    ];

    it.each(Scenarios)(
        "should handle %s properly",
        (_, input: DateFilterOption, expected: DateFilterOption) => {
            const actual = applyExcludeCurrentPeriod(input, true);
            expect(actual).toEqual(expected);
        },
    );
});

describe("excludeCurrentPeriodFromRange", () => {
    it("shifts a current-period-ending range back by one period", () => {
        expect(excludeCurrentPeriodFromRange({ from: -29, to: 0 }, true)).toEqual({ from: -30, to: -1 });
        expect(excludeCurrentPeriodFromRange({ from: -1, to: 0 }, true)).toEqual({ from: -2, to: -1 });
    });

    it("leaves the range untouched when exclusion is off or does not apply", () => {
        // flag off
        expect(excludeCurrentPeriodFromRange({ from: -29, to: 0 }, false)).toEqual({ from: -29, to: 0 });
        // does not end in the current period (to !== 0)
        expect(excludeCurrentPeriodFromRange({ from: -29, to: 10 }, true)).toEqual({ from: -29, to: 10 });
        // single current period (from === to === 0) cannot exclude itself
        expect(excludeCurrentPeriodFromRange({ from: 0, to: 0 }, true)).toEqual({ from: 0, to: 0 });
    });
});

describe("revertExcludedCurrentPeriodRange", () => {
    it("reconstructs the pre-exclusion range for a genuine exclusion output", () => {
        expect(revertExcludedCurrentPeriodRange({ from: -30, to: -1 })).toEqual({ from: -29, to: 0 });
        expect(revertExcludedCurrentPeriodRange({ from: -2, to: -1 })).toEqual({ from: -1, to: 0 });
    });

    it("returns undefined for ranges no exclusion could have produced", () => {
        // to !== -1
        expect(revertExcludedCurrentPeriodRange({ from: -29, to: 0 })).toBeUndefined();
        // from === to: a plain "previous period" filter, NOT current+exclude (the reverse-match bug)
        expect(revertExcludedCurrentPeriodRange({ from: -1, to: -1 })).toBeUndefined();
        // degenerate/inverted (from >= to with to === -1)
        expect(revertExcludedCurrentPeriodRange({ from: 0, to: -1 })).toBeUndefined();
    });

    it("is the exact inverse of excludeCurrentPeriodFromRange", () => {
        for (const from of [-1, -2, -12, -29, -365]) {
            const excluded = excludeCurrentPeriodFromRange({ from, to: 0 }, true);
            expect(revertExcludedCurrentPeriodRange(excluded)).toEqual({ from, to: 0 });
        }
    });
});
