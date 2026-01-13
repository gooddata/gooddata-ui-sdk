// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    attributeLocalId,
    idRef,
    localIdRef,
    newAbsoluteDateFilter,
    newAttribute,
    newBucket,
    newMeasure,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    newRankingFilter,
} from "@gooddata/sdk-model";

import { routeLocalIdRefFiltersToLayers } from "../filters/routeLocalIdRefFiltersToLayers.js";

describe("routeLocalIdRefFiltersToLayers", () => {
    it("routes MVF/ranking using localIdRef only to applicable layers", () => {
        const a1 = newAttribute(idRef("attr.df", "displayForm"), (a) => a.localId("a1"));
        const m1 = newMeasure(idRef("m1", "measure"), (m) => m.localId("m1"));

        const mvfWithDimensionality = newMeasureValueFilterWithOptions(localIdRef("m1"), {
            operator: "GREATER_THAN",
            value: 0,
            dimensionality: [localIdRef("a1")],
        });
        const ranking = newRankingFilter(localIdRef("m1"), [localIdRef("a1")], "TOP", 1);

        const date = newAbsoluteDateFilter(idRef("ds", "dataSet"), "2024-01-01", "2024-12-31");

        const layerWithAttributeAndMeasure = {
            id: "layerA",
            buckets: [newBucket("attributes", a1), newBucket("measures", m1)],
        };
        const layerMissingAttribute = {
            id: "layerB",
            buckets: [newBucket("measures", m1)],
        };

        // sanity: ensure our attribute localId is what we route by
        expect(attributeLocalId(a1)).toBe("a1");

        const result = routeLocalIdRefFiltersToLayers(
            [mvfWithDimensionality, ranking, date],
            [layerWithAttributeAndMeasure, layerMissingAttribute],
        );

        // date filter stays global; localIdRef-based MVF/ranking are removed from globals and routed
        expect(result.globalFilters).toEqual([date]);
        expect(result.routedByLayerId.get("layerA")).toEqual([mvfWithDimensionality, ranking]);
        expect(result.routedByLayerId.get("layerB")).toEqual([]);
    });

    it("keeps MVF/ranking without localIdRef in global filters", () => {
        const mvfByIdentifier = newMeasureValueFilter(idRef("m1", "measure"), "GREATER_THAN", 1);

        const layer = {
            id: "layerA",
            buckets: [
                newBucket(
                    "measures",
                    newMeasure(idRef("m1", "measure"), (m) => m.localId("m1")),
                ),
            ],
        };

        const result = routeLocalIdRefFiltersToLayers([mvfByIdentifier], [layer]);

        expect(result.globalFilters).toEqual([mvfByIdentifier]);
        expect(result.routedByLayerId.get("layerA")).toEqual([]);
    });
});
