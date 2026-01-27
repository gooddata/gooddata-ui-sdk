// (C) 2019-2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";
import { describe, expect, it } from "vitest";

import { BucketNames } from "@gooddata/sdk-ui";

import { type IBucketItem, type IBucketOfFun, type IFilters } from "../../interfaces/Visualization.js";
import {
    attributeFilterBucketItem,
    comparisonAndTrendingRecommendationReferencePoint,
    dateFilterBucketAllTime,
    derivedMeasureItems,
    masterMeasureItems,
    measureValueFilterByDerivedReferencePoint,
    measureValueFilterReferencePoint,
    metricWithViewByDateAndDateFilterReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
    overTimeComparisonRecommendationRefPoint,
    percentRecommendationReferencePoint,
    rankingFilterBucketItem,
    samePeriodPrevYearFiltersBucket,
    sliceByWeekBucketItem,
    thresholdMeasure,
    twoDateFiltersBucket,
} from "../../tests/mocks/referencePointMocks.js";
import {
    comparisonAndTrendingRecommendationEnabled,
    getMasterMeasuresCount,
    hasGlobalDateFilter,
    hasGlobalDateFilterIgnoreAllTime,
    hasOneMasterMeasureInBucket,
    hasOneMeasureOrAlsoLineStyleControlMeasure,
    hasSomeSegmentByItems,
    hasUsedDate,
    isShowInPercentAllowed,
    noDerivedMeasurePresent,
    overTimeComparisonRecommendationEnabled,
    percentRecommendationEnabled,
    previousPeriodRecommendationEnabled,
} from "../bucketRules.js";

describe("isShowInPercentAllowed", () => {
    it("should return true if buckets rules met", () => {
        expect(
            isShowInPercentAllowed(
                metricWithViewByDateAndDateFilterReferencePoint.buckets,
                metricWithViewByDateAndDateFilterReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        expect(
            isShowInPercentAllowed(
                multipleMetricsAndCategoriesReferencePoint.buckets,
                multipleMetricsAndCategoriesReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeFalsy();
    });

    it("should return true if measure value filter is present", () => {
        expect(
            isShowInPercentAllowed(
                measureValueFilterReferencePoint.buckets,
                measureValueFilterReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeTruthy();
    });

    it("should return false if measure value filter by derived measure is present", () => {
        expect(
            isShowInPercentAllowed(
                measureValueFilterByDerivedReferencePoint.buckets,
                measureValueFilterByDerivedReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeFalsy();
    });

    it("should return false if ranking filter is present", () => {
        const editedReferencePoint = cloneDeep(metricWithViewByDateAndDateFilterReferencePoint);
        set(editedReferencePoint, ["filters", "items", 1], rankingFilterBucketItem);

        expect(
            isShowInPercentAllowed(
                editedReferencePoint.buckets,
                editedReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeFalsy();
    });
});

describe("overTimeComparisonRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            overTimeComparisonRecommendationEnabled(overTimeComparisonRecommendationRefPoint),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(overTimeComparisonRecommendationRefPoint);
        const newMetric: IBucketItem = {
            localIdentifier: "m2",
            type: "metric",
            aggregation: null as unknown as undefined,
            attribute: "aazb6kroa3iC",
            showInPercent: null as unknown as undefined,
        };

        set(editedReferencePoint, ["buckets", 0, "items", 1], newMetric);

        expect(overTimeComparisonRecommendationEnabled(editedReferencePoint)).toBeFalsy();
    });

    it("should return true if insight is sliced by weeks and week filters are enabled", () => {
        const editedReferencePoint = cloneDeep(overTimeComparisonRecommendationRefPoint);
        set(editedReferencePoint, ["buckets", 1, "items", 0], sliceByWeekBucketItem);

        expect(overTimeComparisonRecommendationEnabled(editedReferencePoint)).toBeTruthy();
    });
});

describe("comparisonAndTrendingRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            comparisonAndTrendingRecommendationEnabled(
                comparisonAndTrendingRecommendationReferencePoint.buckets,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(comparisonAndTrendingRecommendationReferencePoint);

        const newCategory: IBucketItem = {
            localIdentifier: "v1",
            type: "attribute",
            aggregation: null as unknown as undefined,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 1, "items", 0], newCategory);

        expect(comparisonAndTrendingRecommendationEnabled(editedReferencePoint.buckets)).toBeFalsy();
    });
});

describe("percentRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            percentRecommendationEnabled(
                percentRecommendationReferencePoint.buckets,
                percentRecommendationReferencePoint.filters,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(percentRecommendationReferencePoint);

        const newStack: IBucketItem = {
            localIdentifier: "s1",
            type: "attribute",
            aggregation: null as unknown as undefined,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 2, "items", 0], newStack);

        expect(
            percentRecommendationEnabled(editedReferencePoint.buckets, editedReferencePoint.filters),
        ).toBeFalsy();
    });

    it("should return false if ranking filter exists", () => {
        const editedReferencePoint = cloneDeep(percentRecommendationReferencePoint);
        set(editedReferencePoint, ["filters", "items", 0], rankingFilterBucketItem);

        expect(
            percentRecommendationEnabled(editedReferencePoint.buckets, editedReferencePoint.filters),
        ).toBeFalsy();
    });
});

describe("previousPeriodRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(previousPeriodRecommendationEnabled(percentRecommendationReferencePoint.buckets)).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(percentRecommendationReferencePoint);

        const newMetric: IBucketItem = {
            localIdentifier: "m2",
            type: "attribute",
            aggregation: null as unknown as undefined,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 0, "items", 1], newMetric);

        expect(previousPeriodRecommendationEnabled(editedReferencePoint.buckets)).toBeFalsy();
    });
});

describe("partial rules", () => {
    describe("noDerivedMeasurePresent", () => {
        it("should return true for no bucket", () => {
            const buckets: IBucketOfFun[] = [];

            const result = noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return true for empty bucket items", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [],
                },
            ];

            const result = noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return true for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [masterMeasureItems[0]],
                },
            ];

            const result = noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return false if there is a derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [masterMeasureItems[0], derivedMeasureItems[0]],
                },
            ];

            const result = noDerivedMeasurePresent(buckets);

            expect(result).toBe(false);
        });
    });

    describe("hasSomeSegmentByItems", () => {
        it("should return false when bucket not exist", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
            ];

            const result = hasSomeSegmentByItems(buckets);

            expect(result).toBe(false);
        });

        it("should return false for empty bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ];

            const result = hasSomeSegmentByItems(buckets);

            expect(result).toBe(false);
        });

        it("should return true when some attribute in bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "segment",
                    items: [
                        {
                            localIdentifier: "v1",
                            type: "attribute",
                            aggregation: null as unknown as undefined,
                            attribute: "attr.owner.department",
                        },
                    ],
                },
            ];

            const result = hasSomeSegmentByItems(buckets);

            expect(result).toBe(true);
        });

        it("should return true when more attributes in bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "segment",
                    items: [
                        {
                            localIdentifier: "v1",
                            type: "attribute",
                            aggregation: null as unknown as undefined,
                            attribute: "attr.owner.department",
                        },
                        {
                            localIdentifier: "v2",
                            type: "attribute",
                            aggregation: null as unknown as undefined,
                            attribute: "attr.owner.department",
                        },
                    ],
                },
            ];

            const result = hasSomeSegmentByItems(buckets);

            expect(result).toBe(true);
        });
    });

    describe("hasOneMasterMeasureInBucket", () => {
        it("should return false for empty bucket items", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
            ];

            const result = hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(false);
        });

        it("should return true for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
            ];

            const result = hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(true);
        });

        it("should return true if there is just one master measure and its derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1], derivedMeasureItems[1]],
                },
            ];

            const result = hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(true);
        });

        it("should return false if there are more master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1], derivedMeasureItems[1], masterMeasureItems[2]],
                },
            ];

            const result = hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(false);
        });
    });

    describe("getMasterMeasuresCount", () => {
        it("should return 0 for empty bucket items", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [],
                },
            ];

            const result = getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(0);
        });

        it("should return 1 for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [masterMeasureItems[0]],
                },
            ];

            const result = getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(1);
        });

        it("should return 1 if there is derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [masterMeasureItems[0], derivedMeasureItems[0]],
                },
            ];

            const result = getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(1);
        });

        it("should count just master measures in given bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [
                        masterMeasureItems[0],
                        derivedMeasureItems[0],
                        masterMeasureItems[1],
                        derivedMeasureItems[2],
                        masterMeasureItems[2],
                    ],
                },
                {
                    localIdentifier: "bucketak",
                    items: [masterMeasureItems[3], derivedMeasureItems[3]],
                },
            ];

            const result = getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(3);
        });
    });

    describe("hasUsedDate", () => {
        const bucketsEmpty: IBucketOfFun[] = [];
        const emptyFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        it("should return false when date filter is empty and no date in category", () => {
            expect(hasUsedDate(bucketsEmpty, emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is set to all time and no date in category", () => {
            expect(hasUsedDate(bucketsEmpty, dateFilterBucketAllTime)).toBeTruthy();
        });

        it("should return true when date filter is set to last year and no date in category", () => {
            expect(hasUsedDate(bucketsEmpty, samePeriodPrevYearFiltersBucket)).toBeTruthy();
        });

        it("should return true when date filter is empty and date used in category", () => {
            expect(
                hasUsedDate(metricWithViewByDateAndDateFilterReferencePoint.buckets, emptyFilters),
            ).toBeTruthy();
        });

        it("should return true when date filter is set and date used in category", () => {
            expect(
                hasUsedDate(
                    metricWithViewByDateAndDateFilterReferencePoint.buckets,
                    samePeriodPrevYearFiltersBucket,
                ),
            ).toBeTruthy();
        });
    });

    describe("hasGlobalDateFilter", () => {
        const emptyFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        it("should return false when the filter bucket is empty", () => {
            expect(hasGlobalDateFilter(emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to all-time", () => {
            expect(hasGlobalDateFilter(dateFilterBucketAllTime)).toBeTruthy();
        });

        it("should return true when date filter is in the filter bucket and is set to last year", () => {
            expect(hasGlobalDateFilter(samePeriodPrevYearFiltersBucket)).toBeTruthy();
        });

        it("should return false when only attribute filter is in the filter bucket", () => {
            expect(hasGlobalDateFilter(attributeFilterBucketItem)).toBeFalsy();
        });
    });

    describe("hasGlobalDateFilterIgnoreAllTime", () => {
        const emptyFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        it("should return false when the filter bucket is empty", () => {
            expect(hasGlobalDateFilterIgnoreAllTime(emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to all-time", () => {
            expect(hasGlobalDateFilterIgnoreAllTime(dateFilterBucketAllTime)).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to last year", () => {
            expect(hasGlobalDateFilterIgnoreAllTime(samePeriodPrevYearFiltersBucket)).toBeTruthy();
        });

        it("should return false when date filter set to last year is not first", () => {
            expect(hasGlobalDateFilterIgnoreAllTime(twoDateFiltersBucket)).toBeFalsy();
        });

        it("should return false when only attribute filter is in the filter bucket", () => {
            expect(hasGlobalDateFilterIgnoreAllTime(attributeFilterBucketItem)).toBeFalsy();
        });
    });

    describe("hasOneMeasureOrAlsoLineStyleControlMeasure", () => {
        it("should return true when there's just one measure in bucket", () => {
            const bucketsWithOneMeasure: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [masterMeasureItems[0]],
                },
            ];
            expect(hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithOneMeasure)).toBeTruthy();
        });

        it("should return false when there's two measures in bucket", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [masterMeasureItems[0], masterMeasureItems[1]],
                },
            ];
            expect(hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures)).toBeFalsy();
        });

        it("should return true when there's two measures in bucket but one is line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [masterMeasureItems[0], thresholdMeasure],
                },
            ];
            expect(hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures)).toBeTruthy();
        });

        it("should return false when there's three measures in bucket but one is line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [masterMeasureItems[0], masterMeasureItems[1], thresholdMeasure],
                },
            ];
            expect(hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures)).toBeFalsy();
        });

        it("should return false when there's two measures in bucket, both are line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [thresholdMeasure, thresholdMeasure],
                },
            ];
            expect(hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures)).toBeFalsy();
        });
    });
});
