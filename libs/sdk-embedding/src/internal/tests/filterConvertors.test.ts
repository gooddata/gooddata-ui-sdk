// (C) 2020-2024 GoodData Corporation
import { describe, expect, it } from "vitest";
import {
    transformFilterContext,
    isValidFiltersFormat,
    isAllValueAttributeFilterItem,
    ALL_TIME_GRANULARITY,
    isAllTimeDateFilterItem,
    IExternalFiltersObject,
    isValidRemoveFiltersFormat,
} from "../filterConvertors.js";
import {
    FilterItem,
    IAbsoluteDateFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRankingFilter,
    IRelativeDateFilter,
} from "../../iframe/EmbeddedGdc.js";

describe("filter convertors", () => {
    const absoluteDateFilter: IAbsoluteDateFilter = {
        absoluteDateFilter: {
            from: "2020-01-01",
            to: "2020-02-01",
            dataSet: {
                uri: "uri",
            },
        },
    };
    const absoluteDateFilterWithTime: IAbsoluteDateFilter = {
        absoluteDateFilter: {
            from: "2020-01-01 00:01",
            to: "2020-02-01 22:50",
            dataSet: {
                uri: "uri",
            },
        },
    };
    const relativeDateFilter: IRelativeDateFilter = {
        relativeDateFilter: {
            granularity: "gdc.time.month",
            from: -1,
            to: 1,
            dataSet: {
                uri: "uri",
            },
        },
    };
    const absoluteDateFilterWithoutDataSet = {
        absoluteDateFilter: {
            from: "2020-01-01",
            to: "2020-02-01",
        },
    };
    const absoluteDateFilterWithoutUriAndIdentifier = {
        absoluteDateFilter: {
            from: "2020-01-01",
            to: "2020-02-01",
            dataSet: {},
        },
    };
    const negativeAttributeFilter: INegativeAttributeFilter = {
        negativeAttributeFilter: {
            notIn: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };
    const positiveAttributeFilter: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };
    const rankingFilter: IRankingFilter = {
        rankingFilter: {
            measure: { localIdentifier: "m1" },
            attributes: [{ localIdentifier: "a1" }, { localIdentifier: "a2" }],
            operator: "TOP",
            value: 3,
        },
    };
    const positiveAttributeFilterWithoutDisplayForm = {
        positiveAttributeFilter: {
            in: ["uri1"],
            displayForm: {},
        },
    };
    const positiveAttributeFilterWithoutValue: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: [],
            displayForm: {
                uri: "dfUri",
            },
        },
    };
    const positiveAttributeMultiSelectionFilter: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1", "uri2"],
            displayForm: {
                uri: "dfuri",
            },
            selectionMode: "multi",
        },
    };
    const positiveAttributeSelectionFilter: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1", "uri2"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };

    const positiveAttributeSingleSelectionFilterWithoutValue: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: [],
            displayForm: {
                uri: "dfuri",
            },
            selectionMode: "single",
        },
    };
    const positiveAttributeSingleSelectionFilter: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
            selectionMode: "single",
        },
    };
    const positiveAttributeSingleSelectionFilterWithMultipleValues: IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1", "uri2"],
            displayForm: {
                uri: "dfuri",
            },
            selectionMode: "single",
        },
    };
    const invalidSelectionMode: any = {
        positiveAttributeFilter: {
            in: ["uri1", "uri2"],
            displayForm: {
                uri: "dfuri",
            },
            selectionMode: "xxx",
        },
    };
    const negativeAttributeMultiSelectionFilter: INegativeAttributeFilter = {
        negativeAttributeFilter: {
            notIn: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };

    it("should return false if have any item is not the filter item", () => {
        expect(isValidFiltersFormat([absoluteDateFilter, {}])).toBe(false);
        expect(isValidFiltersFormat([])).toBe(false);
        expect(isValidFiltersFormat([null])).toBe(false);
        expect(isValidFiltersFormat([undefined])).toBe(false);
        expect(
            isValidFiltersFormat([
                {
                    absoluteDateFilter: {
                        from: -1,
                        to: 1,
                        dataSet: {
                            uri: "uri",
                        },
                    },
                },
            ]),
        ).toBe(false);
        expect(
            isValidFiltersFormat([
                {
                    relativeDateFilter: {
                        from: "2020-01-01",
                        to: "2020-02-01",
                        dataSet: {
                            uri: "uri",
                        },
                    },
                },
            ]),
        ).toBe(false);
    });

    it("should check the date filter item format", () => {
        expect(isValidFiltersFormat([absoluteDateFilter, relativeDateFilter])).toBe(true);
    });

    it("should return true when date filter has time and the time is supported", () => {
        expect(isValidFiltersFormat([absoluteDateFilterWithTime], true, true)).toBe(true);
    });

    it("should return false when date filter has time but time is not supported", () => {
        expect(isValidFiltersFormat([absoluteDateFilterWithTime], true, false)).toBe(false);
    });

    it("should return false when date filter is missing dataSet", () => {
        expect(isValidFiltersFormat([absoluteDateFilterWithoutDataSet])).toBe(false);
    });

    it("should return false when date filter is missing uri and identifier", () => {
        expect(isValidFiltersFormat([absoluteDateFilterWithoutUriAndIdentifier])).toBe(false);
    });

    it("should return true when date filter is missing uri and identifier and shouldValidateDataSet is false", () => {
        expect(isValidFiltersFormat([absoluteDateFilterWithoutUriAndIdentifier], false)).toBe(true);
    });

    it("should check the attribute filter item format", () => {
        expect(isValidFiltersFormat([negativeAttributeFilter, positiveAttributeFilter])).toBe(true);
        expect(
            isValidFiltersFormat([
                positiveAttributeSingleSelectionFilter,
                positiveAttributeMultiSelectionFilter,
                negativeAttributeMultiSelectionFilter,
                positiveAttributeSelectionFilter,
            ]),
        ).toBe(true);
    });

    it("should return false when attribute filter item is missing uri and identifier", () => {
        expect(isValidFiltersFormat([positiveAttributeFilterWithoutDisplayForm])).toBe(false);
    });

    it("should return false when positive multi select attribute filter item without filter values", () => {
        expect(isValidFiltersFormat([positiveAttributeFilterWithoutValue])).toBe(false);
    });

    it("should return false when positive attribute single select filter item has multiple values", () => {
        expect(isValidFiltersFormat([positiveAttributeSingleSelectionFilterWithMultipleValues])).toBe(false);
    });

    it("should return false when invalid selectionMode provided", () => {
        expect(isValidFiltersFormat([invalidSelectionMode])).toBe(false);
    });

    it("should return true when positive attribute single select filter item without value", () => {
        expect(isValidFiltersFormat([positiveAttributeSingleSelectionFilterWithoutValue])).toBe(true);
    });

    describe("ranking filter", () => {
        function localId(id: any): any {
            return { localIdentifier: id };
        }
        function newRankingFilter(measure?: any, attributes?: any, operator?: any, value?: any): any {
            return {
                rankingFilter: {
                    measure,
                    ...(attributes ? { attributes } : {}),
                    operator,
                    value,
                },
            };
        }
        const Scenarios: Array<[boolean, string, any]> = [
            [false, "without invalid ranking filter", { someOtherFilter: {} }],
            [true, "without attributes", newRankingFilter(localId("id"), undefined, "TOP", 3)],
            [false, "with empty array attributes", newRankingFilter(localId("id"), [], "TOP", 3)],
            [false, "without array of attributes", newRankingFilter(localId("id"), "someString", "TOP", 3)],
            [
                false,
                "with array of invalid values in attributes",
                newRankingFilter(localId("id"), [4, 23], "TOP", 3),
            ],
            [
                false,
                "with array of invalid values in attributes localId",
                newRankingFilter(localId("id"), [localId("id1"), localId(4)], "TOP", 3),
            ],
            [
                true,
                "with array of localIdentifiers in attributes",
                newRankingFilter(localId("id"), [localId("id1"), localId("id2")], "TOP", 3),
            ],
            [false, "without measure localIdentifier", newRankingFilter(undefined, undefined, "TOP", 3)],
            [false, "with invalid measure", newRankingFilter(400, undefined, "TOP", 3)],
            [true, "with measure local identifier", newRankingFilter(localId("id"), undefined, "TOP", 3)],
            [false, "without operator", newRankingFilter(localId("id"), undefined, undefined, 3)],
            [false, "with invalid operator", newRankingFilter(localId("id"), undefined, "MIDDLE", 3)],
            [true, "with BOTTOM operator", newRankingFilter(localId("id"), undefined, "BOTTOM", 3)],
            [true, "with TOP operator", newRankingFilter(localId("id"), undefined, "TOP", 3)],
            [false, "without value", newRankingFilter(localId("id"), undefined, "TOP", undefined)],
            [false, "with invald value", newRankingFilter(localId("id"), undefined, "TOP", "3")],
            [false, "with negative value", newRankingFilter(localId("id"), undefined, "TOP", -5)],
            [false, "with zero value", newRankingFilter(localId("id"), undefined, "TOP", 0)],
            [true, "with positive value", newRankingFilter(localId("id"), undefined, "TOP", 10)],
            [
                false,
                "with value larger than 99_999",
                newRankingFilter(localId("id"), undefined, "TOP", 100_000),
            ],
            [true, "with value 99_999", newRankingFilter(localId("id"), undefined, "TOP", 99_999)],
            [
                false,
                "with number with decimal point",
                newRankingFilter(localId("id"), undefined, "TOP", 44.24),
            ],
        ];

        it.each(Scenarios)("should return %s when filter is %s", (expectedResult, _desc, input) => {
            expect(isValidFiltersFormat([input])).toBe(expectedResult);
        });
    });

    it("should transform filter context", () => {
        const filters: FilterItem[] = [
            absoluteDateFilter,
            relativeDateFilter,
            negativeAttributeFilter,
            positiveAttributeFilter,
            rankingFilter,
        ];
        const expected: IExternalFiltersObject = {
            attributeFilters: [
                {
                    attributeElements: ["uri1"],
                    dfIdentifier: undefined,
                    dfUri: "dfuri",
                    negativeSelection: true,
                },
                {
                    attributeElements: ["uri1"],
                    dfIdentifier: undefined,
                    dfUri: "dfuri",
                    negativeSelection: false,
                },
            ],
            dateFilters: [
                {
                    datasetIdentifier: undefined,
                    datasetUri: "uri",
                    from: "2020-01-01",
                    to: "2020-02-01",
                },
                {
                    datasetIdentifier: undefined,
                    datasetUri: "uri",
                    from: -1,
                    granularity: "gdc.time.month",
                    to: 1,
                },
            ],
            rankingFilter: {
                measureLocalIdentifier: "m1",
                operator: "TOP",
                value: 3,
                attributeLocalIdentifiers: ["a1", "a2"],
            },
        };
        expect(transformFilterContext(filters)).toEqual(expected);
    });

    it("should check all time date filter item", () => {
        expect(isAllTimeDateFilterItem({ from: 0, to: 0, granularity: ALL_TIME_GRANULARITY })).toBe(true);
        expect(isAllTimeDateFilterItem({ from: 0, to: 0, granularity: "gdc.time.month" })).toBe(false);
        expect(isAllTimeDateFilterItem({ from: "2020-01-01", to: "2020-01-01" })).toBe(false);
    });

    it("should check all value attribute filter item", () => {
        expect(isAllValueAttributeFilterItem({ negativeSelection: true, attributeElements: [] })).toBe(true);
        expect(isAllValueAttributeFilterItem({ negativeSelection: true, attributeElements: ["uri1"] })).toBe(
            false,
        );
    });

    describe("isValidRemoveFiltersFormat", () => {
        it("should return true if all are valid", () => {
            const removeFilters = [
                { dataSet: { uri: "/gdc/md/424" } },
                { displayForm: { uri: "/gdc/md/424" } },
                { removeRankingFilter: {} },
            ];
            expect(isValidRemoveFiltersFormat(removeFilters)).toEqual(true);
        });

        it("should return false if some are invalid", () => {
            const removeFilters = [
                { dataSet: { uri: "/gdc/md/424" } },
                { displayForm: { uri: "/gdc/md/424" } },
                { removeRankingFilter: {} },
                { someOtherThing: false },
            ];
            expect(isValidRemoveFiltersFormat(removeFilters)).toEqual(false);
        });
    });
});
