// (C) 2021-2022 GoodData Corporation
import {
    DateFilterOption,
    defaultDateFilterOptions,
    IDateFilterOptionsByType,
} from "@gooddata/sdk-ui-filters";
import { IRelativeDateFilterPresetOfGranularity, IDashboardDateFilter } from "@gooddata/sdk-model";

import { matchDateFilterToDateFilterOption } from "../dateFilterOptionMapping";

import { allTime, last30days } from "./fixtures";

describe("matchDateFilterToDateFilterOption", () => {
    it.each<
        [
            description: string,
            filter: IDashboardDateFilter | undefined,
            expectedOption: DateFilterOption,
            expectedExcludeCurrent: boolean,
        ]
    >([
        [
            "relativePreset without exclude",
            {
                dateFilter: {
                    from: "-29",
                    to: "0",
                    granularity: "GDC.time.date",
                    type: "relative",
                },
            },
            last30days,
            false,
        ],
        [
            "relativePreset with exclude",
            {
                dateFilter: {
                    from: "-30",
                    to: "-1",
                    granularity: "GDC.time.date",
                    type: "relative",
                },
            },
            last30days,
            true,
        ],
        [
            "relativeForm",
            {
                dateFilter: {
                    from: "-299",
                    to: "10",
                    granularity: "GDC.time.date",
                    type: "relative",
                },
            },
            {
                from: -299,
                to: 10,
                granularity: "GDC.time.date",
                type: "relativeForm",
                localIdentifier: "RELATIVE_FORM",
                name: "",
                visible: true,
            },
            false,
        ],
        [
            "absoluteForm",
            {
                dateFilter: {
                    from: "2019-01-01",
                    to: "2019-01-02",
                    granularity: "GDC.time.date",
                    type: "absolute",
                },
            },
            {
                from: "2019-01-01",
                to: "2019-01-02",
                type: "absoluteForm",
                localIdentifier: "ABSOLUTE_FORM",
                name: "",
                visible: true,
            },
            false,
        ],
        ["allTime", undefined, allTime, false],
    ])("should match filter for %s", (_, filter, expectedOption, expectedExcludeCurrentPeriod) => {
        const actual = matchDateFilterToDateFilterOption(filter, defaultDateFilterOptions);

        expect(actual.dateFilterOption).toEqual(expectedOption);
        expect(actual.excludeCurrentPeriod).toEqual(expectedExcludeCurrentPeriod);
    });

    it("should match relative preset without exclude first", () => {
        const relativePresetWithoutExclude: IRelativeDateFilterPresetOfGranularity<"GDC.time.year"> = {
            from: -66,
            to: -1,
            localIdentifier: "FOO",
            name: "Foo",
            type: "relativePreset",
            granularity: "GDC.time.year",
            visible: true,
        };
        const relativePresetWithExclude: IRelativeDateFilterPresetOfGranularity<"GDC.time.year"> = {
            from: -66,
            to: 0,
            localIdentifier: "FOO2",
            name: "Foo2",
            type: "relativePreset",
            granularity: "GDC.time.year",
            visible: true,
        };

        const options: IDateFilterOptionsByType = {
            ...defaultDateFilterOptions,
            relativePreset: {
                "GDC.time.year": [relativePresetWithExclude, relativePresetWithoutExclude],
            },
        };

        const input: IDashboardDateFilter = {
            dateFilter: {
                from: "-66",
                to: "-1",
                granularity: "GDC.time.year",
                type: "relative",
            },
        };

        const actual = matchDateFilterToDateFilterOption(input, options);
        expect(actual.dateFilterOption).toEqual(relativePresetWithoutExclude);
        expect(actual.excludeCurrentPeriod).toEqual(false);
    });
});
