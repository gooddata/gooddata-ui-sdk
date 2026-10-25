// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { select, take } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { MEASURES } from "../../constants/bucket.js";
import { countStoreWrites, runBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { createAttributeFilter, createDateFilter } from "../filter_bar/filter_bar_helpers.js";
import { getFilterBarState, getFilterItems } from "../filter_bar/filter_bar_selector.js";
import { FilterBar, type IFilter } from "../filter_bar/filter_bar_types.js";
import { getReferencePoint } from "../reference_point/reference_point_selectors.js";
import { type IAppState } from "../types.js";

import {
    commandAddOrUpdateFilterItems,
    storeSetBucketItemAddMetricFilter,
    storeSetBucketItemRemoveMetricFilter,
    storeSetBucketItemUpdateMetricFilter,
    storeUpdateAttributeFilter,
    storeUpdateDateFilter,
    storeUpdateDateFilterDateDataset,
    storeUpdateMeasureValueFilter,
    storeUpdateRankingFilter,
} from "./bucket_filters_actions.js";
import {
    attributeFilterUpdated,
    dateFilterDateDatasetChanged,
    filterItemsCommandFailed,
    filterItemsUpdatedFromCommand,
    measureFilterAdded,
} from "./bucket_filters_operation_events.js";
import { applyCommandFilterItemsUpdate } from "./bucket_filters_operations.js";
import { watchBucketFilterOperations } from "./bucket_filters_operations_saga.js";

/**
 * What this suite measures:
 *
 * - ONE store write per trigger, counted with `countStoreWrites` over `data`;
 * - the identity contract on the no-op and conditional paths — an unchanged value must arrive by
 *   REFERENCE, so no subscriber is notified;
 * - the ALWAYS-EMIT property of `dateFilterDateDatasetChanged` and `filterItemsUpdatedFromCommand`,
 *   which `sagas/date_datasets` and `control_filtering_saga` `take` on and would otherwise hang;
 * - the commit-nothing paths (a missing filter, a bucket item in no bucket).
 *
 * Everything runs through `runBucketsTrigger` — the REAL saga and the REAL reducer, only the store
 * is fake.
 */

const DF_REF = uriRef("/gdc/md/project/obj/df1");
const DATE_DATASET_REF = uriRef("/gdc/md/project/obj/ds1");
const OTHER_DATE_DATASET_REF = uriRef("/gdc/md/project/obj/ds2");

const attributeFilter = createAttributeFilter("attr.a", DF_REF);
const dateFilter = createDateFilter(DATE_DATASET_REF);

const metricFilter = { attribute: "attr.a", localIdentifier: "mf_1" };
const measureItem = {
    localIdentifier: "m1",
    attribute: "metric.m1",
    type: "metric",
    filters: [metricFilter],
};

function seedState(): IAppState {
    const withFilters = withData(getInitializedState(), {
        filterBar: {
            items: [attributeFilter, dateFilter],
            parameterItems: [],
            isMultiline: false,
            migratedAdditionalFilters: [],
            filterBarDropdownOpen: false,
            attributeFilterConfigs: {},
        },
    });

    return withData(withFilters, { buckets: [{ localIdentifier: MEASURES, items: [measureItem] }] });
}

const catalogAttribute: ICatalogEntry = {
    identifier: "attr.b",
    dfRef: uriRef("/gdc/md/project/obj/df2"),
    primaryRef: uriRef("/gdc/md/project/obj/df2primary"),
};

describe("bucket filters operations — one store write, identity and always-emit", () => {
    describe("one gesture, one store write", () => {
        it.each([
            [
                "STORE_UPDATE_ATTRIBUTE_FILTER",
                storeUpdateAttributeFilter({
                    filterLocalIdentifier: attributeFilter.localIdentifier,
                    selectedElements: [{ uri: "/element/1" }],
                    totalElementsCount: 10,
                    isInverted: false,
                }),
            ],
            [
                "STORE_UPDATE_DATE_FILTER",
                storeUpdateDateFilter({
                    localIdentifier: dateFilter.localIdentifier,
                    filterConfig: {
                        interval: ["2020-01-01", "2020-01-02"],
                        type: "absolute",
                        granularity: "GDC.time.date",
                    },
                    dateDatasetRef: DATE_DATASET_REF,
                }),
            ],
            [
                "STORE_UPDATE_DATE_FILTER_DATE_DATASET",
                storeUpdateDateFilterDateDataset(dateFilter.localIdentifier, OTHER_DATE_DATASET_REF),
            ],
            [
                "STORE_ADD_OR_UPDATE_FILTER_ITEMS",
                commandAddOrUpdateFilterItems({
                    attributeFilters: [
                        {
                            filterLocalIdentifier: undefined,
                            totalElementsCount: 1,
                            selectedElements: [{ uri: "/element/1" }],
                            isInverted: true,
                            dfIdentifier: "df.b",
                            cacheItemIdentifier: "attr.b",
                        },
                    ],
                }),
            ],
            [
                "STORE_UPDATE_MEASURE_VALUE_FILTER",
                storeUpdateMeasureValueFilter({
                    type: "measure",
                    localIdentifier: "mvf_1",
                    measureLocalIdentifier: "m1",
                }),
            ],
            [
                "STORE_UPDATE_RANKING_FILTER",
                storeUpdateRankingFilter({
                    type: "ranking",
                    localIdentifier: "rf_1",
                    measureLocalIdentifier: "m1",
                    operator: "TOP",
                    value: 10,
                }),
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER",
                storeSetBucketItemAddMetricFilter(measureItem, catalogAttribute, "ds1"),
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER",
                storeSetBucketItemRemoveMetricFilter(measureItem, metricFilter),
            ],
            [
                "STORE_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER",
                storeSetBucketItemUpdateMetricFilter(measureItem, metricFilter, { isInverted: true }, true),
            ],
        ])("%s changes `data` exactly once", (_trigger, action) => {
            expect(countStoreWrites(seedState(), action)).toBe(1);
        });
    });

    describe("the declared commit-nothing hardenings", () => {
        it("an attribute-filter update addressing a missing filter commits nothing and emits nothing", () => {
            const action = storeUpdateAttributeFilter({
                filterLocalIdentifier: "no_such_filter",
                selectedElements: [],
                totalElementsCount: 0,
                isInverted: true,
            });

            const { dispatched } = runBucketsTrigger(seedState(), action);

            expect(countStoreWrites(seedState(), action)).toBe(0);
            expect(dispatched.some((a) => attributeFilterUpdated.match(a))).toBe(false);
        });

        it("a metric-filter add addressing a bucket item in no bucket commits nothing and emits nothing", () => {
            const strayItem = { localIdentifier: "not_in_any_bucket" };
            const action = storeSetBucketItemAddMetricFilter(strayItem, catalogAttribute, "ds1");

            const { dispatched } = runBucketsTrigger(seedState(), action);

            expect(countStoreWrites(seedState(), action)).toBe(0);
            expect(dispatched.some((a) => measureFilterAdded.match(a))).toBe(false);
        });
    });

    describe("the always-emit contract of the two waited-on events", () => {
        it("a date-dataset change to the SAME dataset writes nothing but still emits (the take in sagas/date_datasets must not hang)", () => {
            const action = storeUpdateDateFilterDateDataset(dateFilter.localIdentifier, DATE_DATASET_REF);
            const before = seedState();

            const { state, dispatched } = runBucketsTrigger(before, action);
            const event = dispatched.find((a) => dateFilterDateDatasetChanged.match(a)) as
                | ReturnType<typeof dateFilterDateDatasetChanged>
                | undefined;

            expect(countStoreWrites(before, action)).toBe(0);
            expect(event).toBeDefined();
            // the no-op carries every value by REFERENCE
            expect(event.payload.filterBar).toBe(getFilterBarState(before));
            expect(getFilterBarState(state)).toBe(getFilterBarState(before));
        });

        it("a co-watcher that takes filterItemsUpdatedFromCommand sees the filters the command created (the control_filtering follow-up)", () => {
            const seen: ReadonlyArray<IFilter>[] = [];
            function* commandFollowUp(): SagaIterator {
                yield take(filterItemsUpdatedFromCommand.type);
                const items: ReturnType<typeof getFilterItems> = yield select(getFilterItems);
                seen.push(items);
            }

            runBucketsTrigger(
                seedState(),
                commandAddOrUpdateFilterItems({
                    attributeFilters: [
                        {
                            filterLocalIdentifier: undefined,
                            totalElementsCount: 1,
                            selectedElements: [{ uri: "/element/1" }],
                            isInverted: true,
                            dfIdentifier: "df.b",
                            cacheItemIdentifier: "attr.b",
                        },
                    ],
                }),
                // registered BEFORE the operation watchers — the adversarial order
                [commandFollowUp],
            );

            expect(seen).toHaveLength(1);
            expect(
                seen[0]
                    .filter(FilterBar.isAttributeFilter)
                    .some((filter) => filter.cacheItemIdentifier === "attr.b"),
            ).toBe(true);
        });
    });

    describe("the failure carrier of the embedded command", () => {
        it("an unexpected throw inside the command operation emits filterItemsCommandFailed and keeps the watcher alive", async () => {
            const trigger = commandAddOrUpdateFilterItems({ attributeFilters: [] });
            const failure = new Error("operation blew up");

            const { effects } = await expectSaga(watchBucketFilterOperations)
                .withState(seedState())
                .provide([[matchers.call.fn(applyCommandFilterItemsUpdate), throwError(failure)]])
                .dispatch(trigger)
                // a SECOND command proves the takeEvery worker's error did not kill the watcher
                .dispatch(trigger)
                .silentRun(50);

            const puts = (effects.put ?? []).map((effect) => effect.payload.action);
            expect(puts.filter((action) => filterItemsCommandFailed.match(action))).toHaveLength(2);
            expect(puts[0].payload.error).toBe(failure);
            expect(puts.some((action) => filterItemsUpdatedFromCommand.match(action))).toBe(false);
        });
    });

    describe("the conditional tail of the metric-filter update", () => {
        it("an edit that neither drives the comparison nor marks the filter modified rewrites the filters but does NOT re-sync the reference point", () => {
            const before = seedState();
            const action = storeSetBucketItemUpdateMetricFilter(
                measureItem,
                metricFilter,
                { isInverted: true },
                false,
            );

            const { state } = runBucketsTrigger(before, action);

            // the filters rewrite lands...
            expect(countStoreWrites(before, action)).toBe(1);
            // ...but the reference point is the SAME reference — no sync ran, no subscriber notified
            expect(getReferencePoint(state)).toBe(getReferencePoint(before));
        });
    });
});
