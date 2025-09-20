// (C) 2019-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";
import { describe, expect, it } from "vitest";

import { BucketNames } from "@gooddata/sdk-ui";

import { IBucketItem, IBucketOfFun, IFilters } from "../../interfaces/Visualization.js";
import * as referencePointMocks from "../../tests/mocks/referencePointMocks.js";
import * as bucketRules from "../bucketRules.js";

describe("isShowInPercentAllowed", () => {
    it("should return true if buckets rules met", () => {
        expect(
            bucketRules.isShowInPercentAllowed(
                referencePointMocks.metricWithViewByDateAndDateFilterReferencePoint.buckets,
                referencePointMocks.metricWithViewByDateAndDateFilterReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met ", () => {
        expect(
            bucketRules.isShowInPercentAllowed(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets,
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeFalsy();
    });

    it("should return true if measure value filter is present", () => {
        expect(
            bucketRules.isShowInPercentAllowed(
                referencePointMocks.measureValueFilterReferencePoint.buckets,
                referencePointMocks.measureValueFilterReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeTruthy();
    });

    it("should return false if measure value filter by derived measure is present", () => {
        expect(
            bucketRules.isShowInPercentAllowed(
                referencePointMocks.measureValueFilterByDerivedReferencePoint.buckets,
                referencePointMocks.measureValueFilterByDerivedReferencePoint.filters,
                BucketNames.MEASURES,
            ),
        ).toBeFalsy();
    });

    it("should return false if ranking filter is present", () => {
        const editedReferencePoint = cloneDeep(
            referencePointMocks.metricWithViewByDateAndDateFilterReferencePoint,
        );
        set(editedReferencePoint, ["filters", "items", 1], referencePointMocks.rankingFilterBucketItem);

        expect(
            bucketRules.isShowInPercentAllowed(
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
            bucketRules.overTimeComparisonRecommendationEnabled(
                referencePointMocks.overTimeComparisonRecommendationRefPoint,
                false,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.overTimeComparisonRecommendationRefPoint);
        const newMetric: IBucketItem = {
            localIdentifier: "m2",
            type: "metric",
            aggregation: null,
            attribute: "aazb6kroa3iC",
            showInPercent: null,
        };

        set(editedReferencePoint, ["buckets", 0, "items", 1], newMetric);

        expect(bucketRules.overTimeComparisonRecommendationEnabled(editedReferencePoint, false)).toBeFalsy();
    });

    it("should return true if insight is sliced by weeks and week filters are enabled", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.overTimeComparisonRecommendationRefPoint);
        set(editedReferencePoint, ["buckets", 1, "items", 0], referencePointMocks.sliceByWeekBucketItem);

        expect(bucketRules.overTimeComparisonRecommendationEnabled(editedReferencePoint, true)).toBeTruthy();
    });

    it("should return false if insight is sliced by weeks and week filters are not enabled", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.overTimeComparisonRecommendationRefPoint);
        set(editedReferencePoint, ["buckets", 1, "items", 0], referencePointMocks.sliceByWeekBucketItem);

        expect(bucketRules.overTimeComparisonRecommendationEnabled(editedReferencePoint, false)).toBeFalsy();
    });
});

describe("comparisonAndTrendingRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            bucketRules.comparisonAndTrendingRecommendationEnabled(
                referencePointMocks.comparisonAndTrendingRecommendationReferencePoint.buckets,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(
            referencePointMocks.comparisonAndTrendingRecommendationReferencePoint,
        );

        const newCategory: IBucketItem = {
            localIdentifier: "v1",
            type: "attribute",
            aggregation: null,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 1, "items", 0], newCategory);

        expect(
            bucketRules.comparisonAndTrendingRecommendationEnabled(editedReferencePoint.buckets),
        ).toBeFalsy();
    });
});

describe("percentRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            bucketRules.percentRecommendationEnabled(
                referencePointMocks.percentRecommendationReferencePoint.buckets,
                referencePointMocks.percentRecommendationReferencePoint.filters,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.percentRecommendationReferencePoint);

        const newStack: IBucketItem = {
            localIdentifier: "s1",
            type: "attribute",
            aggregation: null,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 2, "items", 0], newStack);

        expect(
            bucketRules.percentRecommendationEnabled(
                editedReferencePoint.buckets,
                editedReferencePoint.filters,
            ),
        ).toBeFalsy();
    });

    it("should return false if ranking filter exists", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.percentRecommendationReferencePoint);
        set(editedReferencePoint, ["filters", "items", 0], referencePointMocks.rankingFilterBucketItem);

        expect(
            bucketRules.percentRecommendationEnabled(
                editedReferencePoint.buckets,
                editedReferencePoint.filters,
            ),
        ).toBeFalsy();
    });
});

describe("previousPeriodRecommendationEnabled", () => {
    it("should return true if buckets rules met", () => {
        expect(
            bucketRules.previousPeriodRecommendationEnabled(
                referencePointMocks.percentRecommendationReferencePoint.buckets,
            ),
        ).toBeTruthy();
    });

    it("should return false if buckets rules doesn't met", () => {
        const editedReferencePoint = cloneDeep(referencePointMocks.percentRecommendationReferencePoint);

        const newMetric: IBucketItem = {
            localIdentifier: "m2",
            type: "attribute",
            aggregation: null,
            attribute: "attr.owner.department",
        };

        set(editedReferencePoint, ["buckets", 0, "items", 1], newMetric);

        expect(bucketRules.previousPeriodRecommendationEnabled(editedReferencePoint.buckets)).toBeFalsy();
    });
});

describe("partial rules", () => {
    describe("noDerivedMeasurePresent", () => {
        it("should return true for no bucket", () => {
            const buckets: IBucketOfFun[] = [];

            const result = bucketRules.noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return true for empty bucket items", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [],
                },
            ];

            const result = bucketRules.noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return true for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
            ];

            const result = bucketRules.noDerivedMeasurePresent(buckets);

            expect(result).toBe(true);
        });

        it("should return false if there is a derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "whatever",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.derivedMeasureItems[0],
                    ],
                },
            ];

            const result = bucketRules.noDerivedMeasurePresent(buckets);

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

            const result = bucketRules.hasSomeSegmentByItems(buckets);

            expect(result).toBe(false);
        });

        it("should return false for empty bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "segment",
                    items: [],
                },
            ];

            const result = bucketRules.hasSomeSegmentByItems(buckets);

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
                            aggregation: null,
                            attribute: "attr.owner.department",
                        },
                    ],
                },
            ];

            const result = bucketRules.hasSomeSegmentByItems(buckets);

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
                            aggregation: null,
                            attribute: "attr.owner.department",
                        },
                        {
                            localIdentifier: "v2",
                            type: "attribute",
                            aggregation: null,
                            attribute: "attr.owner.department",
                        },
                    ],
                },
            ];

            const result = bucketRules.hasSomeSegmentByItems(buckets);

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

            const result = bucketRules.hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(false);
        });

        it("should return true for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
            ];

            const result = bucketRules.hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(true);
        });

        it("should return true if there is just one master measure and its derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.derivedMeasureItems[1],
                    ],
                },
            ];

            const result = bucketRules.hasOneMasterMeasureInBucket(buckets, "measures");

            expect(result).toBe(true);
        });

        it("should return false if there are more master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.derivedMeasureItems[1],
                        referencePointMocks.masterMeasureItems[2],
                    ],
                },
            ];

            const result = bucketRules.hasOneMasterMeasureInBucket(buckets, "measures");

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

            const result = bucketRules.getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(0);
        });

        it("should return 1 for only master measures", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
            ];

            const result = bucketRules.getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(1);
        });

        it("should return 1 if there is derived measure present", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.derivedMeasureItems[0],
                    ],
                },
            ];

            const result = bucketRules.getMasterMeasuresCount(buckets, "bucketidentifier");

            expect(result).toBe(1);
        });

        it("should count just master measures in given bucket", () => {
            const buckets: IBucketOfFun[] = [
                {
                    localIdentifier: "bucketidentifier",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.derivedMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.derivedMeasureItems[2],
                        referencePointMocks.masterMeasureItems[2],
                    ],
                },
                {
                    localIdentifier: "bucketak",
                    items: [
                        referencePointMocks.masterMeasureItems[3],
                        referencePointMocks.derivedMeasureItems[3],
                    ],
                },
            ];

            const result = bucketRules.getMasterMeasuresCount(buckets, "bucketidentifier");

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
            expect(bucketRules.hasUsedDate(bucketsEmpty, emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is set to all time and no date in category", () => {
            expect(
                bucketRules.hasUsedDate(bucketsEmpty, referencePointMocks.dateFilterBucketAllTime),
            ).toBeTruthy();
        });

        it("should return true when date filter is set to last year and no date in category", () => {
            expect(
                bucketRules.hasUsedDate(bucketsEmpty, referencePointMocks.samePeriodPrevYearFiltersBucket),
            ).toBeTruthy();
        });

        it("should return true when date filter is empty and date used in category", () => {
            expect(
                bucketRules.hasUsedDate(
                    referencePointMocks.metricWithViewByDateAndDateFilterReferencePoint.buckets,
                    emptyFilters,
                ),
            ).toBeTruthy();
        });

        it("should return true when date filter is set and date used in category", () => {
            expect(
                bucketRules.hasUsedDate(
                    referencePointMocks.metricWithViewByDateAndDateFilterReferencePoint.buckets,
                    referencePointMocks.samePeriodPrevYearFiltersBucket,
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
            expect(bucketRules.hasGlobalDateFilter(emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to all-time", () => {
            expect(bucketRules.hasGlobalDateFilter(referencePointMocks.dateFilterBucketAllTime)).toBeTruthy();
        });

        it("should return true when date filter is in the filter bucket and is set to last year", () => {
            expect(
                bucketRules.hasGlobalDateFilter(referencePointMocks.samePeriodPrevYearFiltersBucket),
            ).toBeTruthy();
        });

        it("should return false when only attribute filter is in the filter bucket", () => {
            expect(
                bucketRules.hasGlobalDateFilter(referencePointMocks.attributeFilterBucketItem),
            ).toBeFalsy();
        });
    });

    describe("hasGlobalDateFilterIgnoreAllTime", () => {
        const emptyFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        it("should return false when the filter bucket is empty", () => {
            expect(bucketRules.hasGlobalDateFilterIgnoreAllTime(emptyFilters)).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to all-time", () => {
            expect(
                bucketRules.hasGlobalDateFilterIgnoreAllTime(referencePointMocks.dateFilterBucketAllTime),
            ).toBeFalsy();
        });

        it("should return true when date filter is in the filter bucket and is set to last year", () => {
            expect(
                bucketRules.hasGlobalDateFilterIgnoreAllTime(
                    referencePointMocks.samePeriodPrevYearFiltersBucket,
                ),
            ).toBeTruthy();
        });

        it("should return false when date filter set to last year is not first", () => {
            expect(
                bucketRules.hasGlobalDateFilterIgnoreAllTime(referencePointMocks.twoDateFiltersBucket),
            ).toBeFalsy();
        });

        it("should return false when only attribute filter is in the filter bucket", () => {
            expect(
                bucketRules.hasGlobalDateFilterIgnoreAllTime(referencePointMocks.attributeFilterBucketItem),
            ).toBeFalsy();
        });
    });

    describe("hasOneMeasureOrAlsoLineStyleControlMeasure", () => {
        it("should return true when there's just one measure in bucket", () => {
            const bucketsWithOneMeasure: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
            ];
            expect(
                bucketRules.hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithOneMeasure),
            ).toBeTruthy();
        });

        it("should return false when there's two measures in bucket", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                    ],
                },
            ];
            expect(
                bucketRules.hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures),
            ).toBeFalsy();
        });

        it("should return true when there's two measures in bucket but one is line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [referencePointMocks.masterMeasureItems[0], referencePointMocks.thresholdMeasure],
                },
            ];
            expect(
                bucketRules.hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures),
            ).toBeTruthy();
        });

        it("should return false when there's three measures in bucket but one is line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                        referencePointMocks.thresholdMeasure,
                    ],
                },
            ];
            expect(
                bucketRules.hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures),
            ).toBeFalsy();
        });

        it("should return false when there's two measures in bucket, both are line style control metric", () => {
            const bucketsWithTwoMeasures: IBucketOfFun[] = [
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [referencePointMocks.thresholdMeasure, referencePointMocks.thresholdMeasure],
                },
            ];
            expect(
                bucketRules.hasOneMeasureOrAlsoLineStyleControlMeasure(bucketsWithTwoMeasures),
            ).toBeFalsy();
        });
    });
});
