// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type ConnectDropTarget } from "@evil-internetmann/react-dnd";
import { type Identifier } from "dnd-core";

import type { BUCKET_ITEM, CATALOG_LIST_ITEM, FILTER_ITEM } from "../constants/drag_item_types.js";
import { type FilterType } from "../store/filter_bar/filter_bar_types.js";

import { type IDecoratedBucket, type IRawBucketItem } from "./buckets.js";
import { type ICatalogEntry } from "./state_objects.js";

export interface ICommonBucketDropContext {
    bucket: IDecoratedBucket;
    to: string;
    dragged: string;
    from: string;
    destBucketItem?: IRawBucketItem;
    renderDraggedItemElement(): ReactElement;
}

export interface ICatalogItemDropContext extends ICommonBucketDropContext {
    type: "CATALOG_LIST_ITEM";
    item: ICatalogEntry;
}

export interface IBucketItemDropContext extends ICommonBucketDropContext {
    type: "BUCKET_ITEM";
    bucketItem: IRawBucketItem;
    item: ICatalogEntry | null;
    index: number;
}

export interface IArithmeticMeasureDropContext extends IBucketItemDropContext {
    item: null;
}

export type IItemDropContext = IBucketItemDropContext | ICatalogItemDropContext;

/**
 * The curried drop-rule predicate: BucketContent bakes the bucket context into a rule from
 * models/bucket_rules.ts, and the drop targets call the result with whatever dragged data the
 * monitor holds — which is partial when nothing is being dragged.
 */
export type IIsAllowedToDrop = (draggedData?: Partial<IItemDropContext>) => boolean;

export function isBucketItemDropContext(context: IItemDropContext): context is IBucketItemDropContext {
    return context.type === "BUCKET_ITEM";
}

export function isArithmeticMeasureDropContext(
    context: IBucketItemDropContext,
): context is IArithmeticMeasureDropContext {
    return context.item === null;
}

/** What the bucket drag source hands the dnd monitor (components/buckets/DraggableBucketItem.tsx). */
export interface IDraggableBucketItem {
    type: typeof BUCKET_ITEM;
    /** the dragged item's cache entry (null for an arithmetic measure) */
    item: ICatalogEntry | null;
    /** the RAW dragged bucket item */
    bucketItem: IRawBucketItem;
    from: string;
    dragged: string;
    index: number;
    renderDraggedItemElement: () => ReactElement;
}

/** What the catalog drag source hands the dnd monitor (catalog/item/DraggableCatalogListItem.tsx). */
export interface IDraggableCatalogListItem {
    type: typeof CATALOG_LIST_ITEM;
    item: ICatalogEntry;
    from: string;
    dragged: string;
    index: number | null;
    renderDraggedItemElement: () => ReactElement;
}

/** What the filter-bar drag source hands the dnd monitor — registered under the BUCKET_ITEM dnd
 * type but discriminated by `dragItemType` (filterBar/DraggableFilterItem.tsx). */
export interface IDragFilterItem {
    dragItemType: typeof FILTER_ITEM;
    itemType: FilterType;
    itemLocalIdentifier: string;
    renderDraggedItemElement: () => ReactElement;
}

/** Everything a drop monitor can hold in this app. */
export type IDraggedItem = IDraggableBucketItem | IDraggableCatalogListItem | IDragFilterItem;

export interface IInjectedDropTargetProps {
    connectDropTarget?: ConnectDropTarget;
    isOver?: boolean;
    itemType?: Identifier;
    canDrop?: boolean;
    isDragging?: boolean;
    draggedItem?: IDraggedItem;
    isSmallScreen?: boolean;
}
