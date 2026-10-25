// (C) 2019-2026 GoodData Corporation

import { type DndUiAction, DndUiActionTypeKeys } from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IFilterBarItem } from "../filter_bar/filter_bar_types.js";

import { type IDragAndDropState } from "./dnd_types.js";

const initialDndState: IDragAndDropState = {
    draggedBucketItem: undefined,
    draggedCatalogItem: undefined,
    draggedFilterItem: undefined,
};

const setDraggedCatalogItem = (state: IDragAndDropState, item: ICatalogEntry): IDragAndDropState => ({
    ...state,
    draggedCatalogItem: item,
});

const setDraggedBucketItem = (state: IDragAndDropState, item: IRawBucketItem): IDragAndDropState => ({
    ...state,
    draggedBucketItem: item,
});

const setDraggedFilterItem = (state: IDragAndDropState, filter: IFilterBarItem): IDragAndDropState => ({
    ...state,
    draggedFilterItem: filter,
});

/** The `data.dragAndDrop` leaf of the combined root (7.2). */
export const dndLeafReducer = (
    state: IDragAndDropState = initialDndState,
    action: DndUiAction,
): IDragAndDropState => {
    switch (action.type) {
        case DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_BEGIN:
            return setDraggedCatalogItem(state, action.payload.item);
        case DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_END:
            return setDraggedCatalogItem(state, undefined);
        case DndUiActionTypeKeys.UI_DND_BUCKET_ITEM_DRAG_BEGIN:
            return setDraggedBucketItem(state, action.payload.item);
        case DndUiActionTypeKeys.UI_DND_BUCKET_ITEM_DRAG_END:
            return setDraggedBucketItem(state, undefined);
        case DndUiActionTypeKeys.UI_DND_FILTER_ITEM_DRAG_BEGIN:
            return setDraggedFilterItem(state, action.payload.filter);
        case DndUiActionTypeKeys.UI_DND_FILTER_ITEM_DRAG_END:
            return setDraggedFilterItem(state, undefined);
        default:
            return state;
    }
};
