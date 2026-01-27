// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DEFAULT_HEADLINE_UICONFIG } from "../../../../constants/uiConfig.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
} from "../../../../interfaces/Visualization.js";
import {
    attributeItems,
    dateItem,
    derivedMeasureItems,
    masterMeasureItems,
} from "../../../../tests/mocks/referencePointMocks.js";
import {
    findComplementaryOverTimeComparisonMeasure,
    findSecondMasterMeasure,
    setHeadlineRefPointBuckets,
    tryToMapForeignBuckets,
} from "../headlineBucketHelper.js";

describe("headlineBucketHelper", () => {
    function createReferencePoint(
        buckets: IBucketOfFun[] = [],
        uiConfig = { buckets: {} },
    ): IExtendedReferencePoint {
        return {
            buckets,
            filters: {
                localIdentifier: "filters",
                items: [],
            },
            uiConfig,
        };
    }

    describe("findSecondMasterMeasure", () => {
        it("should return null when no measures provided", () => {
            expect(findSecondMasterMeasure([])).toBe(null);
        });

        it("should return null when no master measure provided", () => {
            const measures: IBucketItem[] = [
                {
                    localIdentifier: "m2_pop",
                    type: "metric",
                    masterLocalIdentifier: "m2",
                    overTimeComparisonType: "previous_period",
                },
                {
                    localIdentifier: "m3_pop",
                    type: "metric",
                    masterLocalIdentifier: "m3",
                    overTimeComparisonType: "previous_period",
                },
            ];

            expect(findSecondMasterMeasure(measures)).toBe(null);
        });

        it("should return second measure when more measures provided", () => {
            const measures: IBucketItem[] = [
                {
                    localIdentifier: "m2_pop",
                    type: "metric",
                    masterLocalIdentifier: "m2",
                    overTimeComparisonType: "previous_period",
                },
                { localIdentifier: "m1", type: "metric" },
                { localIdentifier: "m2", type: "metric" },
            ];

            expect(findSecondMasterMeasure(measures)).toEqual({
                localIdentifier: "m2",
                type: "metric",
            });
        });
    });

    describe("tryToMapForeignBuckets", () => {
        it("should map buckets when source bucket contains one measure", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint!.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
            ]);
        });

        it("should map buckets when source buckets has same name and one measure each", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint!.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[1]],
                },
            ]);
        });

        it("should map buckets when source buckets has different name and one measure each", () => {
            const buckets = [
                {
                    localIdentifier: "some_measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "unknown_measures_bucket",
                    items: [masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint!.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[1]],
                },
            ]);
        });

        it("should map buckets when source bucket contains one measure in first bucket and several empty buckets", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "some_other_measures",
                    items: [],
                },
                {
                    localIdentifier: "another_measures",
                    items: [],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint!.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
            ]);
        });

        it("should map buckets when source buckets has different name and one has master and other has derived measure", () => {
            const buckets = [
                {
                    localIdentifier: "some_measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "unknown_measures_bucket",
                    items: [derivedMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint!.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [derivedMeasureItems[1]],
                },
            ]);
        });

        it("should not map buckets since first bucket contains multiple items", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0], masterMeasureItems[1]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since second bucket contains multiple items", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [masterMeasureItems[0], masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since third bucket contains multiple items", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "unknown_measures_bucket",
                    items: [masterMeasureItems[0], masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since second bucket is empty and some measure is present in third bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "unknown_measures_bucket",
                    items: [masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since first and second buckets are empty and some measure is present in third bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "uknown_measures_bucket",
                    items: [masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since attribute present in second bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1]],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItems[0]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since attribute present in first bucket", () => {
            const buckets = [
                {
                    localIdentifier: "view",
                    items: [attributeItems[0]],
                },
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since attribute present in third bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItems[0]],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since date attribute present in second bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1]],
                },
                {
                    localIdentifier: "view",
                    items: [dateItem],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });

        it("should not map buckets since date attribute present in third bucket", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[1]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "view",
                    items: [dateItem],
                },
            ];
            const referencePoint = createReferencePoint(buckets, DEFAULT_HEADLINE_UICONFIG);
            const newReferencePoint = tryToMapForeignBuckets(referencePoint);

            expect(newReferencePoint).toEqual(null);
        });
    });

    describe("setHeadlineRefPointBuckets", () => {
        const primary: IBucketItem = { localIdentifier: "bar" };
        const secondary: IBucketItem = { localIdentifier: "baz" };

        it("should return empty primary and secondary bucket when items not provided", () => {
            const headlineReferencePoint = setHeadlineRefPointBuckets(createReferencePoint());

            expect(headlineReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
            ]);
        });

        it("should return primary bucket with one item and empty secondary", () => {
            const headlineReferencePoint = setHeadlineRefPointBuckets(createReferencePoint(), primary);

            expect(headlineReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [primary],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
            ]);
        });

        it("should return primary bucket with one item and secondary with second item", () => {
            const headlineReferencePoint = setHeadlineRefPointBuckets(createReferencePoint(), primary, [
                secondary,
            ]);

            expect(headlineReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [primary],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [secondary],
                },
            ]);
        });
    });

    describe("findComplementaryOverTimeComparisonMeasure", () => {
        const master1 = {
            localIdentifier: "m1",
        };
        const derived1 = {
            localIdentifier: "m1_pop",
            masterLocalIdentifier: "m1",
        };
        const masterWithoutDerived = {
            localIdentifier: "m3",
        };
        const derivedWithoutMaster = {
            localIdentifier: "m4_pop",
            masterLocalIdentifier: "mx",
        };
        const measures: IBucketItem[] = [master1, derived1, masterWithoutDerived, derivedWithoutMaster];

        it("should return null when no primary measure provided", () => {
            expect(findComplementaryOverTimeComparisonMeasure(null, measures)).toEqual(null);
        });

        it("should return derived measure when primary is its master", () => {
            expect(findComplementaryOverTimeComparisonMeasure(master1, measures)).toEqual(derived1);
        });

        it("should return master measure when primary is its derived", () => {
            expect(findComplementaryOverTimeComparisonMeasure(derived1, measures)).toEqual(master1);
        });

        it("should return null when primary is derived, but its master does not exists", () => {
            expect(findComplementaryOverTimeComparisonMeasure(derivedWithoutMaster, measures)).toEqual(null);
        });

        it("should return null when primary is master, but its derived does not exists", () => {
            expect(findComplementaryOverTimeComparisonMeasure(masterWithoutDerived, measures)).toEqual(null);
        });

        it("should return null when primary is only measure", () => {
            expect(findComplementaryOverTimeComparisonMeasure(master1, [master1])).toEqual(null);
        });
    });
});
