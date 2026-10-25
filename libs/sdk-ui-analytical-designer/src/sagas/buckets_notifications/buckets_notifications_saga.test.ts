// (C) 2020-2026 GoodData Corporation

import { type Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { type StaticProvider } from "redux-saga-test-plan/providers";
import { delay } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { type IFilters } from "@gooddata/sdk-ui-ext/internal";

import { extendedReferencePointChanged } from "../../actions/report_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { MEASURES, VIEW } from "../../constants/bucket.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { watchBucketsToSetNotifications } from "../../sagas/buckets_notifications/buckets_notifications_saga.js";
import {
    resetRemovedItemsWereJustUpdated,
    setRemovedItems,
} from "../../store/bucket_notifications/bucket_notifications_actions.js";
import {
    getRemovedItems,
    wereRemovedItemsJustUpdated,
} from "../../store/bucket_notifications/bucket_notifications_selector.js";
import { type IRemovedItems } from "../../store/bucket_notifications/bucket_notifications_types.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import { type IAppState } from "../../store/types.js";
import { categoriesBucketItems, measureBucketItems } from "../../tests/constants.test.helpers.js";
import { filterItems } from "../../tests/filter.test.helpers.js";
import { toRefPointItems } from "../../tests/reference_point.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";

describe("bucket notification store", () => {
    const buildState = (
        filters = filterItems,
        measures = measureBucketItems,
        slices = categoriesBucketItems,
    ) =>
        withData(FilterBarService.setFilterItems(getInitializedState(), filters), {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: measures,
                    totals: [],
                },
                {
                    localIdentifier: VIEW,
                    items: slices,
                    totals: [],
                },
            ],
        });

    async function dispatchAction(state: IAppState, action: Action, providers: StaticProvider[] = []) {
        const { storeState } = await expectSaga(watchBucketsToSetNotifications)
            .withReducer(combinedRootReducer, state)
            .provide(providers)
            .dispatch(action)
            .silentRun(0);
        return storeState;
    }

    describe("EXTENDED_REFERENCE_POINT_CHANGED", () => {
        const action = extendedReferencePointChanged({
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: toRefPointItems(measureBucketItems),
                    totals: [],
                },
            ],
            // the notifications saga never reads the filters bucket; an empty array stands in
            filters: [] as unknown as IFilters,
        });

        const removedItems: IRemovedItems = {
            measures: 1,
            measureValueFilters: 2,
            rankingFilter: true,
        };

        it("should reset 'just updated' flag when removed items were just updated", async () => {
            let state = buildState();
            const setRemovedItemsAction = setRemovedItems(removedItems);
            state = combinedRootReducer(state, setRemovedItemsAction);
            const reducedState = await dispatchAction(state, action);
            expect(wereRemovedItemsJustUpdated(reducedState)).toBe(false);
            expect(getRemovedItems(reducedState)).toBe(removedItems);
        });

        it("should reset removed items if they were not just removed", async () => {
            let state = buildState();
            const setRemovedItemsAction = setRemovedItems(removedItems);
            state = combinedRootReducer(state, setRemovedItemsAction);
            const resetRemovedItemsWereJustUpdatedAction = resetRemovedItemsWereJustUpdated();
            state = combinedRootReducer(state, resetRemovedItemsWereJustUpdatedAction);
            const reducedState = await dispatchAction(state, action);
            expect(getRemovedItems(reducedState)).toBeNull();
        });

        describe("notification dismiss in 30 seconds", () => {
            it("should reset items with changed granularity after the 30 second delay", async () => {
                let state = buildState();
                const setRemovedItemsAction = setRemovedItems(removedItems);
                state = combinedRootReducer(state, setRemovedItemsAction);
                const reducedState = await dispatchAction(state, action, [[delay(30_000), 0]]);
                expect(getRemovedItems(reducedState)).toBeNull();
            });
        });
    });

    describe("UNDO_ACTION", () => {
        it("should reset removed items in state", async () => {
            let state = buildState();
            const setRemovedItemsAction = setRemovedItems({
                measures: 1,
                measureValueFilters: 2,
                rankingFilter: true,
            });
            state = combinedRootReducer(state, setRemovedItemsAction);
            const undoAction = { type: ActionTypeKeys.UNDO_ACTION };

            const reducedState = await dispatchAction(state, undoAction);
            expect(getRemovedItems(reducedState)).toBeNull();
        });
    });

    describe("REDO_ACTION", () => {
        it("should reset removed items in state", async () => {
            let state = buildState();
            const setRemovedItemsAction = setRemovedItems({
                measures: 1,
                measureValueFilters: 2,
                rankingFilter: true,
            });
            state = combinedRootReducer(state, setRemovedItemsAction);
            const undoAction = { type: ActionTypeKeys.REDO_ACTION };

            const reducedState = await dispatchAction(state, undoAction);
            expect(getRemovedItems(reducedState)).toBeNull();
        });
    });
});
