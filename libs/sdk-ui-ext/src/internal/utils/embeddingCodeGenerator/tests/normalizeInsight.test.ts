// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    bucketItems,
    idRef,
    insightBuckets,
    insightFilters,
    isLocalIdRef,
    isMeasure,
    isMeasureValueFilter,
    localIdRef,
    measureLocalId,
    newBucket,
    newInsightDefinition,
    newMeasure,
    newMeasureValueFilter,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { normalizeInsight } from "../normalizeInsight.js";

describe("normalizeInsight", () => {
    it("does not throw when insight contains dangling localId references in filters", () => {
        const insight = newInsightDefinition("local:test", (builder) =>
            builder
                .buckets([
                    newBucket(
                        BucketNames.MEASURES,
                        newMeasure(idRef("m1", "measure"), (m) => m.localId("m_in_bucket")),
                    ),
                ])
                .filters([newMeasureValueFilter(localIdRef("dangling_local_id"), "EQUAL_TO", 1)]),
        );

        expect(() => normalizeInsight(insight)).not.toThrow();
        const normalized = normalizeInsight(insight);
        expect(normalized).toBeDefined();

        const [filter] = insightFilters(normalized);
        expect(isMeasureValueFilter(filter)).toBe(true);
        if (isMeasureValueFilter(filter)) {
            const measureRef = filter.measureValueFilter.measure;
            expect(isLocalIdRef(measureRef)).toBe(true);
            if (isLocalIdRef(measureRef)) {
                // unknown/dangling localIdRef cannot be normalized, must remain intact
                expect(measureRef.localIdentifier).toBe("dangling_local_id");
            }
        }
    });

    it("rewrites MVF localIdRef to match normalized bucket item localId", () => {
        const insight = newInsightDefinition("local:test", (builder) =>
            builder
                .buckets([
                    newBucket(
                        BucketNames.MEASURES,
                        newMeasure(idRef("m1", "measure"), (m) => m.localId("m_in_bucket")),
                    ),
                ])
                .filters([newMeasureValueFilter(localIdRef("m_in_bucket"), "EQUAL_TO", 1)]),
        );

        const normalized = normalizeInsight(insight);

        const bucket = insightBuckets(normalized)[0];
        const normalizedMeasure = bucketItems(bucket).find(isMeasure);
        expect(normalizedMeasure).toBeDefined();

        const [filter] = insightFilters(normalized);
        expect(isMeasureValueFilter(filter)).toBe(true);
        if (normalizedMeasure && isMeasureValueFilter(filter)) {
            const measureRef = filter.measureValueFilter.measure;
            expect(isLocalIdRef(measureRef)).toBe(true);
            if (isLocalIdRef(measureRef)) {
                expect(measureRef.localIdentifier).toBe(measureLocalId(normalizedMeasure));
            }
        }
    });
});
