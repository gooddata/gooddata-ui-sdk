// (C) 2007-2019 GoodData Corporation
import { AFM, ExecuteAFM } from "@gooddata/typings";

export const relativeDate: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: { identifier: "foo" },
        granularity: "something",
        from: -10,
        to: 0,
    },
};

export const absoluteDate: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: { identifier: "foo" },
        from: "12/12/2012",
        to: "22/12/2012",
    },
};

export const positiveUri: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: ["uri1", "uri2"],
    },
};

export const positiveValue: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: ["val1", "val2"],
        textFilter: true,
    },
};

export const positiveUriExpected: ExecuteAFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: { uris: ["uri1", "uri2"] },
    },
};

export const positiveValueExpected: ExecuteAFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: { values: ["val1", "val2"] },
    },
};

export const negativeUri: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: ["uri1", "uri2"],
    },
};

export const negativeValue: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: ["val1", "val2"],
        textFilter: true,
    },
};

export const negativeUriExpected: ExecuteAFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: { uris: ["uri1", "uri2"] },
    },
};

export const negativeValueExpected: ExecuteAFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: { values: ["val1", "val2"] },
    },
};

export const comparisonMeasureValue: AFM.IMeasureValueFilter = {
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

export const comparisonMeasureValueExpected: ExecuteAFM.IMeasureValueFilter = {
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

export const rangeMeasureValue: AFM.IMeasureValueFilter = {
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

export const rangeMeasureValueExpected: ExecuteAFM.IMeasureValueFilter = {
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

export const simpleMeasureWithFilters: AFM.IMeasure = {
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

export const simpleMeasureWithFiltersExpected: ExecuteAFM.IMeasure = {
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

export const simpleMeasureWithMixedFilters: AFM.IMeasure = {
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

export const simpleMeasureWithMixedFiltersExpected: ExecuteAFM.IMeasure = {
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

export const simpleMeasureWithEmptyFilters: AFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [],
        },
    },
};

export const simpleMeasureWithEmptyFiltersExpected: ExecuteAFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: [],
        },
    },
};

export const simpleMeasureWithUndefinedFilters: AFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
            filters: undefined,
        },
    },
};

export const simpleMeasureWithUndefinedFiltersExpected: ExecuteAFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        measure: {
            item: { uri: "uri1" },
        },
    },
};

export const arithmeticMeasure: AFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        arithmeticMeasure: {
            operator: "change",
            measureIdentifiers: ["m1", "m2"],
        },
    },
};

export const popMeasure: AFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        popMeasure: {
            popAttribute: { identifier: "foo" },
            measureIdentifier: "m1",
        },
    },
};

export const previousPeriodMeasure: AFM.IMeasure = {
    localIdentifier: "measure",
    definition: {
        previousPeriodMeasure: {
            dateDataSets: [{ dataSet: { identifier: "foo" }, periodsAgo: 1 }],
            measureIdentifier: "m1",
        },
    },
};
