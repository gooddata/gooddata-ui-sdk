// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classnames from "classnames";
import { omit } from "lodash-es";
import { useDispatch } from "react-redux";

import { dropCatalogItem, reorderBucketItem } from "../../actions/dnd_actions.js";
import { CATALOG } from "../../constants/bucket.js";
import { BUCKET_ITEM, CATALOG_LIST_ITEM } from "../../constants/drag_item_types.js";
import { endDragBucketItem, startDragBucketItem } from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type AppDispatch } from "../../store/types.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
    type IRawBucketItem,
} from "../../typings/buckets.js";
import {
    type IDraggableBucketItem,
    type IInjectedDropTargetProps,
    type IIsAllowedToDrop,
    type IItemDropContext,
} from "../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

import { BucketItem } from "./BucketItem.js";
import { DraggableBucketItem } from "./DraggableBucketItem.js";

export const HOVER_TOP = "top";
export const HOVER_BOTTOM = "bottom";

interface IBucketReorderableItemOwnProps {
    onFilterItemDropped?: (catalogItem: ICatalogEntry) => void;
    itemIsAllowedToReplace?: (params?: Partial<IItemDropContext>, buckets?: IDecoratedBuckets) => boolean;
    itemIsAllowedToReorder?: IIsAllowedToDrop;
    isWithinLimit?: (context?: Partial<IItemDropContext>, buckets?: IDecoratedBuckets) => boolean;
    dropZoneTitle?: string;
    bucket: IDecoratedBucket;
    bucketItem: IDecoratedBucketItem;
    index: number;
    bucketPosition: number;
    dragHandle: boolean;
}

export interface IBucketReorderableItemProps
    extends IBucketReorderableItemOwnProps, IInjectedDropTargetProps {}

export function BucketReorderableItem(props: IBucketReorderableItemProps) {
    const {
        // the fallbacks were `(v) => v` — every call site passes a (truthy) context object, so the
        // literal `true` is what they always answered
        itemIsAllowedToReplace = () => true,
        itemIsAllowedToReorder = () => true,
        isWithinLimit = () => true,
        canDrop: canDropProp,
        isOver: isOverProp,
        bucket,
        bucketItem,
        index,
    } = props;

    const dispatch = useDispatch<AppDispatch>();

    const onCatalogItemDropped = useCallback(
        (localIdentifier: string, catalogItem: ICatalogEntry, bucketPosition: number) => {
            dispatch(dropCatalogItem(localIdentifier, catalogItem, bucketPosition));
        },
        [dispatch],
    );

    const onReorderBucketItem = useCallback(
        (localIdentifier: string, from: IRawBucketItem, fromPosition: number, bucketPosition: number) => {
            dispatch(reorderBucketItem(localIdentifier, from, fromPosition, bucketPosition));
        },
        [dispatch],
    );

    const onStartBucketItemDrag = useCallback(
        (item: IRawBucketItem) => {
            dispatch(startDragBucketItem(item));
        },
        [dispatch],
    );

    const onEndBucketItemDrag = useCallback(() => {
        dispatch(endDragBucketItem());
    }, [dispatch]);

    const [dropPosition, setDropPosition] = useState<string>(HOVER_TOP);
    const [dropIndex, setDropIndex] = useState<number>(null);
    const [draggedItemBucket, setDraggedItemBucket] = useState<string>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const itemIsAllowedToReplaceLocal = useMemo(
        () =>
            function (context?: Partial<IItemDropContext>, buckets?: IDecoratedBuckets) {
                return !isWithinLimit(context, buckets) && itemIsAllowedToReplace(context, buckets);
            },
        [isWithinLimit, itemIsAllowedToReplace],
    );

    const [{ canDrop, isOver }, dropRef] = useDrop(
        () => ({
            accept: [CATALOG_LIST_ITEM, BUCKET_ITEM],
            drop: (_item: unknown, monitor: DropTargetMonitor) => {
                const item = monitor.getItem() as IDraggableBucketItem;
                const catalogItem = item.item;
                const localIdentifier = bucket.localIdentifier;
                if (dropIndex === null) return;
                const itemType = monitor.getItemType();
                if (itemType === BUCKET_ITEM) {
                    onReorderBucketItem(localIdentifier, item.bucketItem, item.index, dropIndex);
                    setDropIndex(null);
                } else if (itemType === CATALOG_LIST_ITEM) {
                    onCatalogItemDropped(localIdentifier, catalogItem, dropIndex);
                    setDropIndex(null);
                }
            },
            hover: (_item: unknown, monitor: DropTargetMonitor) => {
                const can = monitor.canDrop();

                const dragged = monitor.getItem() as IDraggableBucketItem;
                setDraggedItemBucket(dragged.from);
                if (dragged.index === index) {
                    setDropIndex(null);
                    return;
                }
                const lastIndex = bucket.items.length - 1;
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const hoverPos = getHoverPosition(monitor.getClientOffset().y, rect);
                const di = calculateDropIndex(hoverPos, dragged.index, index, lastIndex);
                if (di === null) {
                    setDropIndex(null);
                    return;
                }
                if (can && di >= 0) {
                    setDropPosition(hoverPos);
                    setDropIndex(di);
                }
            },
            canDrop: (_item, monitor) => {
                const draggedItem = monitor.getItem() as IDraggableBucketItem;
                return itemIsAllowedToReorder({
                    ...draggedItem,
                    destBucketItem: bucketItem.original,
                });
            },
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver(),
            }),
        }),
        [
            bucket,
            bucketItem,
            index,
            onReorderBucketItem,
            onCatalogItemDropped,
            itemIsAllowedToReorder,
            dropIndex,
        ],
    );

    const effectiveCanDrop = canDropProp ?? canDrop;
    const effectiveIsOver = isOverProp ?? isOver;

    const isDropLineVisible = () => {
        const items = bucket.items ?? [];
        const itemsCountInLimit = items.length < bucket.itemsLimit;
        const isBucketAllowed =
            draggedItemBucket === bucket.localIdentifier ||
            (draggedItemBucket === CATALOG && itemsCountInLimit);
        return effectiveIsOver && effectiveCanDrop && isBucketAllowed && dropIndex !== null;
    };

    const renderDropLine = () => {
        if (isDropLineVisible()) {
            const classes = classnames("adi-bucket-drop-line", `adi-drop-line-${dropPosition}`);
            return <div className={classes} />;
        }
        return false;
    };

    const childProps = {
        ...omit(props, ["itemIsAllowedToReorder", "itemIsAllowedToReplace", "isWithinLimit"]),
        onCatalogItemDropped,
        reorderBucketItem: onReorderBucketItem,
        onStartBucketItemDrag,
        onEndBucketItemDrag,
        itemIsAllowedToDrop: itemIsAllowedToReplaceLocal,
    };
    const isMeasureItem = bucketItem.isMeasure;

    return (
        <div
            className="adi-reorderable-bucket-item"
            ref={(node) => {
                containerRef.current = node;
                dropRef(node);
            }}
        >
            {renderDropLine()}
            {isMeasureItem ? <DraggableBucketItem {...childProps} /> : <BucketItem {...childProps} />}
        </div>
    );
}

const getLineCenter = (a: number, b: number) => Math.abs(a - b) / 2;

export function getHoverPosition(y: number, { top, bottom }: { top: number; bottom: number }) {
    const bucketItemCenter = getLineCenter(top, bottom) + top;
    return y < bucketItemCenter ? HOVER_TOP : HOVER_BOTTOM;
}

export function calculateDropIndex(
    hoverPosition: string,
    draggedItemIndex: number | null,
    hoveredItemIndex: number,
    lastIndex: number,
) {
    const draggedFromCatalog = draggedItemIndex === null;
    if (hoverPosition === HOVER_TOP) {
        // Next item top half = same position -> nothing to do
        if (draggedItemIndex + 1 === hoveredItemIndex) {
            return null;
        }

        return draggedFromCatalog || draggedItemIndex > hoveredItemIndex
            ? hoveredItemIndex
            : hoveredItemIndex - 1;
    }

    if (hoverPosition === HOVER_BOTTOM) {
        // disable drop to last position when dragging from catalog
        if (draggedFromCatalog && lastIndex === hoveredItemIndex) {
            return null;
        }
        // Previous item bottom half = same position -> nothing to do
        if (draggedItemIndex - 1 === hoveredItemIndex) {
            return null;
        }

        return draggedFromCatalog || draggedItemIndex > hoveredItemIndex
            ? hoveredItemIndex + 1
            : hoveredItemIndex;
    }

    return null;
}
