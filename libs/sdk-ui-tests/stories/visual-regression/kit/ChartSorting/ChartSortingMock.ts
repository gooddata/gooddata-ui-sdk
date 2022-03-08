// (C) 2022 GoodData Corporation
import { ChartSortingOwnProps } from "@gooddata/sdk-ui-kit";
import { attributeLocalId, localIdRef, measureLocalId } from "@gooddata/sdk-model";
import { ExperimentalMd } from "@gooddata/experimental-workspace";

type SortingPropsMock = {
    currentSort: ChartSortingOwnProps["currentSort"];
    availableSorts: ChartSortingOwnProps["availableSorts"];
};

export const singleAttributeSortConfig: SortingPropsMock = {
    currentSort: [
        {
            attributeSortItem: {
                direction: "desc",
                attributeIdentifier: attributeLocalId(ExperimentalMd.Activity.Subject),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.Activity.Subject)),
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
                attributeIdentifier: attributeLocalId(ExperimentalMd.DateDatasets.Closed.Year.Default),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.DateDatasets.Closed.Year.Default)),
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
                attributeIdentifier: attributeLocalId(ExperimentalMd.DateDatasets.Closed.MonthYear.Long),
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.DateDatasets.Closed.MonthYear.Long)),
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
                                measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
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
                            measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.Account.Name)),
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
                                measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
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
                            measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.Account.Name)),
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
                                measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ExperimentalMd.TimelineEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ExperimentalMd.NrOfOpportunities),
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
                attributeIdentifier: attributeLocalId(ExperimentalMd.Account.Name),
                aggregation: "sum",
            },
        },
        {
            measureSortItem: {
                direction: "desc",
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
                        },
                    },
                ],
            },
        },
    ],
    availableSorts: [
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.Account.Name)),
            attributeSort: {
                normalSortEnabled: true,
                areaSortEnabled: true,
            },
        },
        {
            itemId: localIdRef(attributeLocalId(ExperimentalMd.Account.Name)),
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
                                measureIdentifier: measureLocalId(ExperimentalMd.SnapshotEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ExperimentalMd.TimelineEOP),
                            },
                        },
                    ],
                },
                {
                    type: "measureSort",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: measureLocalId(ExperimentalMd.NrOfOpportunities),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
