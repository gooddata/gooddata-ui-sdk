// (C) 2019-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAbsoluteDateFilterPreset,
    type IAllTimeDateFilterOption,
    type IRelativeDateFilterPreset,
} from "@gooddata/sdk-model";

import {
    type IUiAbsoluteDateFilterForm,
    type IUiAbsoluteGranularityDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "../interfaces/index.js";

import { mapAbsoluteFilterToAfm, mapOptionToAfm, mapRelativeFilterToAfm } from "./AFMConversions.js";

const dataSet = {
    uri: "foo",
};
const allTimeDateFilterValue: IAllTimeDateFilterOption = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "allTime",
};
const absoluteDateFilterFormValue: IUiAbsoluteDateFilterForm = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "absoluteForm",
    from: "1",
    to: "2",
};
const absoluteDateFilterPresetValue: IAbsoluteDateFilterPreset = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "absolutePreset",
    from: "1",
    to: "2",
};
const relativeDateFilterFormValue: IUiRelativeDateFilterForm = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "relativeForm",
    from: 1,
    to: 2,
};
const relativeDateFilterPresetValue: IRelativeDateFilterPreset = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "relativePreset",
    from: 1,
    to: 2,
    granularity: "GDC.time.date",
};

const absoluteGranularityDateFilterFormValue: IUiAbsoluteGranularityDateFilterForm = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "absoluteGranularityForm",
    granularity: "GDC.time.week",
    from: "2026-53",
    to: "2027-01",
};

describe("mapAbsoluteFilterToAfm", () => {
    it("should convert absolute date filter form value to AFM absolute date filter definition", () => {
        const actual = mapAbsoluteFilterToAfm(absoluteDateFilterFormValue, dataSet);
        expect(actual).toEqual({
            absoluteDateFilter: {
                from: "1",
                to: "2",
                dataSet: {
                    uri: "foo",
                },
            },
        });
    });
});

describe("mapRelativeFilterToAfm", () => {
    it("should convert relative date filter form value to AFM relative date filter definition", () => {
        const actual = mapRelativeFilterToAfm(relativeDateFilterFormValue, dataSet);
        expect(actual).toEqual({
            relativeDateFilter: {
                from: 1,
                granularity: "GDC.time.date",
                to: 2,
                dataSet: {
                    uri: "foo",
                },
            },
        });
    });
});

describe("mapOptionToAfm", () => {
    it("should convert all time date filter value to AFM empty date filter definition", () => {
        const actual = mapOptionToAfm(allTimeDateFilterValue, dataSet, false);
        expect(actual).toBe(null);
    });

    it("should convert absolute date filter form value to AFM absolute date filter definition", () => {
        const actual = mapOptionToAfm(absoluteDateFilterFormValue, dataSet, false);
        expect(actual).toHaveProperty("absoluteDateFilter");
    });

    it("should convert absolute date filter preset value to AFM absolute date filter definition", () => {
        const actual = mapOptionToAfm(absoluteDateFilterPresetValue, dataSet, false);
        expect(actual).toHaveProperty("absoluteDateFilter");
    });

    it("should convert relative date filter form value to AFM relative date filter definition", () => {
        const actual = mapOptionToAfm(relativeDateFilterFormValue, dataSet, false);
        expect(actual).toHaveProperty("relativeDateFilter");
    });

    it("should convert relative date filter preset value to AFM relative date filter definition", () => {
        const actual = mapOptionToAfm(relativeDateFilterPresetValue, dataSet, false);
        expect(actual).toHaveProperty("relativeDateFilter");
    });

    it("should convert relative date filter preset value to AFM relative date filter definition with excluding current period", () => {
        const actual = mapOptionToAfm({ ...relativeDateFilterPresetValue, from: -30, to: 0 }, dataSet, true);
        expect(actual).toMatchObject({ relativeDateFilter: { from: -31, to: -1 } });
    });

    it("should convert whole periods to AFM absolute date filter with granularity", () => {
        const actual = mapOptionToAfm(absoluteGranularityDateFilterFormValue, dataSet, false);
        expect(actual).toEqual({
            absoluteGranularityDateFilter: {
                dataSet: { uri: "foo" },
                granularity: "GDC.time.week",
                from: "2026-53",
                to: "2027-01",
            },
        });
    });

    it.each([
        ["only from", { from: "2026-53", to: undefined }, { from: "2026-53" }],
        ["only to", { from: undefined, to: "2027-01" }, { to: "2027-01" }],
    ])("should convert whole periods with %s to AFM without the other end", (_, range, expectedRange) => {
        const actual = mapOptionToAfm(
            { ...absoluteGranularityDateFilterFormValue, ...range },
            dataSet,
            false,
        );
        expect(actual).toEqual({
            absoluteGranularityDateFilter: {
                dataSet: { uri: "foo" },
                granularity: "GDC.time.week",
                ...expectedRange,
            },
        });
    });

    it("should convert whole periods without both ends to null", () => {
        const actual = mapOptionToAfm(
            { ...absoluteGranularityDateFilterFormValue, from: undefined, to: undefined },
            dataSet,
            false,
        );
        expect(actual).toBeNull();
    });

    it("should not shift whole periods when excluding the current period", () => {
        const actual = mapOptionToAfm(absoluteGranularityDateFilterFormValue, dataSet, true);
        expect(actual).toMatchObject({
            absoluteGranularityDateFilter: { from: "2026-53", to: "2027-01" },
        });
    });

    it("should throw error when type is uknown and TS is not used", () => {
        const value = {
            localIdentifier: "baz",
            name: "bar",
            visible: true,
            type: "uknownType",
        } as any;
        expect(() => mapOptionToAfm(value, dataSet, false)).toThrow();
    });
});
