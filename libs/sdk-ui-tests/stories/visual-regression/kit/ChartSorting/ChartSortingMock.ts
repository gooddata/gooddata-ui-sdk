// (C) 2022-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { attributeLocalId, localIdRef, measureLocalId } from "@gooddata/sdk-model";
import { type IChartSortingOwnProps } from "@gooddata/sdk-ui-kit";

type SortingPropsMock = {
    currentSort: IChartSortingOwnProps["currentSort"];
    availableSorts: IChartSortingOwnProps["availableSorts"];
};

export const singleAttributeSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: attributeLocalId(ReferenceMd.Activity.Subject),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.Activity.Subject)),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: false,
            },
        },
    ],
};

export const singleChronologicalDateSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedYear.Default),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedYear.Default)),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: false,
            },
        },
    ],
};

export const singleGenericDateAndMetricSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: attributeLocalId(
                    ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default,
                ),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default)),
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
                                measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const singleAttributeWithSingleMetricSortConfig: SortingPropsMock = {
    currentSort: [
        {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
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
                                measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const singleAttributeWithMultipleMetrics: SortingPropsMock = {
    currentSort: [
        {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: true,
            },
            metricSorts: [
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ReferenceMd.TimelineEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ReferenceMd.NrOfOpportunities),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const multipleAttributesMultipleMetricsSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "asc",
                attributeIdentifier: attributeLocalId(ReferenceMd.Account.Name),
                aggregation: "sum",
            },
        },
        {
            measureSortItem: {
                direction: "desc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: true,
            },
        },
        {
            itemId: localIdRef(attributeLocalId(ReferenceMd.Account.Name)),
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
                                measureIdentifier: measureLocalId(ReferenceMd.SnapshotEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ReferenceMd.TimelineEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ReferenceMd.NrOfOpportunities),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
