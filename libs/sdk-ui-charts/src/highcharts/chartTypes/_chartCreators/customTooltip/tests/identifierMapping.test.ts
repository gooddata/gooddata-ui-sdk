// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IBucket,
    idRef,
    newArithmeticMeasure,
    newBucket,
    newDefForBuckets,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { buildIdentifierMapping } from "../identifierMapping.js";

const measureA = newMeasure(idRef("metric_a", "measure"), (m) => m.localId("m_a"));
const measureB = newMeasure(idRef("metric_b", "measure"), (m) => m.localId("m_b"));
const measureC = newMeasure(idRef("metric_c", "measure"), (m) => m.localId("m_c"));

const defWith = (buckets: IBucket[]) => newDefForBuckets("ws", buckets);

describe("buildIdentifierMapping", () => {
    it("maps a simple measure's localId to its LDM identifier with default y point field", () => {
        const def = defWith([newBucket(BucketNames.MEASURES, measureA)]);

        const result = buildIdentifierMapping(def, VisualizationTypes.COLUMN);

        expect(result).toEqual({
            measures: {
                m_a: { ldmId: "metric_a", pointField: "y" },
            },
        });
    });

    it("skips arithmetic measures (no underlying identifier ref)", () => {
        const arithmetic = newArithmeticMeasure(["m_a", "m_b"], "sum", (m) => m.localId("m_arith"));
        const def = defWith([newBucket(BucketNames.MEASURES, measureA, measureB, arithmetic)]);

        const result = buildIdentifierMapping(def, VisualizationTypes.COLUMN);

        expect(Object.keys(result.measures).sort()).toEqual(["m_a", "m_b"]);
    });

    describe("derived measure resolution", () => {
        it("traces a PoP measure back to its master simple measure's identifier", () => {
            const pop = newPopMeasure("m_a", "year", (m) => m.localId("m_a_pop"));
            const def = defWith([newBucket(BucketNames.MEASURES, measureA, pop)]);

            const result = buildIdentifierMapping(def, VisualizationTypes.COLUMN);

            expect(result.measures["m_a_pop"]).toEqual({ ldmId: "metric_a", pointField: "y" });
        });

        it("traces a previous-period measure back to its master", () => {
            const prev = newPreviousPeriodMeasure("m_a", [{ dataSet: "ds1", periodsAgo: 1 }], (m) =>
                m.localId("m_a_prev"),
            );
            const def = defWith([newBucket(BucketNames.MEASURES, measureA, prev)]);

            const result = buildIdentifierMapping(def, VisualizationTypes.COLUMN);

            expect(result.measures["m_a_prev"]).toEqual({ ldmId: "metric_a", pointField: "y" });
        });

        it("returns no mapping for a derived measure whose master is missing", () => {
            const orphanPop = newPopMeasure("m_missing", "year", (m) => m.localId("m_orphan"));
            const def = defWith([newBucket(BucketNames.MEASURES, orphanPop)]);

            const result = buildIdentifierMapping(def, VisualizationTypes.COLUMN);

            expect(result.measures).toEqual({});
        });
    });

    describe("chart-type point field routing", () => {
        it("uses 'value' for heatmap regardless of bucket", () => {
            const def = defWith([newBucket(BucketNames.MEASURES, measureA)]);
            const result = buildIdentifierMapping(def, VisualizationTypes.HEATMAP);
            expect(result.measures["m_a"].pointField).toBe("value");
        });

        it("scatter uses 'x' for primary measures and 'y' for secondary", () => {
            const def = defWith([
                newBucket(BucketNames.MEASURES, measureA),
                newBucket(BucketNames.SECONDARY_MEASURES, measureB),
            ]);

            const result = buildIdentifierMapping(def, VisualizationTypes.SCATTER);

            expect(result.measures["m_a"].pointField).toBe("x");
            expect(result.measures["m_b"].pointField).toBe("y");
        });

        it("bubble routes primary to 'x', tertiary to 'z', and secondary to 'y'", () => {
            const def = defWith([
                newBucket(BucketNames.MEASURES, measureA),
                newBucket(BucketNames.SECONDARY_MEASURES, measureB),
                newBucket(BucketNames.TERTIARY_MEASURES, measureC),
            ]);

            const result = buildIdentifierMapping(def, VisualizationTypes.BUBBLE);

            expect(result.measures["m_a"].pointField).toBe("x");
            expect(result.measures["m_b"].pointField).toBe("y");
            expect(result.measures["m_c"].pointField).toBe("z");
        });

        it("bullet routes the secondary (target) series to 'target' and others to 'y'", () => {
            const def = defWith([
                newBucket(BucketNames.MEASURES, measureA),
                newBucket(BucketNames.SECONDARY_MEASURES, measureB),
                newBucket(BucketNames.TERTIARY_MEASURES, measureC),
            ]);

            const result = buildIdentifierMapping(def, VisualizationTypes.BULLET);

            expect(result.measures["m_a"].pointField).toBe("y");
            expect(result.measures["m_b"].pointField).toBe("target");
            expect(result.measures["m_c"].pointField).toBe("y");
        });

        it("falls back to 'y' for unknown chart types and when chartType is omitted", () => {
            const def = defWith([newBucket(BucketNames.MEASURES, measureA)]);

            expect(buildIdentifierMapping(def, "unknown-chart").measures["m_a"].pointField).toBe("y");
            expect(buildIdentifierMapping(def).measures["m_a"].pointField).toBe("y");
        });
    });

    it("does not let the bucket-less fallback overwrite a bucket-derived point field", () => {
        // Both passes see the same measure: the bucket pass routes it via chart
        // type, then the fallback iterates definition.measures and would default
        // to 'y' if not for the dedup guard.
        const def = defWith([newBucket(BucketNames.MEASURES, measureA)]);

        const result = buildIdentifierMapping(def, VisualizationTypes.SCATTER);

        expect(result.measures["m_a"].pointField).toBe("x");
    });

    it("falls back to 'y' for measures present only in definition.measures (no buckets)", () => {
        // Some executions are built without bucket metadata; the bucket-less
        // pass picks them up but cannot route by chart type.
        const def = defWith([newBucket(BucketNames.MEASURES, measureA)]);
        const defWithoutBuckets = { ...def, buckets: [] };

        const result = buildIdentifierMapping(defWithoutBuckets, VisualizationTypes.SCATTER);

        expect(result.measures["m_a"]).toEqual({ ldmId: "metric_a", pointField: "y" });
    });

    it("returns an empty mapping for a definition with no measures", () => {
        const def = newDefForBuckets("ws", [newBucket(BucketNames.MEASURES)]);

        expect(buildIdentifierMapping(def, VisualizationTypes.COLUMN)).toEqual({ measures: {} });
    });
});
