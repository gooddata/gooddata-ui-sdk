// (C) 2022-2025 GoodData Corporation
import { ChartSortingOwnProps } from "@gooddata/sdk-ui-kit";
import { attributeLocalId, localIdRef, measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

type SortingPropsMock = {
    currentSort: ChartSortingOwnProps["currentSort"];
    availableSorts: ChartSortingOwnProps["availableSorts"];
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
