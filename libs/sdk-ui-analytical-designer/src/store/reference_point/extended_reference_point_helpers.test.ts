// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ATTRIBUTE, METRIC } from "../../constants/bucket.js";
import { type IRawBuckets } from "../../typings/buckets.js";

import { validateVisualizationProperties } from "./extended_reference_point_helpers.js";
import { type IExtendedReferencePointState } from "./extended_reference_point_state.js";

/**
 * `validateVisualizationProperties`. The rule is one filter; what is worth pinning is the
 * ABSENCE handling, because the extended reference point stays undefined until a pluggable
 * visualization answers and this transformer runs on such states anyway.
 */

const buckets: IRawBuckets = [
    { localIdentifier: ATTRIBUTE, items: [{ localIdentifier: "a1", type: ATTRIBUTE }] },
    { localIdentifier: "measures", items: [{ localIdentifier: "m1", type: METRIC }] },
];

const attributeSort = (attributeIdentifier: string) => ({
    attributeSortItem: { attributeIdentifier, direction: "asc" as const },
});

describe("validateVisualizationProperties", () => {
    it("keeps the sort items whose identifiers are still in the buckets", () => {
        const extendedReferencePoint: IExtendedReferencePointState = {
            properties: { sortItems: [attributeSort("a1"), attributeSort("gone")] },
        };

        const result = validateVisualizationProperties(extendedReferencePoint, buckets);

        expect(result.properties.sortItems).toEqual([attributeSort("a1")]);
    });

    it("keeps a measure sort while ANY of its locators still resolves", () => {
        const measureSort = {
            measureSortItem: {
                direction: "desc" as const,
                locators: [
                    { measureLocatorItem: { measureIdentifier: "m1" } },
                    { attributeLocatorItem: { attributeIdentifier: "gone", element: "e" } },
                ],
            },
        };
        const extendedReferencePoint: IExtendedReferencePointState = {
            properties: { sortItems: [measureSort] },
        };

        const result = validateVisualizationProperties(extendedReferencePoint, buckets);

        expect(result.properties.sortItems).toEqual([measureSort]);
    });

    it("MATERIALIZES an absent extended reference point instead of throwing", () => {
        expect(validateVisualizationProperties(undefined, buckets)).toEqual({
            properties: { sortItems: [] },
        });
    });

    it("defaults an absent sortItems key to an empty list", () => {
        expect(validateVisualizationProperties({ properties: {} }, buckets)).toEqual({
            properties: { sortItems: [] },
        });
    });

    it("preserves everything else in the extended reference point", () => {
        const extendedReferencePoint: IExtendedReferencePointState = {
            buckets: [{ localIdentifier: "measures", items: [] }],
            properties: { sortItems: [attributeSort("gone")], controls: { dualAxis: true } },
        };

        const result = validateVisualizationProperties(extendedReferencePoint, buckets);

        expect(result.buckets).toBe(extendedReferencePoint.buckets);
        expect(result.properties.controls).toEqual({ dualAxis: true });
        expect(result.properties.sortItems).toEqual([]);
    });

    it("drops every sort item when the buckets are empty", () => {
        const extendedReferencePoint: IExtendedReferencePointState = {
            properties: { sortItems: [attributeSort("a1")] },
        };

        expect(validateVisualizationProperties(extendedReferencePoint, []).properties.sortItems).toEqual([]);
    });
});
