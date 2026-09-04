// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IBucketUiConfig } from "../interfaces/Visualization.js";

import { COMPUTED_ATTRIBUTE } from "./bucket.js";
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

    it("should never name the computed attribute type - it is normalized to an attribute", () => {
        // A computed attribute is an attribute for every drop rule (see AD models/bucket_rules.ts
        // `normalizeDraggedItemType`), so a bucket that takes attributes takes computed ones too and
        // no `accepts` list has to say so. The geo buckets stay closed to it because they demand a
        // GEO_ATTRIBUTE, which a computed attribute has no display forms for.
        const naming = buckets.filter(({ accepts }) => accepts.includes(COMPUTED_ATTRIBUTE));

        expect(naming).toEqual([]);
    });
});
