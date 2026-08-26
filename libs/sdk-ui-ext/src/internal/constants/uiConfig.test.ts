// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IBucketUiConfig } from "../interfaces/Visualization.js";

import { ATTRIBUTE, COMPUTED_ATTRIBUTE, GEO_ATTRIBUTE, METRIC } from "./bucket.js";
import * as uiConfigs from "./uiConfig.js";

type BucketEntry = { config: string; bucket: string; accepts: string[] };

/**
 * Every bucket of every visualization config, flattened, so the assertions below cannot silently
 * miss a config that is added later.
 */
function allBuckets(): BucketEntry[] {
    return Object.entries(uiConfigs).flatMap(([config, value]) => {
        const buckets = (value as { buckets?: Record<string, IBucketUiConfig> })?.buckets;
        if (!buckets) {
            return [];
        }

        return Object.entries(buckets)
            .filter(([, bucket]) => Array.isArray(bucket?.accepts))
            .map(([bucket, { accepts }]) => ({ config, bucket, accepts: accepts as string[] }));
    });
}

describe("uiConfig computed attributes", () => {
    const buckets = allBuckets();

    it("should have found the visualization bucket configs", () => {
        // a guard on the guard: if the shape of uiConfig.ts changes so that nothing is found, the
        // assertions below would pass vacuously
        expect(buckets.length).toBeGreaterThan(20);
    });

    it("should accept a computed attribute in every bucket that groups by an attribute", () => {
        // A computed attribute is offered wherever an attribute GROUPS the result. It is deliberately
        // not offered where a bucket only takes an attribute to coerce it into a measure (those also
        // accept METRIC - the backend rejects a computed attribute as a COUNT witness), in the
        // filters bucket (filtering by one is not supported yet), and in the geo buckets that need
        // geo display forms (those also accept GEO_ATTRIBUTE - a computed attribute has none).
        const missing = buckets.filter(
            ({ bucket, accepts }) =>
                accepts.includes(ATTRIBUTE) &&
                !accepts.includes(COMPUTED_ATTRIBUTE) &&
                !accepts.includes(METRIC) &&
                !accepts.includes(GEO_ATTRIBUTE) &&
                bucket !== "filters",
        );

        expect(missing).toEqual([]);
    });

    it("should never accept a computed attribute in a measure, filter or geo bucket", () => {
        const unexpected = buckets.filter(
            ({ bucket, accepts }) =>
                accepts.includes(COMPUTED_ATTRIBUTE) &&
                (accepts.includes(METRIC) || accepts.includes(GEO_ATTRIBUTE) || bucket === "filters"),
        );

        expect(unexpected).toEqual([]);
    });
});
