// (C) 2020-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { BucketNames } from "@gooddata/sdk-ui";

import { IBucketItem } from "../../../../interfaces/Visualization.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { transformBuckets } from "../bucketHelper.js";

describe("bullet chart bucket helper", () => {
    const getBucket = (localIdentifier: string, items: IBucketItem[]) => ({
        localIdentifier,
        items,
    });

    describe("transformBucketItems", () => {
        it("should distribute measures in a single bucket into separate measure buckets with limit of one measure each", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, [
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[1],
                    referencePointMocks.masterMeasureItems[2],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.masterMeasureItems[2]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should distribute measures from two measure buckets into separate measure buckets keeping measures in its original bucket", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, [
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[1],
                ]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[2]]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[2]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should keep only first three measures and distribute those into separate buckets", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, [
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[3],
                    referencePointMocks.masterMeasureItems[2],
                    referencePointMocks.masterMeasureItems[1],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[3]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.masterMeasureItems[2]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should keep master measure with its derived measure if both measures (derived is force-placed right after master) fits into limit of first three measures", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, [
                    referencePointMocks.masterMeasureItems[1],
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[2],
                    referencePointMocks.masterMeasureItems[3],
                    referencePointMocks.derivedMeasureItems[0],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.derivedMeasureItems[0]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should keep only master measure without its derived measure if only master measure fits into limit of first three measures", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, [
                    referencePointMocks.masterMeasureItems[1],
                    referencePointMocks.masterMeasureItems[2],
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[3],
                    referencePointMocks.derivedMeasureItems[0],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[2]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should put measure that doesn't fit into it's original bucket into next empty measure bucket", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, []),
                getBucket(BucketNames.SECONDARY_MEASURES, [
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.masterMeasureItems[1],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, []),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should put derived measures that doesn't fit in its original buckets to empty buckets", () => {
            const buckets = [
                getBucket(BucketNames.MEASURES, []),
                getBucket(BucketNames.SECONDARY_MEASURES, [
                    referencePointMocks.masterMeasureItems[0],
                    referencePointMocks.derivedMeasureItems[0],
                ]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, []),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.TERTIARY_MEASURES, [referencePointMocks.derivedMeasureItems[0]]),
                getBucket(BucketNames.VIEW, []),
            ]);
        });

        it("should distribute measures after switching from Geo Chart", () => {
            const buckets = [
                getBucket(BucketNames.SIZE, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.COLOR, [referencePointMocks.masterMeasureItems[1]]),
            ];
            const actual = transformBuckets(buckets);

            expect(actual).toEqual([
                getBucket(BucketNames.MEASURES, [referencePointMocks.masterMeasureItems[0]]),
                getBucket(BucketNames.SECONDARY_MEASURES, [referencePointMocks.masterMeasureItems[1]]),
                getBucket(BucketNames.TERTIARY_MEASURES, []),
                getBucket(BucketNames.VIEW, []),
            ]);
        });
    });
});
