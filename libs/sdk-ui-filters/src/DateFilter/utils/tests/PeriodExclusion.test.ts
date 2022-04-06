// (C) 2019-2022 GoodData Corporation
import { canExcludeCurrentPeriod, applyExcludeCurrentPeriod } from "../PeriodExclusion";
import { DateFilterOption } from "../../interfaces";
import { IRelativeDateFilterPreset } from "@gooddata/sdk-model";

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
                name: "filters.last30days.title",
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
