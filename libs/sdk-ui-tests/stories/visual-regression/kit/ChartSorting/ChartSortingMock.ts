// (C) 2022 GoodData Corporation
import { ISortConfig } from "@gooddata/sdk-ui-kit";
import { attributeLocalId, localIdRef, measureLocalId } from "@gooddata/sdk-model";
import { ExperimentalMd } from "@gooddata/experimental-workspace";

export const singleAttributeSortConfig: ISortConfig = {
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
    supported: true,
    disabled: false,
};

export const singleAttributeWithSingleMetricSortConfig: ISortConfig = {
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
    supported: true,
    disabled: false,
};

export const singleAttributeWithMultipleMetrics: ISortConfig = {
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
    supported: true,
    disabled: false,
};

export const multipleAttributesMultipleMetricsSortConfig: ISortConfig = {
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
    supported: true,
    disabled: false,
};
