// (C) 2019-2026 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { type IFiltersBucketItem } from "@gooddata/sdk-ui-ext/internal";

import { LAST_30_DAYS } from "../constants/presets.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { GRANULARITY } from "../models/granularity.js";
import {
    type IAttributeFilter,
    type IDateFilter,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
} from "../store/filter_bar/filter_bar_types.js";
import { elements } from "../tests/constants.test.helpers.js";

export const DATE_FILTER_DATASET_REF = {
    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
};

export function buildDateFilterMock(props: Partial<IDateFilter> = {}): IDateFilter {
    return {
        type: "date",
        localIdentifier: "date.localIdentifier",
        cacheItemIdentifier: "date.identifier",
        overTimeComparisonType: "nothing",
        dateDatasetRef: DATE_FILTER_DATASET_REF,
        ...props,
    };
}

export function buildAttributeFilterMock(props: Partial<IAttributeFilter> = {}): IAttributeFilter {
    return {
        type: "attribute",
        localIdentifier: "attr.localIdentifier",
        cacheItemIdentifier: "attr.identifier",
        displayFormRef: uriRef("attr/df/uri"),
        ...props,
    };
}

export const comparisonMeasureValueFilter: IMeasureValueFilter = {
    type: "measure",
    measureLocalIdentifier: "m1",
    localIdentifier: "f1",
    conditions: [
        {
            comparison: {
                operator: "GREATER_THAN",
                value: 12,
            },
        },
    ],
};

export const rangeMeasureValueFilter: IMeasureValueFilter = {
    type: "measure",
    measureLocalIdentifier: "m2",
    localIdentifier: "f2",
    conditions: [
        {
            range: {
                operator: "BETWEEN",
                from: 12,
                to: 14,
            },
        },
    ],
};

export const emptyMeasureValueFilter: IMeasureValueFilter = {
    type: "measure",
    measureLocalIdentifier: "m3",
    localIdentifier: "f3",
};

export const rankingFilterWithoutAttributes: IRankingFilter = {
    localIdentifier: "f5",
    type: "ranking",
    measureLocalIdentifier: "m4",
    operator: "TOP",
    value: 10,
};

export const rankingFilterWithAttributes: IRankingFilter = {
    localIdentifier: "f6",
    type: "ranking",
    measureLocalIdentifier: "m5",
    attributes: ["a1", "a2"],
    operator: "BOTTOM",
    value: 3,
};

export const attributeFilterWith2Elements = buildAttributeFilterMock({
    filterConfig: {
        isInverted: true,
        totalElementsCount: 657,
        selectedElements: [
            {
                title: "Element 1",
                uri: "/gdc/md/projectId/obj/4394/elements?id=298",
            },
            {
                title: "Element 2",
                uri: "/gdc/md/projectId/obj/4394/elements?id=325",
            },
        ],
    },
});

export const dateFilterLast30Days = buildDateFilterMock({
    filterConfig: { granularity: GRANULARITY.DATE, interval: [-29, 0], name: LAST_30_DAYS },
});

export const dateFilter6YearsSply: IDateFilter = {
    type: "date",
    localIdentifier: "f_year",
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    filterConfig: {
        granularity: GRANULARITY.YEAR,
        interval: [-6, 0],
    },
    dateDatasetRef: DATE_FILTER_DATASET_REF,
};

export const filtersMock: ReadonlyArray<IFilter> = [
    attributeFilterWith2Elements,
    dateFilterLast30Days,
    comparisonMeasureValueFilter,
    rangeMeasureValueFilter,
    emptyMeasureValueFilter,
    rankingFilterWithoutAttributes,
    rankingFilterWithAttributes,
];

export const filterItems: IFilter[] = [
    {
        type: "attribute",
        cacheItemIdentifier: "attr.product.id",
        localIdentifier: "f_product",
        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        filterConfig: {
            selectedElements: [elements[1], elements[3], elements[4]],
            isInverted: false,
            totalElementsCount: 7,
        },
    },
    dateFilter6YearsSply,
    {
        type: "date",
        localIdentifier: "f_range",
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
        filterConfig: {
            granularity: GRANULARITY.DATE,
            interval: ["2017-01-01", "2018-01-01"],
            type: "absolute",
        },
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    },
    {
        type: "measure",
        measureLocalIdentifier: "m1",
        localIdentifier: "f1",
        conditions: [{ comparison: { operator: "GREATER_THAN", value: 12 } }],
    },
    {
        type: "measure",
        measureLocalIdentifier: "m2",
        localIdentifier: "f2",
        conditions: [
            {
                range: {
                    operator: "BETWEEN",
                    from: 12,
                    to: 14,
                },
            },
        ],
    },
    {
        type: "measure",
        measureLocalIdentifier: "m3",
        localIdentifier: "f3",
    },
    {
        type: "measure",
        measureLocalIdentifier: "m3_previous_period",
        localIdentifier: "f4",
    },
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
];

export const extendedRefPointFilters: IFiltersBucketItem[] = [
    {
        localIdentifier: "f_product",
        filters: [
            {
                attribute: "attr.product.id",
                displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                selectedElements: [elements[1], elements[3], elements[4]],
                totalElementsCount: 10,
                isInverted: false,
            },
        ],
    },
    {
        localIdentifier: "f_year",
        filters: [
            {
                attribute: "attr.datedataset",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                interval: {
                    granularity: GRANULARITY.YEAR,
                    interval: [-6, 0],
                    name: "Year",
                    type: "relative",
                },
            },
        ],
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    },
    {
        localIdentifier: "f_range",
        filters: [
            {
                attribute: "attr.datedataset",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                interval: {
                    granularity: GRANULARITY.DATE,
                    interval: ["2017-01-01", "2018-01-01"],
                    name: "Date",
                    type: "absolute",
                },
            },
        ],
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    },
    {
        localIdentifier: "f1",
        filters: [
            {
                measureLocalIdentifier: "m1",
                condition: {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 12,
                    },
                },
            },
        ],
    },
    {
        localIdentifier: "f2",
        filters: [
            {
                measureLocalIdentifier: "m2",
                condition: {
                    range: {
                        operator: "BETWEEN",
                        from: 12,
                        to: 14,
                    },
                },
            },
        ],
    },
    {
        localIdentifier: "f3",
        filters: [
            {
                measureLocalIdentifier: "m3",
            },
        ],
    },
    {
        localIdentifier: "f4",
        filters: [
            {
                measureLocalIdentifier: "m3_previous_period",
            },
        ],
    },
    {
        localIdentifier: "f5",
        filters: [
            {
                measure: "m1",
                attributes: ["a1", "a2"],
                operator: "BOTTOM",
                value: 3,
            },
        ],
    },
    {
        localIdentifier: "f6",
        filters: [
            {
                measure: "m2",
                operator: "TOP",
                value: 10,
            },
        ],
    },
];

export const filterItemsWithNoSelection: IFilter[] = [
    {
        type: "attribute",
        cacheItemIdentifier: "attr.product.id",
        localIdentifier: "f_product",
        displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
        filterConfig: {
            selectedElements: [],
            isInverted: false,
            totalElementsCount: 7,
        },
    },
    {
        type: "date",
        localIdentifier: DATE_DATASET_ATTRIBUTE,
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    },
];

export const filterItemWithNonDefaultDisplayForm: IFilter = {
    type: "attribute",
    cacheItemIdentifier: "attr.country.id",
    localIdentifier: "f_country",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/900"),
    filterConfig: {
        selectedElements: [],
        isInverted: false,
        totalElementsCount: 0,
    },
};

export const filtersWithQuarterGranularity: IFilter[] = [
    {
        type: "date",
        localIdentifier: "quarter",
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        overTimeComparisonType: OverTimeComparisonTypes.NOTHING,
        filterConfig: {
            granularity: GRANULARITY.QUARTER,
            interval: [-3, 0],
        },
        dateDatasetRef: DATE_FILTER_DATASET_REF,
    },
];
