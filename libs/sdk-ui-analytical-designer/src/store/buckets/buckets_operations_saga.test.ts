// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    changeMeasureChartType,
    removeBucketDerivedItems,
    removeBucketItemsByLocalIds,
    selectVisualizationType,
    setAllBucketsDateDataset,
    setBucketDateDataset,
    setBucketItemAggregation,
    setBucketItemDateDataset,
    setBucketItemFormat,
    setBucketItemGranularity,
    setBucketItemShowOnSecondaryAxis,
    setBucketItemTitle,
    storeBucketItemDisplayForm,
    storeBucketItemEnableThresholdMeasure,
    storeBucketItemShowAllValues,
    storeSetBucketItemIsTotalMeasure,
    storeSetBucketItemShowInPercent,
    toggleBucketItemExpanded,
} from "../../actions/buckets_actions.js";
import {
    dropCatalogItem,
    removeBucketItem,
    reorderBucketItem,
    replaceBucketItem,
    swapBucketItem,
} from "../../actions/dnd_actions.js";
import { toggleDualAxis } from "../../actions/properties_actions.js";
import { extendedReferencePointChanged, newDerivedBucketItemsPlaced } from "../../actions/report_actions.js";
import { ATTRIBUTE, MEASURES, METRIC } from "../../constants/bucket.js";
import { GRANULARITY } from "../../models/granularity.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { countStoreWrites, runBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";
import { filtersWereChanged } from "../filter_bar/filter_bar_actions.js";
import { type IAppState } from "../types.js";

import { BucketsOperationActionTypeKeys } from "./buckets_operation_events.js";

/**
 * THE ORCHESTRATION CONTRACT. Each operation's COMPUTATION is pinned by the reducer suites and by
 * `reducers/test/buckets_cluster_characterization.test.ts`; what is pinned HERE is the wiring:
 *
 * 1. every trigger reaches a handler and commits the RIGHT event — a missing `takeEvery` is a
 *    SILENTLY dead gesture, which no value assertion anywhere else would catch;
 * 2. the trigger itself writes NOTHING;
 * 3. exactly one event per gesture, and none at all for the operations that legitimately commit
 *    nothing;
 * 4. the two triggers that are NOT cascades reach no saga at all.
 */
describe("buckets operations saga", () => {
    const masterMeasure: IRawBucketItem = {
        attribute: "m1",
        localIdentifier: "m1",
        filters: [],
        aggregation: "sum",
        type: METRIC,
    };
    const secondMeasure: IRawBucketItem = {
        attribute: "m2",
        localIdentifier: "m2",
        filters: [],
        type: METRIC,
    };
    const attribute: IRawBucketItem = {
        localIdentifier: "a1",
        attribute: "attribute1",
        filters: [],
        type: ATTRIBUTE,
    };

    function seededState(): IAppState {
        return withData(getInitializedState(), {
            buckets: [
                { localIdentifier: MEASURES, items: [masterMeasure, secondMeasure] },
                { localIdentifier: ATTRIBUTE, items: [attribute] },
            ],
        });
    }

    /** The events a gesture committed, in order. */
    function eventsOf(state: IAppState, action: unknown): string[] {
        return runBucketsTrigger(state, action as never)
            .dispatched.slice(1)
            .map((dispatched) => dispatched.type);
    }

    const {
        STORE_BUCKET_ITEM_ADDED,
        STORE_BUCKET_ITEMS_REMOVED,
        STORE_BUCKET_ITEM_REPLACED,
        STORE_BUCKET_ITEMS_SWAPPED,
        STORE_BUCKET_ITEM_REORDERED,
        STORE_BUCKET_ITEM_EDITED,
        STORE_DUAL_AXIS_TOGGLED,
        STORE_BUCKETS_DATE_DATASET_CHANGED,
        STORE_VISUALIZATION_TYPE_SELECTED,
        STORE_EXTENDED_REFERENCE_POINT_APPLIED,
        STORE_DERIVED_BUCKET_ITEMS_PLACED,
        STORE_FILTER_REMOVAL_APPLIED,
    } = BucketsOperationActionTypeKeys;

    describe("every trigger reaches its operation and commits the right event", () => {
        it.each([
            [
                "BUCKETS_SET_BUCKET_ITEM_TITLE",
                () => setBucketItemTitle("m1", "renamed"),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "BUCKETS_SET_BUCKET_ITEM_FORMAT",
                () => setBucketItemFormat("m1", "#,##0", "preset"),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_ALL_VALUES",
                () => storeBucketItemShowAllValues("a1", true),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_IS_TOTAL_MEASURE",
                () => storeSetBucketItemIsTotalMeasure("m1", true),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "BUCKETS_SET_BUCKET_ITEM_SHOW_ON_SECONDARY_AXIS",
                () => setBucketItemShowOnSecondaryAxis("m1", true),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE",
                () => storeBucketItemEnableThresholdMeasure("m1", true),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "BUCKETS_SET_BUCKET_ITEM_AGGREGATION",
                () => setBucketItemAggregation(masterMeasure, "avg"),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "BUCKET_CHANGE_CHART_TYPE",
                () => changeMeasureChartType(MEASURES, "column" as never),
                STORE_BUCKET_ITEM_EDITED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT",
                () => storeSetBucketItemShowInPercent("m1", true),
                STORE_BUCKET_ITEM_EDITED,
            ],
            ["BUCKET_TOGGLE_DUAL_AXIS", () => toggleDualAxis(MEASURES, true), STORE_DUAL_AXIS_TOGGLED],
            [
                "STORE_BUCKETS_SET_ALL_BUCKETS_DATE_DATASET",
                () => setAllBucketsDateDataset({ uri: "/gdc/dataset" }),
                STORE_BUCKETS_DATE_DATASET_CHANGED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET",
                () => setBucketItemDateDataset({ uri: "/gdc/dataset" }, "d1"),
                STORE_BUCKETS_DATE_DATASET_CHANGED,
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_DATE_DATASET",
                () => setBucketDateDataset({ uri: "/gdc/dataset" }, "d1", MEASURES),
                STORE_BUCKETS_DATE_DATASET_CHANGED,
            ],
            [
                "BUCKETS_SELECT_VISUALIZATION_TYPE",
                () => selectVisualizationType(tableVisualizationClass),
                STORE_VISUALIZATION_TYPE_SELECTED,
            ],
            [
                "BUCKETS_DND_ITEM_REMOVE",
                () => removeBucketItem(masterMeasure as never, 0, MEASURES),
                STORE_BUCKET_ITEMS_REMOVED,
            ],
            ["BUCKETS_REMOVE_ITEMS", () => removeBucketItemsByLocalIds(["m2"]), STORE_BUCKET_ITEMS_REMOVED],
            [
                "STORE_BUCKETS_REMOVE_DERIVED_ITEMS",
                () => removeBucketDerivedItems(),
                STORE_BUCKET_ITEMS_REMOVED,
            ],
            [
                "BUCKETS_DND_ITEM_SWAP",
                () => swapBucketItem(undefined as never, masterMeasure as never, secondMeasure as never),
                STORE_BUCKET_ITEMS_SWAPPED,
            ],
            [
                "BUCKETS_DND_ITEM_REORDER",
                () => reorderBucketItem(MEASURES, masterMeasure as never, 0, 1),
                STORE_BUCKET_ITEM_REORDERED,
            ],
            [
                "EXTENDED_REFERENCE_POINT_CHANGED",
                // `filters` is the plug viz's filters BUCKET, not an array — the shape
                // `convertFromExtendedRefPointFilters` narrows
                () =>
                    extendedReferencePointChanged({
                        buckets: [],
                        filters: { localIdentifier: "filters", items: [] },
                    }),
                STORE_EXTENDED_REFERENCE_POINT_APPLIED,
            ],
            [
                "NEW_DERIVED_BUCKET_ITEMS_PLACED",
                () =>
                    newDerivedBucketItemsPlaced({
                        buckets: [],
                        filters: { localIdentifier: "filters", items: [] },
                    }),
                STORE_DERIVED_BUCKET_ITEMS_PLACED,
            ],
            ["SAGA_FILTERS_WERE_CHANGED", () => filtersWereChanged([], []), STORE_FILTER_REMOVAL_APPLIED],
        ])("%s commits %s", (_trigger, buildAction, expectedEvent) => {
            expect(eventsOf(seededState(), buildAction())).toEqual([expectedEvent]);
        });

        /**
         * The remaining two triggers need a state their operation can actually run on, so they get their
         * own cases rather than joining the table above.
         */
        it("BUCKETS_DND_ITEM_INSERT commits bucketItemAdded", () => {
            const catalogItem = { identifier: "newAttr", type: "attribute", title: "New", id: "newAttr" };

            expect(eventsOf(seededState(), dropCatalogItem(ATTRIBUTE, catalogItem as never))).toEqual([
                STORE_BUCKET_ITEM_ADDED,
            ]);
        });

        it("BUCKETS_DND_ITEM_REPLACE commits bucketItemReplaced", () => {
            const catalogItem = { identifier: "newAttr", type: "attribute", title: "New", id: "newAttr" };

            expect(
                eventsOf(seededState(), replaceBucketItem(attribute as never, catalogItem as never)),
            ).toEqual([STORE_BUCKET_ITEM_REPLACED]);
        });

        it("STORE_BUCKETS_SET_BUCKET_ITEM_DISPLAY_FORM commits bucketItemEdited", () => {
            const seeded = seededState();
            const state = withData(seeded, {
                itemCache: {
                    ...seeded.data.itemCache,
                    "attribute.attribute1": {
                        identifier: "attribute1",
                        // a PARTIAL cached display form: the edit only resolves uri + id
                        displayForms: [
                            { ref: { uri: "/df" }, uri: "/df", id: "df" },
                        ] as unknown as ICacheItemDisplayForm[],
                    },
                },
            });

            expect(eventsOf(state, storeBucketItemDisplayForm("a1", { uri: "/df" }))).toEqual([
                STORE_BUCKET_ITEM_EDITED,
            ]);
        });
    });

    describe("the trigger writes nothing", () => {
        it.each([
            ["a bucket-item edit", () => setBucketItemTitle("m1", "renamed")],
            ["a dual-axis toggle", () => toggleDualAxis(MEASURES, true)],
            ["a drag-out removal", () => removeBucketItem(masterMeasure as never, 0, MEASURES)],
            ["a visualization-type pick", () => selectVisualizationType(tableVisualizationClass)],
        ])("%s leaves data untouched until its event lands", (_name, buildAction) => {
            const state = seededState();
            const { dispatched } = runBucketsTrigger(state, buildAction() as never);

            // the reducer chain, applied to the TRIGGER alone, must be a no-op on `data`
            expect(rootReducer(state, dispatched[0]).data).toBe(state.data);
            // ...and the gesture as a whole must still have committed exactly one event
            expect(dispatched).toHaveLength(2);
        });
    });

    describe("operations that legitimately commit nothing ([P] allowlist)", () => {
        it("a granularity edit for an item that is in no bucket puts no event", () => {
            const state = seededState();

            expect(eventsOf(state, setBucketItemGranularity("not-in-any-bucket", GRANULARITY.MONTH))).toEqual(
                [],
            );
            expect(countStoreWrites(state, setBucketItemGranularity("nope", GRANULARITY.MONTH))).toBe(0);
        });

        it("a display-form edit for an item that is in no bucket puts no event", () => {
            expect(eventsOf(seededState(), storeBucketItemDisplayForm("nope", { uri: "/df" }))).toEqual([]);
        });

        it("a replace of an item that is in no bucket puts no event", () => {
            const catalogItem = { identifier: "newAttr", type: "attribute", title: "New", id: "newAttr" };

            expect(
                eventsOf(
                    seededState(),
                    replaceBucketItem({ localIdentifier: "nope" } as never, catalogItem as never),
                ),
            ).toEqual([]);
        });
    });

    describe("the triggers that are NOT cascades reach no saga", () => {
        it("BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED is a plain bucketsMeta slice case", () => {
            const state = seededState();

            // no event at all — and the write still happens, in the trigger's own dispatch
            expect(eventsOf(state, toggleBucketItemExpanded(attribute as never))).toEqual([]);

            const { state: next } = runBucketsTrigger(state, toggleBucketItemExpanded(attribute as never));
            expect(next?.data?.bucketsMeta?.attributeExpanded).toBe("a1");
        });
    });

    describe("the md-object validity flag is an output of the operation", () => {
        it("a date-dataset change answers TRUE — no round trip is needed", () => {
            const { state } = runBucketsTrigger(
                seededState(),
                setAllBucketsDateDataset({ uri: "/gdc/dataset" }),
            );

            expect(state.data.isVisualizationMdObjectValid).toBe(true);
        });

        it("an edit answers FALSE — the plug viz has to answer before the object is valid", () => {
            const { state } = runBucketsTrigger(seededState(), setBucketItemTitle("m1", "renamed"));

            expect(state.data.isVisualizationMdObjectValid).toBe(false);
        });
    });
});
