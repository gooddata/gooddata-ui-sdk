// (C) 2020 GoodData Corporation

import {
    transformFilterContext,
    isValidFiltersFormat,
    isAllValueAttributeFilterItem,
    ALL_TIME_GRANULARITY,
    isAllTimeDateFilterItem,
} from "../filterConvertors";
import { EmbeddedGdc } from "../../iframe/common";

describe("filter utils", () => {
    const absoluteDateFilter: EmbeddedGdc.IAbsoluteDateFilter = {
        absoluteDateFilter: {
            from: "2020-01-01",
            to: "2020-02-01",
            dataSet: {
                uri: "uri",
            },
        },
    };
    const relativeDateFilter: EmbeddedGdc.IRelativeDateFilter = {
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
    const negativeAttributeFilter: EmbeddedGdc.INegativeAttributeFilter = {
        negativeAttributeFilter: {
            notIn: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };
    const positiveAttributeFilter: EmbeddedGdc.IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: ["uri1"],
            displayForm: {
                uri: "dfuri",
            },
        },
    };
    const positiveAttributeFilterWithoutDisplayForm = {
        positiveAttributeFilter: {
            in: ["uri1"],
            displayForm: {},
        },
    };
    const positiveAttributeFilterWithoutValue: EmbeddedGdc.IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            in: [],
            displayForm: {
                uri: "dfUri",
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
    });

    it("should return false when attribute filter item is missing uri and identifier", () => {
        expect(isValidFiltersFormat([positiveAttributeFilterWithoutDisplayForm])).toBe(false);
    });

    it("should return false when positive attribute filter item without filter values", () => {
        expect(isValidFiltersFormat([positiveAttributeFilterWithoutValue])).toBe(false);
    });

    it("should transform filter context", () => {
        const filters: EmbeddedGdc.FilterItem[] = [
            absoluteDateFilter,
            relativeDateFilter,
            negativeAttributeFilter,
            positiveAttributeFilter,
        ];
        expect(transformFilterContext(filters)).toEqual({
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
        });
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
});
