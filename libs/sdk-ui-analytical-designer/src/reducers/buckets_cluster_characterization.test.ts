// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISortItem } from "@gooddata/sdk-model";

import {
    changeMeasureChartType,
    setBucketItemAggregation,
    setBucketItemFormat,
    setBucketItemGranularity,
    setBucketItemShowOnSecondaryAxis,
    setBucketItemTitle,
    setRenamingBucketItemEnded,
    setRenamingBucketItemStarted,
    storeBucketItemEnableThresholdMeasure,
    storeBucketItemShowAllValues,
    storeSetBucketItemIsTotalMeasure,
} from "../actions/buckets_actions.js";
import { removeBucketItem } from "../actions/dnd_actions.js";
import { toggleDualAxis } from "../actions/properties_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { ATTRIBUTE, MEASURES, METRIC } from "../constants/bucket.js";
import { GRANULARITY } from "../models/granularity.js";
import { bucketsInitialState } from "../store/buckets/buckets_state.js";
import { defaultFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { countStoreWrites, dispatchBucketsTrigger } from "../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItem, type IRawBucketItems } from "../typings/buckets.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

/**
 * Characterization pins for the buckets cluster.
 *
 * These specs pin CONTRACTS, not just values:
 *
 * - the referencePoint sync tail stores `data.buckets` into `referencePoint.buckets` BY REFERENCE, in
 *   the same dispatch — atomic, so no render can see fresh buckets with a stale reference point;
 * - which no-op re-dispatches keep the buckets subtree IDENTICAL and which do NOT (the
 *   `setRelatedBucketItemsProperty` family rebuilds the items list, so a no-op still produces a new,
 *   deep-equal subtree). Idempotence is never inherited, so these pins record exactly where it holds;
 * - the removed-items notification write.
 *
 * Driven through the OPERATION SAGA (`utils/dispatch_buckets_trigger.ts`): the buckets triggers
 * write no state themselves, so a pin that dispatches a trigger has to run the saga that answers it.
 *
 * The gestures that are NOT cascades stay on `rootReducer`: the renaming mini-mount and the
 * bucketsMeta expansion toggle are plain slice cases with no saga at all.
 */
describe("buckets cluster characterization", () => {
    const masterMeasure1: IRawBucketItem = {
        attribute: "m1",
        localIdentifier: "m1",
        filters: [],
        aggregation: "sum",
        type: METRIC,
    };
    const masterMeasure2: IRawBucketItem = {
        attribute: "m2",
        localIdentifier: "m2",
        filters: [],
        type: METRIC,
    };
    const derivedMeasure1: IRawBucketItem = {
        attribute: "m3",
        localIdentifier: "m3",
        isDerived: true,
        masterLocalIdentifier: "m1",
        filters: [],
        type: METRIC,
    };
    const attribute1: IRawBucketItem = {
        localIdentifier: "a1",
        filters: [],
        type: ATTRIBUTE,
    };

    function getInitialState(measureItems: IRawBucketItems = [masterMeasure1, masterMeasure2]): IAppState {
        return withData(getInitializedState(), {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: measureItems,
                },
                {
                    localIdentifier: ATTRIBUTE,
                    items: [attribute1],
                },
            ],
        });
    }

    describe("referencePoint sync tail (bucketsWereChanged)", () => {
        it("stores the post-mutation buckets into referencePoint.buckets BY REFERENCE", () => {
            const state = getInitialState();
            const newState = dispatchBucketsTrigger(state, setBucketItemAggregation(masterMeasure1, "avg"));

            expect(newState.data.referencePoint.buckets).toBe(newState.data.buckets);
            expect(newState.data.buckets[0].items[0].aggregation).toBe("avg");
        });

        it("rebuilds referencePoint.filters from the filter bar on every buckets change", () => {
            const state = withData(getInitialState(), {
                filterBar: {
                    ...defaultFilterBarState,
                    items: [
                        {
                            type: "date",
                            dateDatasetRef: { uri: "uri.1" },
                        } as IFilter,
                    ],
                },
            });
            const newState = dispatchBucketsTrigger(state, setBucketItemAggregation(masterMeasure1, "avg"));

            const refPointFilters = newState.data.referencePoint.filters;
            expect(refPointFilters.localIdentifier).toBe("filters");
            expect(refPointFilters.items).toHaveLength(1);
        });

        it("mirrors visualizationProperties.sortItems into the reference point by reference", () => {
            // a PARTIAL sort item — the test only checks that the value is mirrored by reference
            const sortItems = [{ attributeSortItem: { direction: "asc" } }] as unknown as ISortItem[];
            const state = withData(getInitialState(), {
                visualizationProperties: {
                    ...getInitialState().data.visualizationProperties,
                    sortItems: sortItems,
                },
            });

            const newState = dispatchBucketsTrigger(state, setBucketItemAggregation(masterMeasure1, "avg"));

            expect(newState.data.referencePoint.properties.sortItems).toBe(sortItems);
        });

        it("resets isVisualizationMdObjectValid to false (the non-date mutation class)", () => {
            const state = withData(getInitialState(), { isVisualizationMdObjectValid: true });
            const newState = dispatchBucketsTrigger(state, setBucketItemAggregation(masterMeasure1, "avg"));

            expect(newState.data.isVisualizationMdObjectValid).toBe(false);
        });
    });

    describe("no-op re-dispatch identity contracts on data.buckets", () => {
        it.each([
            ["BUCKETS_SET_BUCKET_ITEM_FORMAT", () => setBucketItemFormat("m1", "#,##0.0", "preset")],
            ["BUCKETS_SET_BUCKET_ITEM_TITLE", () => setBucketItemTitle("m1", "renamed")],
            ["BUCKET_CHANGE_CHART_TYPE", () => changeMeasureChartType(MEASURES, "line")],
            ["BUCKET_TOGGLE_DUAL_AXIS", () => toggleDualAxis(MEASURES, true)],
            ["BUCKETS_SET_BUCKET_ITEM_AGGREGATION", () => setBucketItemAggregation(masterMeasure1, "avg")],
            // setRelatedBucketItemsProperty family: identity holds because the mapping helpers
            // return the SAME list when every element maps to itself. Fresh deep-equal collections
            // do NOT short-circuit; identical references do.
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_IS_TOTAL_MEASURE",
                () => storeSetBucketItemIsTotalMeasure("m1", true),
            ],
            [
                "BUCKETS_SET_BUCKET_ITEM_SHOW_ON_SECONDARY_AXIS",
                () => setBucketItemShowOnSecondaryAxis("m1", true),
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE",
                () => storeBucketItemEnableThresholdMeasure("m1", true),
            ],
            ["STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_ALL_VALUES", () => storeBucketItemShowAllValues("m1", true)],
        ])("%s keeps the buckets subtree IDENTICAL on a same-value re-dispatch", (_name, buildAction) => {
            const first = rootReducer(getInitialState(), buildAction());
            const second = rootReducer(first, buildAction());

            expect(second.data.buckets).toBe(first.data.buckets);
        });
    });

    describe("renamingBucketItem leaf", () => {
        it("sets the flag and returns the SAME root when the value is already set", () => {
            const started = rootReducer(getInitialState(), setRenamingBucketItemStarted());
            expect(started?.appState?.renamingBucketItem).toBe(true);

            const startedAgain = rootReducer(started, setRenamingBucketItemStarted());
            expect(startedAgain).toBe(started);
        });

        it("ENDED on the pristine (already false) flag returns the SAME root", () => {
            const state = getInitialState();
            expect(rootReducer(state, setRenamingBucketItemEnded())).toBe(state);
        });
    });

    describe("removed-items notification (the UNSAFE_ indirection being dissolved)", () => {
        it("removing a master measure notifies about its removed derived measure", () => {
            const state = getInitialState([derivedMeasure1, masterMeasure1, masterMeasure2]);
            const newState = dispatchBucketsTrigger(state, removeBucketItem(masterMeasure1, 1, MEASURES));

            const notifications = newState.data.bucketNotifications;
            expect(notifications.removedItems).toEqual({
                measures: 1,
                measureValueFilters: 0,
                rankingFilter: false,
            });
            expect(notifications.removedItemsWereJustUpdated).toBe(true);
        });

        it("removing an attribute with no dependants leaves the notifications subtree untouched", () => {
            const state = getInitialState();
            const before = state.data.bucketNotifications;

            const newState = dispatchBucketsTrigger(state, removeBucketItem(attribute1, 0, ATTRIBUTE));

            expect(newState.data.bucketNotifications).toBe(before);
        });
    });

    describe("the buckets seed", () => {
        it("the pristine state carries the buckets seed, identical to the slice initialState", () => {
            expect(Array.isArray(initialState.data.buckets)).toBe(true);
            expect(initialState.data.buckets).toBe(bucketsInitialState);
            expect(Array.isArray(initialState.data.referencePoint.buckets)).toBe(true);
        });

        it("RESET_FOR_PLUGGABLE_MOUNT reinstalls the initial container", () => {
            const mutated = dispatchBucketsTrigger(
                getInitialState(),
                setBucketItemAggregation(masterMeasure1, "avg"),
            );
            const reset = rootReducer(mutated, { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT });

            expect(Array.isArray(reset.data.buckets)).toBe(true);
            expect(reset.data.buckets).toHaveLength(0);
        });
    });

    /**
     * ONE gesture, ONE write to `data`: the trigger writes nothing and the operation's event writes
     * everything, so the count is exactly one — and it is measured, not argued. See
     * `countStoreWrites` for why the `timeTravel` push on the trigger's own dispatch is deliberately
     * not counted.
     */
    describe("one dispatch per operation", () => {
        it.each([
            ["a bucket-item edit", () => setBucketItemAggregation(masterMeasure1, "avg")],
            ["a drag-out removal", () => removeBucketItem(masterMeasure1, 1, MEASURES)],
            ["a dual-axis toggle", () => toggleDualAxis(MEASURES, true)],
        ])("commits %s in ONE write to data", (_name, buildAction) => {
            const state = getInitialState([derivedMeasure1, masterMeasure1, masterMeasure2]);

            expect(countStoreWrites(state, buildAction())).toBe(1);
        });

        it("commits NOTHING for an edit whose bucket item is in no bucket", () => {
            const state = getInitialState();

            // the granularity edit bails out entirely, which skips the
            // reference-point sync AND left isVisualizationMdObjectValid alone. The operation answers
            // `undefined` and the saga puts no event at all.
            expect(
                countStoreWrites(state, setBucketItemGranularity("not-in-any-bucket", GRANULARITY.MONTH)),
            ).toBe(0);
        });
    });

    describe("preserved quirks", () => {
        it("BUCKET_TOGGLE_DUAL_AXIS on an unknown bucket silently toggles the LAST bucket (negative-index wrap)", () => {
            // getBucketIndex returns -1 for an unknown bucket, and resolveIndex wraps that index
            // BEFORE it becomes a path segment — so the write lands on the LAST bucket's items
            // instead of throwing or writing a stray "-1" own property. Adding an index guard here
            // would be a behavior change.
            const newState = dispatchBucketsTrigger(
                getInitialState(),
                toggleDualAxis("no-such-bucket", true),
            );

            expect(newState.data.buckets[1].items[0].showOnSecondaryAxis).toBe(true);
            expect(newState.data.buckets[0].items[0].showOnSecondaryAxis).toBeUndefined();
        });
    });
});
