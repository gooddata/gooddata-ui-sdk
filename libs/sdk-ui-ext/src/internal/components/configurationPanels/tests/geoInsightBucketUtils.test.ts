// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newAttribute, newBucket, newInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { isPushpinClusteringEditable } from "../geoInsightBucketUtils.js";

const visualizationUrl = "local:pushpin";

function createPushpinInsight(buckets: ReturnType<typeof newBucket>[]) {
    return newInsightDefinition(visualizationUrl, (builder) => builder.title("pushpin").buckets(buckets));
}

describe("geoInsightBucketUtils", () => {
    it("disables clustering for tooltip-only metrics", () => {
        const insight = createPushpinInsight([
            newBucket(
                BucketNames.LOCATION,
                newAttribute("attr.region", (attribute) => attribute.localId("location")),
            ),
            newBucket(
                BucketNames.MEASURES,
                newMeasure("m1", (measure) => measure.localId("metric")),
            ),
        ]);

        expect(isPushpinClusteringEditable(insight)).toBe(false);
    });

    it.each([
        [
            "size measure",
            createPushpinInsight([
                newBucket(
                    BucketNames.LOCATION,
                    newAttribute("attr.region", (attribute) => attribute.localId("location")),
                ),
                newBucket(
                    BucketNames.SIZE,
                    newMeasure("m1", (measure) => measure.localId("size")),
                ),
            ]),
            "circle" as const,
        ],
        [
            "color measure",
            createPushpinInsight([
                newBucket(
                    BucketNames.LOCATION,
                    newAttribute("attr.region", (attribute) => attribute.localId("location")),
                ),
                newBucket(
                    BucketNames.COLOR,
                    newMeasure("m1", (measure) => measure.localId("color")),
                ),
            ]),
            "circle" as const,
        ],
        [
            "segment attribute",
            createPushpinInsight([
                newBucket(
                    BucketNames.LOCATION,
                    newAttribute("attr.region", (attribute) => attribute.localId("location")),
                ),
                newBucket(
                    BucketNames.SEGMENT,
                    newAttribute("attr.segment", (attribute) => attribute.localId("segment")),
                ),
            ]),
            "circle" as const,
        ],
        [
            "icon-based shape",
            createPushpinInsight([
                newBucket(
                    BucketNames.LOCATION,
                    newAttribute("attr.region", (attribute) => attribute.localId("location")),
                ),
            ]),
            "oneIcon" as const,
        ],
    ])("disables clustering for %s", (_label, insight, shapeType) => {
        expect(isPushpinClusteringEditable(insight, shapeType)).toBe(false);
    });
});
