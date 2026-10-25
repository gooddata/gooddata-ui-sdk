// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import {
    resetRemovedItems,
    resetRemovedItemsWereJustUpdated,
    setRemovedItems,
} from "./bucket_notifications_actions.js";
import { getRemovedItems, wereRemovedItemsJustUpdated } from "./bucket_notifications_selector.js";

describe("bucket notifications store", () => {
    describe("removed items", () => {
        const removedItems = {
            measures: 1,
            measureValueFilters: 2,
            rankingFilter: true,
        };
        it("should set removed items in app state", () => {
            const testedAction = setRemovedItems(removedItems);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getRemovedItems(reducedState)).toBe(removedItems);
            expect(wereRemovedItemsJustUpdated(reducedState)).toBe(true);
        });

        it("should reset removed items in app state", () => {
            const setRemovedItemsAction = setRemovedItems(removedItems);
            const state = combinedRootReducer(getInitializedState(), setRemovedItemsAction);
            const testedAction = resetRemovedItems();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(getRemovedItems(reducedState)).toBe(null);
        });

        it("should reset removedItemsWereJustUpdated in app state", () => {
            const setRemovedItemsAction = setRemovedItems(removedItems);
            const state = combinedRootReducer(getInitializedState(), setRemovedItemsAction);
            const testedAction = resetRemovedItemsWereJustUpdated();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(wereRemovedItemsJustUpdated(reducedState)).toBe(false);
        });
    });
});
