// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import {
    resetAboutToBeRemovedBucketAndFilterItems,
    resetHighlightedBucketItems,
    resetHighlightedFilterItem,
    setAboutToBeRemovedBucketAndFilterItems,
    setHighlightedBucketItems,
    setHighlightedFilterItem,
} from "./highlighting_actions.js";
import {
    getAboutToBeRemovedBucketAndFilterItems,
    getHighlightedBucketItems,
    getHighlightedFilterItem,
} from "./highlighting_selector.js";

describe("highlighting store", () => {
    describe("highlighted bucket items", () => {
        it("should set highlighted bucket items in app state", () => {
            const highlightedBucketItems = ["m1"];
            const testedAction = setHighlightedBucketItems(highlightedBucketItems);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getHighlightedBucketItems(reducedState)).toBe(highlightedBucketItems);
        });

        it("should reset highlighted bucket items in app state", () => {
            const setHighlightedBucketItemsAction = setHighlightedBucketItems(["m1"]);
            const state = combinedRootReducer(getInitializedState(), setHighlightedBucketItemsAction);
            const testedAction = resetHighlightedBucketItems();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(getHighlightedBucketItems(reducedState)).toBeUndefined();
        });
    });

    describe("highlighted filter items", () => {
        describe("SET_HIGHLIGHTED_FILTER_ITEM", () => {
            it("should set highlighted item local id in the filterBarState", () => {
                const newState = combinedRootReducer(
                    getInitializedState(),
                    setHighlightedFilterItem("87362516"),
                );

                expect(getHighlightedFilterItem(newState)).toBe("87362516");
            });
        });

        describe("RESET_HIGHLIGHTED_FILTER_ITEM", () => {
            it('should reset highlightedLocalIdentifier and set "" value to the property in state', () => {
                const defaultStateWithActiveHightedID = combinedRootReducer(
                    getInitializedState(),
                    setHighlightedFilterItem("87362516"),
                );
                const newState = combinedRootReducer(
                    defaultStateWithActiveHightedID,
                    resetHighlightedFilterItem(),
                );

                expect(getHighlightedFilterItem(newState)).toBeUndefined();
            });
        });
    });

    describe("about to be removed bucket and filter items", () => {
        it("should set highlighted bucket and filter items in app state", () => {
            const highlightedBucketItems = ["m1"];
            const testedAction = setAboutToBeRemovedBucketAndFilterItems(highlightedBucketItems);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBe(highlightedBucketItems);
        });

        it("should reset highlighted bucket and filter items in app state", () => {
            const setHighlightedBucketItemsAction = setAboutToBeRemovedBucketAndFilterItems(["m1"]);
            const state = combinedRootReducer(getInitializedState(), setHighlightedBucketItemsAction);
            const testedAction = resetAboutToBeRemovedBucketAndFilterItems();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });
    });
});
