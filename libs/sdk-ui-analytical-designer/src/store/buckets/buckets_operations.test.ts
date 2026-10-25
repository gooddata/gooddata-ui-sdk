// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, MEASURES, METRIC } from "../../constants/bucket.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IFilterBarState, defaultFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncDeps,
    type IReferencePointSyncValues,
} from "../reference_point/reference_point_sync.js";

import { type IAddBucketItemDeps, addBucketItemFromCatalog } from "./buckets_add_operation.js";
import { editBucketItem, toggleBucketsDualAxis } from "./buckets_edit_operations.js";
import { applyFilterRemoval } from "./buckets_filter_removal_operation.js";
import { type IBucketsMetaState, bucketsMetaInitialState } from "./buckets_meta_state.js";
import {
    removeBucketItemsOperation,
    reorderBucketItem,
    replaceBucketItemWithCatalogItem,
} from "./buckets_move_operations.js";

/**
 * THE RISKY OPERATIONS, as VALUES — the part a store-level spec cannot see: IDENTITY, and the
 * decisions each operation makes about what it does NOT touch.
 *
 * Assert `toBe`, not `toEqual`. A root-level `toEqual` passes on a lost identity, and an operation
 * that rebuilds an unchanged domain value dirties its subtree on every dispatch — the whole no-diff
 * design rests on it not doing that.
 */
describe("buckets operations as values", () => {
    const masterMeasure: IRawBucketItem = {
        attribute: "m1",
        localIdentifier: "m1",
        filters: [],
        type: METRIC,
    } as IRawBucketItem;
    const attributeItem: IRawBucketItem = {
        attribute: "attribute1",
        localIdentifier: "a1",
        filters: [],
        type: ATTRIBUTE,
    } as IRawBucketItem;

    const buckets: IRawBuckets = [
        { localIdentifier: MEASURES, items: [masterMeasure] },
        { localIdentifier: ATTRIBUTE, items: [attributeItem] },
    ] as IRawBuckets;

    const referencePoint: IReferencePointState = { buckets };
    const filterBar: IFilterBarState = defaultFilterBarState;
    const bucketsMeta: IBucketsMetaState = bucketsMetaInitialState;

    const syncValues: IReferencePointSyncValues = {
        refPointFilters: { localIdentifier: "filters", items: [] },
        sortItems: undefined,
    };
    const syncDeps: IReferencePointSyncDeps = {
        refPointFilters: () => ({ localIdentifier: "filters", items: [] }),
        sortItems: undefined,
    };
    const removalDeps = {
        ...syncDeps,
        catalogMetricRef: (): null => null,
        bucketItemRef: (): null => null,
        improvedRankingFilter: false,
        reorderByMeasures: false,
    };
    const editDeps = {
        ...syncValues,
        catalogItemType: (): undefined => undefined,
        dateDatasetByRef: (): undefined => undefined,
        attributeDisplayFormByRef: (): undefined => undefined,
    };

    describe("editBucketItem: `undefined` is a result, not an error", () => {
        it("answers undefined for a bucket item that is in no bucket", () => {
            const result = editBucketItem(
                { buckets, referencePoint },
                { kind: "granularity", localIdentifier: "not-there", value: "GDC.time.month" },
                editDeps,
            );

            // commit NOTHING: no sync, and — the part that matters — `isVisualizationMdObjectValid`
            // NOT written. Returning the inputs by reference instead would write the flag, which is
            // why `undefined` is the shape.
            expect(result).toBeUndefined();
        });

        it("keeps the whole buckets value when the edit writes the value already there", () => {
            const alreadyTotal: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [{ ...masterMeasure, isTotalMeasure: true }],
                },
            ] as IRawBuckets;

            const result = editBucketItem(
                { buckets: alreadyTotal, referencePoint },
                { kind: "relatedFlag", property: "isTotalMeasure", localIdentifier: "m1", value: true },
                editDeps,
            );

            // `setIn` short-circuits on an EQUAL PRIMITIVE and `mapCollection` keeps the items
            // array when every item maps to itself — so a re-dispatch of the same edit cannot dirty the
            // subtree. Note the asymmetry this pins: setting an ABSENT key to `undefined` DOES write,
            // because absent and present-undefined are different states.
            expect(result.buckets).toBe(alreadyTotal);
        });
    });

    describe("toggleBucketsDualAxis decides TWO domains", () => {
        it("writes the control and the items together", () => {
            const result = toggleBucketsDualAxis(
                { buckets, referencePoint, visualizationProperties: { controls: {} } },
                { bucketLocalIdentifier: MEASURES, value: true },
                syncValues,
            );

            expect(result.visualizationProperties.controls?.["dualAxis"]).toBe(true);
            expect(result.buckets[0].items[0].showOnSecondaryAxis).toBe(true);
        });

        it("keeps the properties value when the control already holds it", () => {
            const visualizationProperties = { controls: { dualAxis: true } };

            const result = toggleBucketsDualAxis(
                { buckets, referencePoint, visualizationProperties },
                { bucketLocalIdentifier: MEASURES, value: true },
                syncValues,
            );

            // the properties domain's own guard (`setDualAxisControl` compares deeply), so a repeated
            // toggle cannot dirty the subtree
            expect(result.visualizationProperties).toBe(visualizationProperties);
        });
    });

    describe("removeBucketItemsOperation", () => {
        const input: Parameters<typeof removeBucketItemsOperation>[0] = {
            buckets,
            bucketsMeta,
            filterBar,
            bucketNotifications: {
                removedItems: undefined,
                removedItemsWereJustUpdated: undefined,
                itemsWithChangedGranularity: undefined,
            },
            extendedReferencePoint: undefined,
            referencePoint,
        };

        it("answers the untouched domains BY REFERENCE when it removes nothing", () => {
            const result = removeBucketItemsOperation(
                input,
                { localIdentifiers: ["not-there"], notifyOnlyAboutRemovedDependencies: true },
                removalDeps,
            );

            expect(result.buckets).toBe(buckets);
            expect(result.bucketsMeta).toBe(bucketsMeta);
            expect(result.bucketNotifications).toBe(input.bucketNotifications);
        });

        it("REBUILDS the filter bar even for an empty removal", () => {
            const result = removeBucketItemsOperation(
                input,
                { localIdentifiers: ["not-there"], notifyOnlyAboutRemovedDependencies: true },
                removalDeps,
            );

            // FOUR of the five inputs come back by reference for a removal that removes nothing. The
            // filter bar does NOT: the chain ends with an unconditional `removeFilters`, and
            // `setFilterItems` under it always builds `{...filterBar, items}` with no identity guard.
            // Pinned rather than "fixed", because adding the guard is a behavior change — one fewer
            // notification per no-op removal. See the note in buckets_removal_helpers.ts.
            expect(result.filterBar).not.toBe(filterBar);
            expect(result.filterBar).toEqual(filterBar);
        });

        it("still names the md-object flag, because the gesture happened", () => {
            const result = removeBucketItemsOperation(
                input,
                { localIdentifiers: ["not-there"], notifyOnlyAboutRemovedDependencies: true },
                removalDeps,
            );

            // a removal that removed nothing is still a removal: the sync tail runs
            // unconditionally, and only the granularity/display-form edits have the "do nothing at
            // all" guard
            expect(result.isVisualizationMdObjectValid).toBe(false);
        });

        it("removes the named item and re-syncs the reference point onto the new buckets", () => {
            const result = removeBucketItemsOperation(
                input,
                { localIdentifiers: ["m1"], notifyOnlyAboutRemovedDependencies: true },
                removalDeps,
            );

            expect(result.buckets[0].items).toHaveLength(0);
            // BY REFERENCE: the reference point holds the live buckets value
            expect(result.referencePoint.buckets).toBe(result.buckets);
        });
    });

    describe("replaceBucketItemWithCatalogItem", () => {
        const replaceDeps: typeof removalDeps & Partial<IAddBucketItemDeps> = {
            ...removalDeps,
            primaryDateDatasetRef: undefined,
            dateDatasetByRef: () => undefined,
            bucketAcceptsMeasures: false,
            bucketTransformsAttributeToMeasure: false,
            bucketEnablesSecondaryAxis: false,
            supportedDisplayForms: () => undefined,
        };

        it("answers undefined when the replaced item is in no bucket", () => {
            const result = replaceBucketItemWithCatalogItem(
                {
                    buckets,
                    bucketsMeta,
                    filterBar,
                    bucketNotifications: {
                        removedItems: undefined,
                        removedItemsWereJustUpdated: undefined,
                        itemsWithChangedGranularity: undefined,
                    },
                    extendedReferencePoint: undefined,
                    referencePoint,
                },
                {
                    bucketItem: { localIdentifier: "not-there" } as IRawBucketItem,
                    catalogItem: { identifier: "x", type: ATTRIBUTE, title: "X" } as never,
                },
                replaceDeps as never,
            );

            expect(result).toBeUndefined();
        });
    });

    describe("reorderBucketItem does NOT run the removal chain", () => {
        it("leaves the filter bar and the notifications alone", () => {
            const twoMeasures: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [masterMeasure, { ...masterMeasure, localIdentifier: "m2" }],
                },
            ] as IRawBuckets;

            const result = reorderBucketItem(
                { buckets: twoMeasures, bucketsMeta, filterBar, referencePoint },
                { bucketLocalIdentifier: MEASURES, from: masterMeasure, bucketPosition: 1 },
                { ...syncDeps, reorderByMeasures: false },
            );

            // the reorder touches buckets and the sync only: the result type has no filter-bar field
            // at all, and this pins its actual reach
            expect(result.buckets[0].items.map((item) => item.localIdentifier)).toEqual(["m2", "m1"]);
            expect(Object.keys(result).sort()).toEqual([
                "buckets",
                "isVisualizationMdObjectValid",
                "referencePoint",
            ]);
        });
    });

    describe("applyFilterRemoval folds per filter", () => {
        const input: Parameters<typeof applyFilterRemoval>[0] = {
            buckets,
            bucketsMeta: { autoCreated: { attribute1: true }, modified: {}, collapsed: {} },
            filterBar,
            bucketNotifications: {
                removedItems: undefined,
                removedItemsWereJustUpdated: undefined,
                itemsWithChangedGranularity: undefined,
            },
            extendedReferencePoint: undefined,
            referencePoint,
        };

        it("drops an attribute filter's markers and touches nothing else", () => {
            const result = applyFilterRemoval(
                input,
                {
                    removedFilters: [{ localIdentifier: "f1", cacheItemIdentifier: "attribute1" } as never],
                },
                removalDeps,
            );

            expect(result.bucketsMeta.autoCreated).toEqual({});
            expect(result.buckets).toBe(buckets);
            expect(result.filterBar).toBe(filterBar);
        });

        it("keeps bucketsMeta BY REFERENCE for a measure value filter (never auto-created)", () => {
            const result = applyFilterRemoval(
                input,
                {
                    removedFilters: [
                        { localIdentifier: "mvf", measureLocalIdentifier: "m1", conditions: [] } as never,
                    ],
                },
                removalDeps,
            );

            expect(result.bucketsMeta).toBe(input.bucketsMeta);
        });
    });

    describe("addBucketItemFromCatalog", () => {
        const addDeps: IAddBucketItemDeps = {
            ...removalDeps,
            primaryDateDatasetRef: undefined,
            dateDatasetByRef: () => undefined,
            bucketAcceptsMeasures: false,
            bucketTransformsAttributeToMeasure: false,
            bucketEnablesSecondaryAxis: false,
            approxCount: false,
            supportedDisplayForms: () => undefined,
            supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.NOTHING],
        };

        const input: Parameters<typeof addBucketItemFromCatalog>[0] = {
            buckets,
            bucketsMeta,
            configurationPanel: { collapsed: true },
            filterBar,
            bucketNotifications: {
                removedItems: undefined,
                removedItemsWereJustUpdated: undefined,
                itemsWithChangedGranularity: undefined,
            },
            extendedReferencePoint: undefined,
            pluggableVisualization: undefined,
            referencePoint,
            isVisualizationMdObjectValid: true,
        };

        it("appends the built item and keeps the configuration panel untouched when no drag collapsed it", () => {
            const result = addBucketItemFromCatalog(
                input,
                {
                    bucketLocalIdentifier: ATTRIBUTE,
                    catalogItem: { identifier: "attr2", type: ATTRIBUTE, title: "Attr 2" } as never,
                    bucketPosition: -1,
                },
                addDeps,
            );

            expect(result.buckets[1].items).toHaveLength(2);
            // `deleteIn` answers the same value for an absent key, so a drop that collapsed nothing
            // cannot dirty the panel subtree
            expect(result.configurationPanel).toBe(input.configurationPanel);
        });

        it("pops the panel back open when a drag had collapsed it", () => {
            const result = addBucketItemFromCatalog(
                { ...input, configurationPanel: { collapsed: true, collapsedByDragging: true } },
                {
                    bucketLocalIdentifier: ATTRIBUTE,
                    catalogItem: { identifier: "attr2", type: ATTRIBUTE, title: "Attr 2" } as never,
                    bucketPosition: -1,
                },
                addDeps,
            );

            expect(result.configurationPanel).not.toHaveProperty("collapsedByDragging");
        });

        it("expands the measure slot for an attribute dropped into a measure bucket with approx count on", () => {
            const result = addBucketItemFromCatalog(
                input,
                {
                    bucketLocalIdentifier: MEASURES,
                    catalogItem: { identifier: "attr2", type: ATTRIBUTE, title: "Attr 2" } as never,
                    bucketPosition: -1,
                },
                { ...addDeps, bucketAcceptsMeasures: true, approxCount: true },
            );

            expect(result.bucketsMeta.measureExpanded).toBeDefined();
        });
    });
});
