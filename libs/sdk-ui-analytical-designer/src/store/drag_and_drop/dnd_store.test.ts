// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ATTRIBUTE, METRIC } from "../../constants/bucket.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import {
    endDragBucketItem,
    endDragCatalogItem,
    endDragFilterItem,
    startDragBucketItem,
    startDragCatalogItem,
    startDragFilterItem,
} from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";

import { getDraggedBucketItem, getDraggedCatalogItem, getDraggedFilterItem } from "./dnd_selectors.js";

describe("Drag and drop store module", () => {
    const draggedCatalogItem: ICatalogEntry = { type: METRIC };

    const draggedBucketItem: IRawBucketItem = {
        type: ATTRIBUTE,
    };

    const draggedFilterItem: IFilter = {
        type: "measure",
        localIdentifier: "f1",
        measureLocalIdentifier: "m1",
    };

    describe("UI_DND_CATALOG_ITEM_DRAG_BEGIN", () => {
        it("should store dragged catalog item", () => {
            const testedAction = startDragCatalogItem(draggedCatalogItem);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getDraggedCatalogItem(reducedState)).toBe(draggedCatalogItem);
        });
    });

    describe("UI_DND_CATALOG_ITEM_DRAG_END", () => {
        it("should reset dragged catalog item in app state", () => {
            const storeCatalogItemAction = startDragCatalogItem(draggedCatalogItem);
            const state = combinedRootReducer(getInitializedState(), storeCatalogItemAction);
            const testedAction = endDragCatalogItem();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(getDraggedCatalogItem(reducedState)).toBeUndefined();
        });
    });

    describe("UI_DND_BUCKET_ITEM_DRAG_BEGIN", () => {
        it("should set dragged bucket item in app state", () => {
            const testedAction = startDragBucketItem(draggedBucketItem);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getDraggedBucketItem(reducedState)).toBe(draggedBucketItem);
        });
    });

    describe("UI_DND_BUCKET_ITEM_DRAG_END", () => {
        it("should reset dragged bucket item in app state", () => {
            const storeDraggedBucketItemAction = startDragBucketItem(draggedBucketItem);
            const state = combinedRootReducer(getInitializedState(), storeDraggedBucketItemAction);
            const testedAction = endDragBucketItem();

            const reducedState = combinedRootReducer(state, testedAction);

            expect(getDraggedBucketItem(reducedState)).toBeUndefined();
        });
    });

    describe("UI_DND_FILTER_ITEM_DRAG_BEGIN", () => {
        it("should set dragged filter item in app state", () => {
            const testedAction = startDragFilterItem(draggedFilterItem);

            const reducedState = combinedRootReducer(getInitializedState(), testedAction);

            expect(getDraggedFilterItem(reducedState)).toBe(draggedFilterItem);
        });
    });

    describe("UI_DND_FILTER_ITEM_DRAG_END", () => {
        it("should reset dragged filter item in app state", () => {
            const storeDraggedFilterItemAction = startDragFilterItem(draggedFilterItem);

            const state = combinedRootReducer(getInitializedState(), storeDraggedFilterItemAction);

            const testedAction = endDragFilterItem();
            const reducedState = combinedRootReducer(state, testedAction);
            expect(getDraggedFilterItem(reducedState)).toBeUndefined();
        });
    });
});
