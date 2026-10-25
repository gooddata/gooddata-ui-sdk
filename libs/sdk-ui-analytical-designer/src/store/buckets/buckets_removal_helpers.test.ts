// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { ATTRIBUTE, COLUMNS, METRIC } from "../../constants/bucket.js";
import { withBucketItems } from "../../tests/buckets_builder.test.helpers.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import { type IFilterBarState, defaultFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IAttributeFilter, type IFilter } from "../filter_bar/filter_bar_types.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";

import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    type IRemoveBucketItemsDeps,
    type IRemoveBucketItemsInput,
    removeBucketItemsWithDependencies,
} from "./buckets_removal_helpers.js";

/**
 * `removeBucketItemsWithDependencies`. These specs pin the four ORDER facts named in the module
 * comment plus the identity contract — the things a reader of the code cannot verify by inspection.
 *
 * The rules themselves (which filter depends on what, how totals re-point) have their own suites and
 * are not re-tested here.
 */

const measure = (localIdentifier: string, extra: Partial<IRawBucketItem> = {}): IRawBucketItem => ({
    localIdentifier,
    type: METRIC,
    attribute: `metric.${localIdentifier}`,
    ...extra,
});

const attributeItem = (localIdentifier: string, cacheItemIdentifier: string): IRawBucketItem => ({
    localIdentifier,
    type: ATTRIBUTE,
    attribute: cacheItemIdentifier,
});

const measureValueFilter = (localIdentifier: string, measureLocalIdentifier: string): IFilter =>
    ({
        type: "measure",
        localIdentifier,
        measureLocalIdentifier,
    }) as IFilter;

const attributeFilter = (localIdentifier: string, cacheItemIdentifier: string): IAttributeFilter => ({
    type: "attribute",
    localIdentifier,
    cacheItemIdentifier,
    displayFormRef: idRef(`${cacheItemIdentifier}.df`),
    filterConfig: { isInverted: true, selectedElements: [], totalElementsCount: 0 },
});

const filterBarWith = (items: IFilter[]): IFilterBarState => ({ ...defaultFilterBarState, items });

const noMarkers: IBucketsMetaState = { autoCreated: {}, modified: {}, collapsed: {} };

const noNotifications: IBucketNotificationsState = {
    removedItems: undefined,
    removedItemsWereJustUpdated: undefined,
    itemsWithChangedGranularity: undefined,
};

const inputOf = (overrides: Partial<IRemoveBucketItemsInput> = {}): IRemoveBucketItemsInput => ({
    buckets: [
        { localIdentifier: ATTRIBUTE, items: [attributeItem("a1", "attr.country.id")] },
        { localIdentifier: COLUMNS, items: [] },
        { localIdentifier: "measures", items: [measure("m1"), measure("m2")] },
    ],
    bucketsMeta: noMarkers,
    filterBar: defaultFilterBarState,
    bucketNotifications: noNotifications,
    extendedReferencePoint: undefined,
    ...overrides,
});

const depsOf = (overrides: Partial<IRemoveBucketItemsDeps> = {}): IRemoveBucketItemsDeps => ({
    catalogMetricRef: () => null,
    bucketItemRef: () => null,
    improvedRankingFilter: false,
    reorderByMeasures: false,
    ...overrides,
});

const itemIdentifiersIn = (buckets: IRawBuckets): string[] =>
    buckets.flatMap((bucket) => (bucket.items ?? []).map((item) => item.localIdentifier));

describe("removeBucketItemsWithDependencies — identity", () => {
    it("answers buckets, markers and notifications BY REFERENCE when nothing is removed", () => {
        const input = inputOf({ extendedReferencePoint: { properties: { sortItems: [] } } });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: [], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.buckets).toBe(input.buckets);
        expect(result.bucketsMeta).toBe(input.bucketsMeta);
        expect(result.bucketNotifications).toBe(input.bucketNotifications);
    });

    it("REBUILDS the filter bar even on a no-op, which is inherited and deliberate", () => {
        // every `items` write goes through `normalizeFilterBar`, which rebuilds the array
        // unconditionally. Pinned in BOTH directions, so whoever wants to add an identity guard can
        // see what it is buying.
        const input = inputOf();

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: [], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar).not.toBe(input.filterBar);
        expect(result.filterBar).toEqual(input.filterBar);
    });

    it("answers the same buckets and markers for an identifier that is in no bucket", () => {
        const input = inputOf();

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["ghost"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.buckets).toBe(input.buckets);
        expect(result.bucketsMeta).toBe(input.bucketsMeta);
    });

    it("leaves the notifications untouched when only a plain attribute goes", () => {
        const input = inputOf();

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(itemIdentifiersIn(result.buckets)).toEqual(["m1", "m2"]);
        expect(result.bucketNotifications).toBe(input.bucketNotifications);
    });
});

describe("removeBucketItemsWithDependencies — sanitize before deciding (order fact 1)", () => {
    it("PRESERVES a measure value filter of a removed simple metric by re-pointing it at the catalog ref", () => {
        const catalogRef = idRef("metric.m1");
        const input = inputOf({
            filterBar: filterBarWith([measureValueFilter("f1", "m1")]),
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf({ catalogMetricRef: () => catalogRef }),
        );

        // still there, and no longer pointing at a bucket measure
        expect(result.filterBar.items).toHaveLength(1);
        const preserved = result.filterBar.items[0];
        expect(preserved.localIdentifier).toBe("f1");
        expect((preserved as { measureRef?: unknown }).measureRef).toBe(catalogRef);
        expect((preserved as { measureLocalIdentifier?: string }).measureLocalIdentifier).toBeUndefined();
    });

    it("REMOVES the same filter when the metric has no catalog ref to fall back on", () => {
        const input = inputOf({
            filterBar: filterBarWith([measureValueFilter("f1", "m1")]),
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar.items).toHaveLength(0);
    });
});

describe("removeBucketItemsWithDependencies — notification counts (order facts 2 and 3)", () => {
    it("counts a removed measure and the measure value filter that went with it", () => {
        const input = inputOf({
            filterBar: filterBarWith([measureValueFilter("f1", "m1")]),
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.bucketNotifications.removedItems).toEqual({
            measures: 1,
            measureValueFilters: 1,
            rankingFilter: false,
        });
        expect(result.bucketNotifications.removedItemsWereJustUpdated).toBe(true);
    });

    it("reports NOTHING about the asked-for items when only dependencies are to be notified", () => {
        const input = inputOf({
            buckets: [
                { localIdentifier: ATTRIBUTE, items: [] },
                {
                    localIdentifier: "measures",
                    items: [measure("m1"), measure("m1_pop", { masterLocalIdentifier: "m1" })],
                },
            ],
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: true },
            depsOf(),
        );

        // both went, but only the derived one is reported
        expect(itemIdentifiersIn(result.buckets)).toEqual([]);
        expect(result.bucketNotifications.removedItems).toEqual({
            measures: 1,
            measureValueFilters: 0,
            rankingFilter: false,
        });
    });
});

describe("removeBucketItemsWithDependencies — the slicing question", () => {
    // `getSlicingBucketItemLocalIdentifiersInBuckets` builds on a reader whose `toShallowArray` is
    // what makes `length` meaningful; without it the "no slicing survives" case would be a silent
    // always-false and would quietly keep filters that must be removed.
    const measureValueFilterWithDimensionality = (localIdentifier: string): IFilter =>
        ({
            type: "measure",
            localIdentifier,
            measureLocalIdentifier: "m2",
            dimensionality: ["a1"],
        }) as IFilter;

    const plainBuckets: IRawBuckets = [
        { localIdentifier: ATTRIBUTE, items: [attributeItem("a1", "attr.country.id")] },
        { localIdentifier: "measures", items: [measure("m1"), measure("m2")] },
    ];

    it("drops a filter relying purely on bucket slicing once the last attribute goes", () => {
        const value = plainBuckets;
        const result = removeBucketItemsWithDependencies(
            inputOf({
                buckets: value,
                filterBar: filterBarWith([measureValueFilterWithDimensionality("f1")]),
            }),
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar.items).toHaveLength(0);
    });

    it("KEEPS that filter while another slicing item survives", () => {
        const value = plainBuckets;
        const withTwoAttributes = withBucketItems(value, 0, [
            attributeItem("a1", "attr.country.id"),
            attributeItem("a2", "attr.other.id"),
        ]);

        const result = removeBucketItemsWithDependencies(
            inputOf({
                buckets: withTwoAttributes,
                filterBar: filterBarWith([measureValueFilterWithDimensionality("f1")]),
            }),
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar.items).toHaveLength(1);
    });
});

describe("removeBucketItemsWithDependencies — the dependants", () => {
    it("takes a derived measure with its master", () => {
        const input = inputOf({
            buckets: [
                { localIdentifier: ATTRIBUTE, items: [] },
                {
                    localIdentifier: "measures",
                    items: [measure("m1"), measure("m1_pop", { masterLocalIdentifier: "m1" }), measure("m2")],
                },
            ],
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(itemIdentifiersIn(result.buckets)).toEqual(["m2"]);
    });
});

describe("removeBucketItemsWithDependencies — the other domains", () => {
    it("drops the autoCreated marker of a removed attribute and keeps the others", () => {
        const input = inputOf({
            bucketsMeta: {
                autoCreated: { "attr.country.id": true, "attr.other.id": true },
                modified: {},
                collapsed: {},
            },
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.bucketsMeta.autoCreated).toEqual({ "attr.other.id": true });
    });

    it("removes an unedited auto-created filter of the removed attribute", () => {
        const input = inputOf({
            filterBar: filterBarWith([attributeFilter("f1", "attr.country.id")]),
            bucketsMeta: { autoCreated: { "attr.country.id": true }, modified: {}, collapsed: {} },
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar.items).toHaveLength(0);
    });

    it("KEEPS a filter the user edited, even though the app created it", () => {
        const input = inputOf({
            filterBar: filterBarWith([attributeFilter("f1", "attr.country.id")]),
            bucketsMeta: {
                autoCreated: { "attr.country.id": true },
                modified: { "attr.country.id": true },
                collapsed: {},
            },
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.filterBar.items).toHaveLength(1);
    });

    it("validates the sort items against the REDUCED buckets (order fact 4)", () => {
        const extendedReferencePoint: IExtendedReferencePointState = {
            properties: {
                sortItems: [
                    { attributeSortItem: { attributeIdentifier: "a1", direction: "asc" } },
                    { attributeSortItem: { attributeIdentifier: "survivor", direction: "asc" } },
                ],
            },
        };
        const input = inputOf({
            buckets: [
                {
                    localIdentifier: ATTRIBUTE,
                    items: [attributeItem("a1", "attr.country.id"), attributeItem("survivor", "attr.x.id")],
                },
            ],
            extendedReferencePoint,
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.extendedReferencePoint.properties.sortItems).toEqual([
            { attributeSortItem: { attributeIdentifier: "survivor", direction: "asc" } },
        ]);
    });

    it("materializes an ABSENT extended reference point rather than throwing", () => {
        const result = removeBucketItemsWithDependencies(
            inputOf({ extendedReferencePoint: undefined }),
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.extendedReferencePoint).toEqual({ properties: { sortItems: [] } });
    });

    it("prunes the totals of a bucket that lost its last attribute", () => {
        const input = inputOf({
            buckets: [
                {
                    localIdentifier: ATTRIBUTE,
                    items: [attributeItem("a1", "attr.country.id")],
                    totals: [{ measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" }],
                },
                { localIdentifier: COLUMNS, items: [] },
                { localIdentifier: "measures", items: [measure("m1")] },
            ],
        });

        const result = removeBucketItemsWithDependencies(
            input,
            { localIdentifiers: ["a1"], notifyOnlyAboutRemovedDependencies: false },
            depsOf(),
        );

        expect(result.buckets[0].totals).toBeUndefined();
    });
});
