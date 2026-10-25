// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IFilterBarItem } from "../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

export enum DndUiActionTypeKeys {
    // DnD actions related to dragged items
    UI_DND_BUCKET_ITEM_DRAG_BEGIN = "UI/DND_BUCKET_ITEM_DRAG_BEGIN",
    UI_DND_BUCKET_ITEM_DRAG_END = "UI/DND_BUCKET_ITEM_DRAG_END",

    UI_DND_FILTER_ITEM_DRAG_BEGIN = "UI/DND_FILTER_ITEM_DRAG_BEGIN",
    UI_DND_FILTER_ITEM_DRAG_END = "UI/DND_FILTER_ITEM_DRAG_END",

    UI_DND_CATALOG_ITEM_DRAG_BEGIN = "UI/DND_CATALOG_ITEM_DRAG_BEGIN",
    UI_DND_CATALOG_ITEM_DRAG_FAILED = "UI/DND_CATALOG_ITEM_DRAG_FAILED",
    UI_DND_CATALOG_ITEM_DRAG_END = "UI/DND_CATALOG_ITEM_DRAG_END",
}

export type DndUiAction =
    | IStartDragCatalogItemAction
    | IEndDragCatalogItemAction
    | IDragItemFailedAction
    | IStartDragBucketItemAction
    | IEndDragBucketItemAction
    | IStartDragFilterItemAction
    | IEndDragFilterItemAction;

export const startDragCatalogItem = createAction(
    DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_BEGIN,
    (item: ICatalogEntry) => ({ payload: { item } }),
);

export type IStartDragCatalogItemAction = ReturnType<typeof startDragCatalogItem>;

export const endDragCatalogItem = createAction(DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_END);

export type IEndDragCatalogItemAction = ReturnType<typeof endDragCatalogItem>;

export const dragItemFailed = createAction(
    DndUiActionTypeKeys.UI_DND_CATALOG_ITEM_DRAG_FAILED,
    (mouseX: number | string, mouseY: number | string, from: string, dragged: string) => ({
        payload: { mouseX, mouseY, from, dragged },
    }),
);

export type IDragItemFailedAction = ReturnType<typeof dragItemFailed>;

export const startDragBucketItem = createAction(
    DndUiActionTypeKeys.UI_DND_BUCKET_ITEM_DRAG_BEGIN,
    (item: IRawBucketItem) => ({ payload: { item } }),
);

export type IStartDragBucketItemAction = ReturnType<typeof startDragBucketItem>;

export const endDragBucketItem = createAction(DndUiActionTypeKeys.UI_DND_BUCKET_ITEM_DRAG_END);

export type IEndDragBucketItemAction = ReturnType<typeof endDragBucketItem>;

export const startDragFilterItem = createAction(
    DndUiActionTypeKeys.UI_DND_FILTER_ITEM_DRAG_BEGIN,
    (filter: IFilterBarItem) => ({ payload: { filter } }),
);

export type IStartDragFilterItemAction = ReturnType<typeof startDragFilterItem>;

export const endDragFilterItem = createAction(DndUiActionTypeKeys.UI_DND_FILTER_ITEM_DRAG_END);

export type IEndDragFilterItemAction = ReturnType<typeof endDragFilterItem>;
