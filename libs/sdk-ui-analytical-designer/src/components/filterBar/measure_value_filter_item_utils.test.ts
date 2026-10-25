// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    attributeLocalId,
    idRef,
    localIdRef,
    measureLocalId,
    newAttribute,
    newInsightDefinition,
    newMeasure,
} from "@gooddata/sdk-model";

import { LOCAL_TABLE } from "../../constants/visualization_types.js";
import { type IMeasureValueFilter } from "../../store/filter_bar/filter_bar_types.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";

import { buildMvfAvailabilityItems, getSecondaryAxisMeasures } from "./measure_value_filter_item_utils.js";

const createInsight = (
    measures: Array<{ localId: string; ref: string }>,
    attributes: Array<{ localId: string; displayForm: string }>,
) => {
    const measureItems = measures.map((m) => newMeasure(idRef(m.ref), (mb) => mb.localId(m.localId)));
    const attributeItems = attributes.map((a) =>
        newAttribute(idRef(a.displayForm), (ab) => ab.localId(a.localId)),
    );

    return newInsightDefinition(LOCAL_TABLE, (i) =>
        i.buckets([
            {
                localIdentifier: "measures",
                items: measureItems,
            },
            {
                localIdentifier: "attribute",
                items: attributeItems,
            },
        ]),
    );
};

const createBucketFilter = (
    measureLocalIdentifier: string,
    dimensionality?: (string | { identifier: string })[],
): IMeasureValueFilter => ({
    type: "measure",
    localIdentifier: `mvf_${measureLocalIdentifier}`,
    measureLocalIdentifier,
    dimensionality,
});

const createCatalogFilter = (
    measureRef: string,
    dimensionality?: (string | { identifier: string })[],
): IMeasureValueFilter => ({
    type: "measure",
    localIdentifier: `mvf_catalog_${measureRef}`,
    measureRef: idRef(measureRef),
    dimensionality,
});

describe("buildMvfAvailabilityItems", () => {
    describe("bucket measure filters", () => {
        it("should include all insight measures and attributes when filter has no dimensionality", () => {
            const insight = createInsight(
                [
                    { localId: "m1", ref: "measure1" },
                    { localId: "m2", ref: "measure2" },
                ],
                [
                    { localId: "a1", displayForm: "attr1" },
                    { localId: "a2", displayForm: "attr2" },
                ],
            );
            const filter = createBucketFilter("m1");

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should have 2 measures + 2 attributes
            expect(result).toHaveLength(4);
            const measureIds = result.filter((i) => "measure" in i).map((m) => measureLocalId(m));
            const attrIds = result.filter((i) => "attribute" in i).map((a) => attributeLocalId(a));
            expect(measureIds).toEqual(expect.arrayContaining(["m1", "m2"]));
            expect(attrIds).toEqual(expect.arrayContaining(["a1", "a2"]));
        });

        it("should use filter dimensionality instead of insight attributes when filter has dimensionality", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [
                    { localId: "a1", displayForm: "attr1" },
                    { localId: "a2", displayForm: "attr2" },
                ],
            );
            // Filter only references a1 by local id
            const filter = createBucketFilter("m1", ["a1"]);

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should have 1 measure + 1 attribute (a1 only)
            expect(result).toHaveLength(2);
            const attrIds = result.filter((i) => "attribute" in i).map((a) => attributeLocalId(a));
            expect(attrIds).toEqual(["a1"]);
        });

        it("should handle ObjRef in filter dimensionality", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            // Filter references an external attribute by ObjRef
            const filter = createBucketFilter("m1", [{ identifier: "externalAttr" }]);

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should have 1 measure + 1 new attribute (from ObjRef)
            expect(result).toHaveLength(2);
        });

        it("should deduplicate items by local id", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            const filter = createBucketFilter("m1");

            const result = buildMvfAvailabilityItems(insight, filter);

            // Check no duplicates
            const keys = result.map((item) =>
                "attribute" in item ? `a:${attributeLocalId(item)}` : `m:${measureLocalId(item)}`,
            );
            expect(new Set(keys).size).toBe(keys.length);
        });
    });

    describe("catalog measure filters", () => {
        it("should include catalog measure in addition to insight measures", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            const filter = createCatalogFilter("catalogMeasure");

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should have 2 measures (insight + catalog) + 1 attribute
            expect(result).toHaveLength(3);
            const measureIds = result.filter((i) => "measure" in i).map((m) => measureLocalId(m));
            expect(measureIds).toHaveLength(2);
        });
    });

    describe("dimensionality override", () => {
        it("should use dimensionalityOverride when provided instead of filter dimensionality", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [
                    { localId: "a1", displayForm: "attr1" },
                    { localId: "a2", displayForm: "attr2" },
                ],
            );
            // Filter has a1, but override specifies a2
            const filter = createBucketFilter("m1", ["a1"]);
            const dimensionalityOverride = [localIdRef("a2")];

            const result = buildMvfAvailabilityItems(insight, filter, dimensionalityOverride);

            // Should use override (a2) not filter dimensionality (a1)
            const attrIds = result.filter((i) => "attribute" in i).map((a) => attributeLocalId(a));
            expect(attrIds).toEqual(["a2"]);
        });

        it("should handle ObjRef in dimensionalityOverride", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            const filter = createBucketFilter("m1");
            // Override with an external ObjRef
            const dimensionalityOverride = [idRef("externalAttr")];

            const result = buildMvfAvailabilityItems(insight, filter, dimensionalityOverride);

            // Should have 1 measure + 1 new attribute from override
            expect(result).toHaveLength(2);
        });

        it("should resolve localIdRef from insight attributes", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [
                    { localId: "a1", displayForm: "attr1" },
                    { localId: "a2", displayForm: "attr2" },
                ],
            );
            const filter = createBucketFilter("m1");
            const dimensionalityOverride = [localIdRef("a1")];

            const result = buildMvfAvailabilityItems(insight, filter, dimensionalityOverride);

            const attrIds = result.filter((i) => "attribute" in i).map((a) => attributeLocalId(a));
            expect(attrIds).toEqual(["a1"]);
        });
    });

    describe("edge cases", () => {
        it("should handle empty insight", () => {
            const insight = createInsight([], []);
            const filter = createBucketFilter("m1");

            const result = buildMvfAvailabilityItems(insight, filter);

            expect(result).toHaveLength(0);
        });

        it("should handle filter with non-existent measure localId", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            const filter = createBucketFilter("nonExistent");

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should still include insight measures and attributes
            expect(result.length).toBeGreaterThan(0);
        });

        it("should handle dimensionality with non-existent local id", () => {
            const insight = createInsight(
                [{ localId: "m1", ref: "measure1" }],
                [{ localId: "a1", displayForm: "attr1" }],
            );
            const filter = createBucketFilter("m1", ["nonExistent"]);

            const result = buildMvfAvailabilityItems(insight, filter);

            // Should have measure but no attributes (non-existent filtered out)
            const attrIds = result.filter((i) => "attribute" in i);
            expect(attrIds).toHaveLength(0);
        });
    });
});

/**
 * `getSecondaryAxisMeasures` combines the two secondary-axis lists with `union`, so duplicates are
 * dropped. The single consumer cannot observe that — it only asks "is this measure on a secondary
 * axis" — and the specs below pin the combination either way.
 */
describe("getSecondaryAxisMeasures", () => {
    const withAxisMeasures = (x: string[], y: string[]) => {
        const pristine = getInitializedState();
        const { extendedReferencePoint } = pristine.data;

        return withData(pristine, {
            extendedReferencePoint: {
                ...extendedReferencePoint,
                properties: {
                    ...extendedReferencePoint?.properties,
                    controls: {
                        ...extendedReferencePoint?.properties?.controls,
                        secondary_xaxis: { measures: x },
                        secondary_yaxis: { measures: y },
                    },
                },
            },
        });
    };

    it("keeps measures from BOTH axes, X first", () => {
        expect(getSecondaryAxisMeasures(withAxisMeasures(["x1"], ["y1"]))).toEqual(["x1", "y1"]);
    });

    it("deduplicates a measure listed on both axes", () => {
        expect(getSecondaryAxisMeasures(withAxisMeasures(["m1", "x2"], ["m1"]))).toEqual(["m1", "x2"]);
    });

    it("answers [] when no extended reference point has been reported", () => {
        expect(getSecondaryAxisMeasures(getInitializedState())).toEqual([]);
    });

    it("keeps a single axis intact", () => {
        expect(getSecondaryAxisMeasures(withAxisMeasures([], ["y1", "y2"]))).toEqual(["y1", "y2"]);
        expect(getSecondaryAxisMeasures(withAxisMeasures(["x1", "x2"], []))).toEqual(["x1", "x2"]);
    });
});
