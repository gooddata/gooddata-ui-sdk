// (C) 2020-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter as IAbsoluteDateFilterAFM,
    type IMeasure as IMeasureAFM,
    type IMeasureValueFilter as IMeasureValueFilterAFM,
    type INegativeAttributeFilter as INegativeAttributeFilterAFM,
    type IPositiveAttributeFilter as IPositiveAttributeFilterAFM,
    type IRankingFilter as IRankingFilterAFM,
    type IRelativeDateFilter as IRelativeDateFilterAFM,
} from "../../typings/bear/bearTypes.js";

import {
    type IMeasure,
    type IMeasureValueFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRankingFilter,
} from "./types.js";

export const relativeDate: IRelativeDateFilterAFM = {
    relativeDateFilter: {
        dataSet: { identifier: "foo" },
        granularity: "something",
        from: -10,
        to: 0,
    },
};

export const absoluteDate: IAbsoluteDateFilterAFM = {
    absoluteDateFilter: {
        dataSet: { identifier: "foo" },
        from: "12/12/2012",
        to: "22/12/2012",
    },
};

export const positiveUri: IPositiveAttributeFilterAFM = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: { uris: ["uri1", "uri2"] },
    },
};

export const positiveValue: IPositiveAttributeFilterAFM = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: { values: ["val1", "val2"] },
    },
};

export const positiveUriExpected: IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: ["uri1", "uri2"],
    },
};

export const positiveValueExpected: IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: ["val1", "val2"],
        textFilter: true,
    },
};

export const negativeUri: INegativeAttributeFilterAFM = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: { uris: ["uri1", "uri2"] },
    },
};

export const negativeValue: INegativeAttributeFilterAFM = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: { values: ["val1", "val2"] },
    },
};

export const negativeUriExpected: INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: ["uri1", "uri2"],
    },
};

export const negativeValueExpected: INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: ["val1", "val2"],
        textFilter: true,
    },
};

export const comparisonMeasureValue: IMeasureValueFilterAFM = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 50,
            },
        },
    },
};

export const comparisonMeasureValueExpected: IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 50,
            },
        },
    },
};

export const rangeMeasureValue: IMeasureValueFilterAFM = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            range: {
                operator: "BETWEEN",
                from: 10,
                to: 100,
            },
        },
    },
};

export const rangeMeasureValueExpected: IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "df",
        },
        condition: {
            range: {
                operator: "BETWEEN",
                from: 10,
                to: 100,
            },
        },
    },
};

export const rankingFilterWithoutAttributes: IRankingFilterAFM = {
    rankingFilter: {
        measures: [
            {
                localIdentifier: "m1",
            },
            {
                localIdentifier: "m2",
            },
        ],
        operator: "TOP",
        value: 3,
    },
};

export const rankingFilterWithoutAttributesExpected: IRankingFilter = {
    rankingFilter: {
        measures: [
            {
                localIdentifier: "m1",
            },
            {
                localIdentifier: "m2",
            },
        ],
        operator: "TOP",
        value: 3,
    },
};

export const rankingFilterWithAttributes: IRankingFilterAFM = {
    rankingFilter: {
        measures: [
            {
                localIdentifier: "m1",
            },
        ],
        attributes: [
            {
                localIdentifier: "a1",
            },
            {
                localIdentifier: "a2",
            },
        ],
        operator: "BOTTOM",
        value: 10,
    },
};

export const rankingFilterWithAttributesExpected: IRankingFilter = {
    rankingFilter: {
        measures: [
            {
                localIdentifier: "m1",
            },
        ],
        attributes: [
            {
                localIdentifier: "a1",
            },
            {
                localIdentifier: "a2",
            },
        ],
        operator: "BOTTOM",
        value: 10,
    },
};

export const simpleMeasureWithFilters: IMeasureAFM = {
    localIdentifier: "measure",
    alias: "test measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        in: { values: ["val1", "val2"] },
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        in: { uris: ["uri1", "uri2"] },
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        notIn: { values: ["val1", "val2"] },
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        notIn: { uris: ["uri1", "uri2"] },
                    },
                },
            ],
        },
    },
};

export const simpleMeasureWithFiltersExpected: IMeasure = {
    localIdentifier: "measure",
    alias: "test measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        in: ["val1", "val2"],
                        textFilter: true,
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        in: ["uri1", "uri2"],
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        notIn: ["val1", "val2"],
                        textFilter: true,
                    },
                },
                {
                    negativeAttributeFilter: {
                        displayForm: { identifier: "foot" },
                        notIn: ["uri1", "uri2"],
                    },
                },
            ],
        },
    },
};

export const simpleMeasureWithMixedFilters: IMeasureAFM = {
    localIdentifier: "any-string",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/mockproject/obj/__won",
            },
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: {
                            uri: "/gdc/md/mockproject/obj/activity.dataset",
                        },
                        granularity: "GDC.time.year",
                        from: -3,
                        to: -3,
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            uri: "/gdc/md/mockproject/obj/attr.checkbox.df",
                        },
                        in: {
                            uris: [
                                "/gdc/md/mockproject/obj/attr.checkbox/elements?id=0",
                                "/gdc/md/mockproject/obj/attr.checkbox/elements?id=1",
                            ],
                        },
                    },
                },
            ],
        },
    },
    alias: "alias",
};

export const simpleMeasureWithMixedFiltersExpected: IMeasure = {
    localIdentifier: "any-string",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/mockproject/obj/__won",
            },
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: {
                            uri: "/gdc/md/mockproject/obj/activity.dataset",
                        },
                        granularity: "GDC.time.year",
                        from: -3,
                        to: -3,
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            uri: "/gdc/md/mockproject/obj/attr.checkbox.df",
                        },
                        in: [
                            "/gdc/md/mockproject/obj/attr.checkbox/elements?id=0",
                            "/gdc/md/mockproject/obj/attr.checkbox/elements?id=1",
                        ],
                    },
                },
            ],
        },
    },
    alias: "alias",
};

export const simpleMeasureWithEmptyFilters: IMeasureAFM = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [],
        },
    },
};

export const simpleMeasureWithEmptyFiltersExpected: IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [],
        },
    },
};

export const simpleMeasureWithUndefinedFilters: IMeasureAFM = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
        },
    },
};

export const simpleMeasureWithUndefinedFiltersExpected: IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: undefined,
        },
    },
};

export const arithmeticMeasure: IMeasureAFM = {
    localIdentifier: "measure",
    definition: {
        arithmeticMeasure: {
            operator: "change",
            measureIdentifiers: ["m1", "m2"],
        },
    },
};

export const popMeasure: IMeasureAFM = {
    localIdentifier: "measure",
    definition: {
        popMeasure: {
            popAttribute: { identifier: "foo" },
            measureIdentifier: "m1",
        },
    },
};

export const previousPeriodMeasure: IMeasureAFM = {
    localIdentifier: "measure",
    definition: {
        previousPeriodMeasure: {
            dateDataSets: [{ dataSet: { identifier: "foo" }, periodsAgo: 1 }],
            measureIdentifier: "m1",
        },
    },
};
