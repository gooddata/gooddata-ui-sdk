// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    generateBucketItemIdentifier,
    generateDerivedMeasureLocalIdentifier,
} from "./bucket_item_identifier.js";

describe("bucket item identifier", () => {
    describe("generateBucketItemIdentifier", () => {
        it("should generate string of 32 alphanumeric characters", () => {
            const identifier = generateBucketItemIdentifier();

            expect(identifier).toMatch(/^[a-z0-9]{32}$/);
        });

        it("should always generate unique string", () => {
            const identifier1 = generateBucketItemIdentifier();
            const identifier2 = generateBucketItemIdentifier();

            expect(identifier1 === identifier2).toBe(false);
        });
    });

    describe("generateDerivedMeasureLocalIdentifier", () => {
        it("should generate correct local identifier for SAME_PERIOD_PREVIOUS_YEAR", () => {
            const derivedMeasureLocalIdentifier = generateDerivedMeasureLocalIdentifier(
                "m1",
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );
            expect(derivedMeasureLocalIdentifier).toEqual("m1_pop");
        });

        it("should generate correct local identifier for PREVIOUS_PERIOD", () => {
            const derivedMeasureLocalIdentifier = generateDerivedMeasureLocalIdentifier(
                "m1",
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );
            expect(derivedMeasureLocalIdentifier).toEqual("m1_previous_period");
        });

        it("should generate local identifier for unsupported comparison over time type", () => {
            const derivedMeasureLocalIdentifier = generateDerivedMeasureLocalIdentifier(
                "m1",
                OverTimeComparisonTypes.NOTHING,
            );
            expect(derivedMeasureLocalIdentifier).toEqual("m1_unsupported_derived_measure");
        });
    });
});
