// (C) 2020-2026 GoodData Corporation

import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IFilterBarItem } from "../filter_bar/filter_bar_types.js";

export interface IDragAndDropState {
    draggedCatalogItem: ICatalogEntry;
    draggedBucketItem: IRawBucketItem;
    draggedFilterItem: IFilterBarItem;
}
