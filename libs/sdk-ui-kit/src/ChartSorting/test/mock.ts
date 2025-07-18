// (C) 2022-2025 GoodData Corporation

import { localIdRef } from "@gooddata/sdk-model";
import { ChartSortingProps } from "../ChartSorting.js";

type SortingPropsMock = {
    currentSort: ChartSortingProps["currentSort"];
    availableSorts: ChartSortingProps["availableSorts"];
};

export const singleNormalAttributeSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: "a1",
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef("a1"),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: false,
            },
        },
    ],
};

export const singleAreaAttributeSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "asc",
                attributeIdentifier: "a1",
                aggregation: "sum",
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef("a1"),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: true,
            },
        },
    ],
};

export const multipleAttributesSortConfig: SortingPropsMock = {
    currentSort: [
        {
            measureSortItem: {
                direction: "desc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: "m1",
                        },
                    },
                ],
            },
        },
        {
            attributeSortItem: {
                direction: "asc",
                attributeIdentifier: "a2",
                aggregation: "sum",
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef("a1"),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: false,
            },
            metricSorts: [
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m1",
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m2",
                            },
                        },
                    ],
                },
            ],
        },
        {
            itemId: localIdRef("a2"),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: true,
            },
        },
    ],
};
