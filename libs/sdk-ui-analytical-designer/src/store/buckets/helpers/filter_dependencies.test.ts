// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ObjRef, idRef, uriRef } from "@gooddata/sdk-model";

import { type IMeasureValueFilter, type IRankingFilter } from "../../filter_bar/filter_bar_types.js";

import {
    convertRemovedDimensionalityRefs,
    findFiltersRelyingOnSlicedInsight,
    isReferencedByRankingFilter,
    reliesPurelyOnBucketSlicing,
} from "./filter_dependencies.js";

const rankingFilter = (props: Partial<IRankingFilter>): IRankingFilter =>
    ({ localIdentifier: "rf", ...props }) as IRankingFilter;

const measureValueFilter = (props: Partial<IMeasureValueFilter>): IMeasureValueFilter =>
    ({ localIdentifier: "mvf", ...props }) as IMeasureValueFilter;

describe("isReferencedByRankingFilter", () => {
    it("answers false when there is no ranking filter", () => {
        expect(isReferencedByRankingFilter(null, "m1", true)).toBe(false);
    });

    it("removes the filter with its ranked measure, under either flag", () => {
        const filter = rankingFilter({ measureLocalIdentifier: "m1" });

        expect(isReferencedByRankingFilter(filter, "m1", true)).toBe(true);
        expect(isReferencedByRankingFilter(filter, "m1", false)).toBe(true);
    });

    it("keeps an unrelated measure from taking the filter down", () => {
        expect(isReferencedByRankingFilter(rankingFilter({ measureLocalIdentifier: "m1" }), "m2", true)).toBe(
            false,
        );
    });

    it("treats an 'out of' attribute as a hard dependency ONLY for the classic filter", () => {
        const filter = rankingFilter({ measureLocalIdentifier: "m1", attributes: ["a1"] });

        // classic: the attribute is referenced by local id, so it must go together with it
        expect(isReferencedByRankingFilter(filter, "a1", false)).toBe(true);
        // improved: the attribute gets promoted to a catalog ref instead, so it is not a dependency
        expect(isReferencedByRankingFilter(filter, "a1", true)).toBe(false);
    });

    it("answers false for a classic filter with no attributes at all", () => {
        expect(
            isReferencedByRankingFilter(rankingFilter({ measureLocalIdentifier: "m1" }), "a1", false),
        ).toBe(false);
    });
});

describe("reliesPurelyOnBucketSlicing", () => {
    it.each([
        ["undefined dimensionality", undefined, false],
        ["empty dimensionality (no granularity constraint at all)", [], false],
        ["only local identifiers", ["a1", "a2"], true],
        ["only catalog refs", [idRef("attr.a1"), uriRef("/a2")] as ObjRef[], false],
        ["a mix - one catalog ref is enough to survive", ["a1", idRef("attr.a2")], false],
    ])(
        "answers %s with %s",
        (
            _name: string,
            dimensionality: Parameters<typeof reliesPurelyOnBucketSlicing>[0],
            expected: boolean,
        ) => {
            expect(reliesPurelyOnBucketSlicing(dimensionality)).toBe(expected);
        },
    );
});

describe("findFiltersRelyingOnSlicedInsight", () => {
    it("drops a measure value filter whose dimensionality was purely bucket slicing", () => {
        const filters = [
            measureValueFilter({ localIdentifier: "mvf1", dimensionality: ["a1"] }),
            measureValueFilter({ localIdentifier: "mvf2", dimensionality: [idRef("attr.a2")] }),
            measureValueFilter({ localIdentifier: "mvf3", dimensionality: [] }),
        ];

        // only mvf1 relied purely on the slicing; mvf2 has a catalog ref, mvf3 has no constraint
        expect(findFiltersRelyingOnSlicedInsight(null, filters, true)).toEqual(["mvf1"]);
    });

    it("always drops the classic ranking filter, whatever its attributes look like", () => {
        const filter = rankingFilter({ localIdentifier: "rf", attributes: [idRef("attr.a1")] });

        expect(findFiltersRelyingOnSlicedInsight(filter, [], false)).toEqual(["rf"]);
    });

    it("drops the improved ranking filter only when its 'out of' relies purely on the slicing", () => {
        expect(findFiltersRelyingOnSlicedInsight(rankingFilter({ attributes: ["a1"] }), [], true)).toEqual([
            "rf",
        ]);
        expect(
            findFiltersRelyingOnSlicedInsight(rankingFilter({ attributes: [idRef("attr.a1")] }), [], true),
        ).toEqual([]);
        // no "out of" at all means no granularity constraint, so nothing to invalidate
        expect(findFiltersRelyingOnSlicedInsight(rankingFilter({ attributes: [] }), [], true)).toEqual([]);
    });

    it("answers empty when there is nothing to drop", () => {
        expect(findFiltersRelyingOnSlicedInsight(null, [], true)).toEqual([]);
    });
});

describe("convertRemovedDimensionalityRefs", () => {
    const resolveTo = (refs: Record<string, ObjRef>) => (localIdentifier: string) =>
        refs[localIdentifier] ?? null;

    it("promotes a removed bucket item to its catalog ref", () => {
        const ref = idRef("attr.a1");

        expect(convertRemovedDimensionalityRefs(["a1", "a2"], ["a1"], resolveTo({ a1: ref }))).toEqual({
            items: [ref, "a2"],
            changed: true,
        });
    });

    it("KEEPS the local identifier when the ref cannot be resolved, never drops it", () => {
        // dropping it would silently re-point the filter at the remaining insight attributes
        expect(convertRemovedDimensionalityRefs(["a1"], ["a1"], () => null)).toEqual({
            items: ["a1"],
            changed: false,
        });
    });

    it("leaves catalog refs and surviving bucket items untouched", () => {
        const catalogRef = idRef("attr.catalog");
        const items = [catalogRef, "a2"];

        const result = convertRemovedDimensionalityRefs(items, ["a1"], () => idRef("attr.never"));

        expect(result).toEqual({ items: [catalogRef, "a2"], changed: false });
        expect(result.items[0]).toBe(catalogRef);
    });

    it("reports changed only when an entry actually got replaced", () => {
        const ref = idRef("attr.a2");

        expect(convertRemovedDimensionalityRefs(["a1", "a2"], ["a2"], resolveTo({ a2: ref })).changed).toBe(
            true,
        );
        expect(convertRemovedDimensionalityRefs(["a1", "a2"], [], resolveTo({ a2: ref })).changed).toBe(
            false,
        );
    });

    it("asks the resolver ONLY for removed local identifiers", () => {
        const asked: string[] = [];

        convertRemovedDimensionalityRefs([idRef("attr.catalog"), "a1", "a2"], ["a2"], (localIdentifier) => {
            asked.push(localIdentifier);
            return null;
        });

        expect(asked).toEqual(["a2"]);
    });

    it("does not mutate the list it was given", () => {
        const items = ["a1", "a2"];

        convertRemovedDimensionalityRefs(items, ["a1"], () => idRef("attr.a1"));

        expect(items).toEqual(["a1", "a2"]);
    });
});
