// (C) 2019-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { DATE, GRANULARITY } from "../../constants/bucket.js";
import { DEFAULT_BASE_CHART_UICONFIG, DEFAULT_TABLE_UICONFIG } from "../../constants/uiConfig.js";
import {
    DATE_DATASET_ATTRIBUTE,
    type IExtendedReferencePoint,
    type IFiltersBucketItem,
} from "../../interfaces/Visualization.js";
import {
    arithmeticMeasureItems,
    attributeItems,
    dateDatasetRef,
    dateFilter,
    dateFilterSamePeriodPreviousYear,
    dateItem,
    dateItemWithDateDataset,
    derivedMeasureItems,
    masterMeasureItems,
} from "../../tests/mocks/referencePointMocks.js";
import { configureOverTimeComparison, configurePercent } from "../bucketConfig.js";

describe("configure Percent and Over Time Comparison helper functions", () => {
    const samePeriodPreviousYearFilter: IFiltersBucketItem = {
        attribute: DATE_DATASET_ATTRIBUTE,
        localIdentifier: "f1",
        filters: [dateFilterSamePeriodPreviousYear],
        dateDatasetRef: dateDatasetRef,
    };

    function getSingleMeasureNoFilterReferencePoint(numberOfMeasures: number): IExtendedReferencePoint {
        return {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(masterMeasureItems.slice(0, numberOfMeasures)),
                },
                {
                    localIdentifier: "attribute",
                    items: [cloneDeep(dateItem)],
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [],
            },
            uiConfig: DEFAULT_TABLE_UICONFIG,
        };
    }

    function getOverTimeComparisonReferencePoint(dateFilter: IFiltersBucketItem): IExtendedReferencePoint {
        const uiConfig = cloneDeep(DEFAULT_BASE_CHART_UICONFIG);
        uiConfig.buckets["secondary_measures"] = uiConfig.buckets["measures"];

        return {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: masterMeasureItems
                        .slice(0, 2)
                        .concat(derivedMeasureItems.slice(0, 2))
                        .concat(arithmeticMeasureItems.slice(0, 2))
                        .concat(arithmeticMeasureItems.slice(3, 4)),
                },
                {
                    localIdentifier: "secondary_measures",
                    items: masterMeasureItems
                        .slice(2, 4)
                        .concat(derivedMeasureItems.slice(2, 4))
                        .concat(arithmeticMeasureItems.slice(5, 6)),
                },
                {
                    localIdentifier: "attribute",
                    items: [dateItemWithDateDataset],
                },
            ],
            filters: {
                localIdentifier: "filters",
                items: [dateFilter],
            },
            uiConfig: {
                ...uiConfig,
                supportedOverTimeComparisonTypes: [
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                ],
            },
        };
    }

    describe("configurePercent", () => {
        it("should remove all showInPercent flags from metrics if show in percent not allowed by bucket rules", () => {
            const referencePoint: IExtendedReferencePoint = getSingleMeasureNoFilterReferencePoint(2);
            referencePoint.buckets[0].items.forEach((item) => (item.showInPercent = true));

            const newReferencePoint: IExtendedReferencePoint = configurePercent(
                cloneDeep(referencePoint),
                false,
            );

            newReferencePoint.buckets[0].items.forEach((item) => expect(item.showInPercent).toBeFalsy());
        });

        it("should mark show in percent in measure buckets ui config if buckets conditions are met", () => {
            const referencePoint = getSingleMeasureNoFilterReferencePoint(1);

            const newReferencePoint: IExtendedReferencePoint = configurePercent(
                cloneDeep(referencePoint),
                false,
            );

            const expectedUiConfig = cloneDeep(DEFAULT_TABLE_UICONFIG);
            expectedUiConfig.buckets["measures"].isShowInPercentEnabled = true;
            expect(newReferencePoint.uiConfig).toEqual(expectedUiConfig);
        });

        it("should force-mark show in percent as not enabled in measure bucket ui config", () => {
            const referencePoint = getSingleMeasureNoFilterReferencePoint(1);
            referencePoint.uiConfig!.buckets["measures"].isShowInPercentEnabled = true;

            const newReferencePoint: IExtendedReferencePoint = configurePercent(
                cloneDeep(referencePoint),
                true,
            );

            const expectedUiConfig = cloneDeep(DEFAULT_TABLE_UICONFIG);
            expectedUiConfig.buckets["measures"].isShowInPercentEnabled = false;
            expect(newReferencePoint.uiConfig).toEqual(expectedUiConfig);
        });

        it("should force-remove show in percent flag in bucket items", () => {
            const referencePoint = getSingleMeasureNoFilterReferencePoint(1);
            referencePoint.buckets[0].items[0].showInPercent = true;

            const newReferencePoint: IExtendedReferencePoint = configurePercent(
                cloneDeep(referencePoint),
                true,
            );

            newReferencePoint.buckets[0].items.forEach((item) => expect(item.showInPercent).toBeFalsy());
        });
    });

    describe("configureOverTimeComparison", () => {
        const dateFilterBucketItem: IFiltersBucketItem = {
            attribute: DATE_DATASET_ATTRIBUTE,
            localIdentifier: "f1",
            filters: [dateFilter],
            dateDatasetRef: dateDatasetRef,
        };

        const dateFilterWithSamePeriodPreviousYear: IFiltersBucketItem = {
            attribute: DATE_DATASET_ATTRIBUTE,
            localIdentifier: "f1",
            filters: [dateFilterSamePeriodPreviousYear],
            dateDatasetRef: dateDatasetRef,
        };

        it("should keep all derived measures if over time comparison is available due to non-all-time date filter", () => {
            const uiConfig = cloneDeep(DEFAULT_BASE_CHART_UICONFIG);

            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            masterMeasureItems[0],
                            derivedMeasureItems[1],
                            arithmeticMeasureItems[0],
                            arithmeticMeasureItems[1],
                            arithmeticMeasureItems[3],
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [dateItemWithDateDataset],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [samePeriodPreviousYearFilter],
                },
                uiConfig: {
                    ...uiConfig,
                    supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                },
            };
            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            expect(newReferencePoint.buckets).toMatchObject(referencePoint.buckets);
        });

        it("should remove derived measures when no date filter present", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            masterMeasureItems[0],
                            masterMeasureItems[1],
                            derivedMeasureItems[0],
                            derivedMeasureItems[1],
                            arithmeticMeasureItems[0],
                            arithmeticMeasureItems[1],
                            arithmeticMeasureItems[3],
                            arithmeticMeasureItems[5],
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [],
                },
                uiConfig: {
                    ...DEFAULT_BASE_CHART_UICONFIG,
                    supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                },
            };

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            expect(newReferencePoint.buckets[0].items).toEqual([
                masterMeasureItems[0],
                masterMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
            ]);
        });

        it("should remove all derived measures when comparison is not allowed due to used stack", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            masterMeasureItems[0],
                            masterMeasureItems[1],
                            derivedMeasureItems[0],
                            derivedMeasureItems[1],
                            arithmeticMeasureItems[0],
                            arithmeticMeasureItems[1],
                            arithmeticMeasureItems[3],
                            arithmeticMeasureItems[5],
                        ],
                    },
                    {
                        localIdentifier: "stack",
                        items: [attributeItems[0]],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [dateFilterWithSamePeriodPreviousYear],
                },
                uiConfig: {
                    ...DEFAULT_BASE_CHART_UICONFIG,
                    supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                },
            };

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            expect(newReferencePoint.buckets[0].items).toEqual([
                masterMeasureItems[0],
                masterMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
            ]);
        });

        it("should leave all derived measures when comparison with week granularity is allowed", () => {
            const referencePoint: IExtendedReferencePoint = {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            masterMeasureItems[0],
                            masterMeasureItems[1],
                            derivedMeasureItems[0],
                            derivedMeasureItems[1],
                            arithmeticMeasureItems[0],
                            arithmeticMeasureItems[1],
                            arithmeticMeasureItems[3],
                            arithmeticMeasureItems[5],
                        ],
                    },
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                localIdentifier: "date-week-attribute",
                                type: DATE,
                                attribute: DATE_DATASET_ATTRIBUTE,
                                granularity: GRANULARITY.week,
                                dateDatasetRef: dateDatasetRef,
                            },
                        ],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [dateFilterWithSamePeriodPreviousYear],
                },
                uiConfig: {
                    ...DEFAULT_BASE_CHART_UICONFIG,
                    supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                },
            };

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            expect(newReferencePoint.buckets[0].items).toEqual([
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
                arithmeticMeasureItems[5],
            ]);
        });

        it("should remove all derived measures when compare type is undefined", () => {
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterBucketItem);

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            const expectedReferencePoint = cloneDeep(referencePoint);
            expectedReferencePoint.buckets[0].items = masterMeasureItems
                .slice(0, 2)
                .concat(arithmeticMeasureItems.slice(0, 2));
            expectedReferencePoint.buckets[1].items = masterMeasureItems.slice(2, 4);

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });

        it("should remove all derived measures when compare type is NOTHING", () => {
            const dateFilterBucketItem: IFiltersBucketItem = {
                localIdentifier: "f1",
                filters: [dateFilter],
            };
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterBucketItem);

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            const expectedReferencePoint = cloneDeep(referencePoint);
            expectedReferencePoint.buckets[0].items = masterMeasureItems
                .slice(0, 2)
                .concat(arithmeticMeasureItems.slice(0, 2));
            expectedReferencePoint.buckets[1].items = masterMeasureItems.slice(2, 4);

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });

        it("should keep all derived measures when compare type is SP", () => {
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterWithSamePeriodPreviousYear);

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            expect(newReferencePoint.buckets).toMatchObject(referencePoint.buckets);
        });

        it("should keep derived measures when UI config contains used comparison type", () => {
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterWithSamePeriodPreviousYear);
            referencePoint.uiConfig!.supportedOverTimeComparisonTypes = [
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            ];

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            const expectedReferencePoint = cloneDeep(referencePoint);
            expectedReferencePoint.buckets[0].items = [
                masterMeasureItems[0],
                masterMeasureItems[1],
                derivedMeasureItems[0],
                derivedMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
            ];
            expectedReferencePoint.buckets[1].items = [
                masterMeasureItems[2],
                masterMeasureItems[3],
                derivedMeasureItems[2],
                derivedMeasureItems[3],
                arithmeticMeasureItems[5],
            ];

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });

        it("should remove all derived measures when UI config is empty", () => {
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterWithSamePeriodPreviousYear);
            referencePoint.uiConfig!.supportedOverTimeComparisonTypes = [];

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            const expectedReferencePoint = cloneDeep(referencePoint);
            expectedReferencePoint.buckets[0].items = [
                masterMeasureItems[0],
                masterMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
            ];
            expectedReferencePoint.buckets[1].items = [masterMeasureItems[2], masterMeasureItems[3]];

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });

        it("should remove all derived measures when UI config contains only NOTHING option", () => {
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterWithSamePeriodPreviousYear);
            referencePoint.uiConfig!.supportedOverTimeComparisonTypes = [OverTimeComparisonTypes.NOTHING];

            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));

            const expectedReferencePoint = cloneDeep(referencePoint);
            expectedReferencePoint.buckets[0].items = [
                masterMeasureItems[0],
                masterMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
            ];
            expectedReferencePoint.buckets[1].items = [masterMeasureItems[2], masterMeasureItems[3]];

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });

        it("should remove all derived measures when date filter does not have same date dataset with date buckets", () => {
            const dateFilterWithDifferentDateDataset: IFiltersBucketItem = {
                attribute: DATE_DATASET_ATTRIBUTE,
                localIdentifier: "f1",
                filters: [dateFilterSamePeriodPreviousYear],
                dateDatasetRef: {
                    uri: "different.date.dataset",
                },
            };
            const referencePoint = getOverTimeComparisonReferencePoint(dateFilterWithDifferentDateDataset);
            const expectedReferencePoint = cloneDeep(referencePoint);
            const newReferencePoint = configureOverTimeComparison(cloneDeep(referencePoint));
            expectedReferencePoint.buckets[0].items = [
                masterMeasureItems[0],
                masterMeasureItems[1],
                arithmeticMeasureItems[0],
                arithmeticMeasureItems[1],
                arithmeticMeasureItems[3],
            ];
            expectedReferencePoint.buckets[1].items = [
                masterMeasureItems[2],
                masterMeasureItems[3],
                arithmeticMeasureItems[5],
            ];

            expect(newReferencePoint.buckets).toMatchObject(expectedReferencePoint.buckets);
        });
    });
});
