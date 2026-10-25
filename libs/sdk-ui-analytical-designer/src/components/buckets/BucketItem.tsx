// (C) 2007-2026 GoodData Corporation

import { type Ref, useCallback, useEffect, useRef } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { useDispatch } from "react-redux";

import { replaceBucketItem, swapBucketItem } from "../../actions/dnd_actions.js";
import { BUCKET_ITEM, CATALOG_LIST_ITEM } from "../../constants/drag_item_types.js";
import { endDragBucketItem, startDragBucketItem } from "../../sagas/drag_and_drop/drag_and_drop_actions.js";
import {
    highlightItemsToBeRemovedBySwap,
    resetHighlightedItemsToBeRemoved,
} from "../../sagas/highlighting/highlighting_ui_actions.js";
import { type AppDispatch } from "../../store/types.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IRawBucketItem,
} from "../../typings/buckets.js";
import {
    type IDraggableBucketItem,
    type IInjectedDropTargetProps,
    type IIsAllowedToDrop,
} from "../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

import { DraggableBucketItem } from "./DraggableBucketItem.js";

interface IBucketItemOwnProps {
    bucket: IDecoratedBucket;
    bucketItem: IDecoratedBucketItem;
    itemIsAllowedToDrop: IIsAllowedToDrop;
    index: number;
    bucketPosition: number;
    dragHandle?: boolean;
}

export interface IBucketItemProps extends IBucketItemOwnProps, IInjectedDropTargetProps {}

export interface IBucketItemDropHandlers {
    onCatalogItemDropped: (bucketItem: IRawBucketItem, catalogItem: ICatalogEntry) => void;
    onItemSwapped: (localIdentifier: string, from: IRawBucketItem, to: IRawBucketItem) => void;
}

export function BucketItem({
    canDrop: canDropProp,
    isOver: isOverProp,
    dragHandle = false,
    isDragging = false,
    itemType = null,
    bucketItem,
    ...restProps
}: IBucketItemProps) {
    const dispatch = useDispatch<AppDispatch>();

    const onCatalogItemDropped = useCallback(
        (droppedOnBucketItem: IRawBucketItem, catalogItem: ICatalogEntry) => {
            dispatch(replaceBucketItem(droppedOnBucketItem, catalogItem));
        },
        [dispatch],
    );

    const onItemSwapped = useCallback(
        (localIdentifier: string, from: IRawBucketItem, to: IRawBucketItem) => {
            dispatch(swapBucketItem(localIdentifier, from, to));
        },
        [dispatch],
    );

    const onCatalogItemEnteredSwapDropZone = useCallback(
        (replacedItem: IRawBucketItem) => {
            dispatch(highlightItemsToBeRemovedBySwap(replacedItem));
        },
        [dispatch],
    );

    const onCatalogItemLeftSwapDropZone = useCallback(() => {
        dispatch(resetHighlightedItemsToBeRemoved());
    }, [dispatch]);

    const onStartBucketItemDrag = useCallback(
        (item: IRawBucketItem) => {
            dispatch(startDragBucketItem(item));
        },
        [dispatch],
    );

    const onEndBucketItemDrag = useCallback(() => {
        dispatch(endDragBucketItem());
    }, [dispatch]);

    const [{ canDrop, isOver, itemType: monitorItemType }, dropRef] = useDrop(
        () => ({
            accept: [CATALOG_LIST_ITEM, BUCKET_ITEM],
            drop: (_item: unknown, monitor) => {
                dropConfig.drop({ onCatalogItemDropped, onItemSwapped, bucketItem }, monitor);
            },
            canDrop: (_item, monitor) =>
                dropConfig.canDrop(
                    { itemIsAllowedToDrop: restProps.itemIsAllowedToDrop, bucketItem },
                    monitor,
                ),
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver(),
                itemType: monitor.getItemType(),
            }),
        }),
        [onCatalogItemDropped, onItemSwapped, bucketItem, restProps.itemIsAllowedToDrop],
    );

    const effectiveCanDrop = canDropProp ?? canDrop;
    const effectiveIsOver = isOverProp ?? isOver;
    const effectiveItemType = itemType ?? monitorItemType;
    const prevIsOverRef = useRef(effectiveIsOver);

    useEffect(() => {
        const prevIsOver = prevIsOverRef.current;

        if (prevIsOver !== effectiveIsOver && effectiveCanDrop && effectiveItemType === CATALOG_LIST_ITEM) {
            if (effectiveIsOver) {
                onCatalogItemEnteredSwapDropZone(bucketItem.original);
            } else {
                onCatalogItemLeftSwapDropZone();
            }
        }

        prevIsOverRef.current = effectiveIsOver;
    }, [
        effectiveIsOver,
        effectiveCanDrop,
        effectiveItemType,
        bucketItem,
        onCatalogItemEnteredSwapDropZone,
        onCatalogItemLeftSwapDropZone,
    ]);

    const classes = classNames({
        "adi-replace-invitation": effectiveCanDrop,
        "adi-droppable-active": effectiveCanDrop,
        "adi-droppable-hover": effectiveIsOver && effectiveCanDrop,
    });

    return (
        <div ref={dropRef as unknown as Ref<HTMLDivElement>}>
            <DraggableBucketItem
                {...{
                    ...restProps,
                    onCatalogItemDropped,
                    onItemSwapped,
                    canDrop: effectiveCanDrop,
                    isOver: effectiveIsOver,
                    dragHandle,
                    isDragging,
                    itemType: effectiveItemType,
                    onCatalogItemEnteredSwapDropZone,
                    onCatalogItemLeftSwapDropZone,
                    onStartBucketItemDrag,
                    onEndBucketItemDrag,
                    bucketItem,
                }}
                className={classes}
            />
        </div>
    );
}

export const dropConfig = {
    drop(
        {
            onCatalogItemDropped,
            onItemSwapped,
            bucketItem,
        }: IBucketItemDropHandlers & Pick<IBucketItemProps, "bucketItem">,
        monitor: DropTargetMonitor,
    ) {
        switch (monitor.getItemType()) {
            case BUCKET_ITEM: {
                const from = (monitor.getItem() as IDraggableBucketItem).bucketItem;
                const to = bucketItem.original;
                onItemSwapped(null, from, to);
                break;
            }
            case CATALOG_LIST_ITEM: {
                const originalBucketItem = bucketItem.original;

                const catalogItem = (monitor.getItem() as IDraggableBucketItem).item;
                onCatalogItemDropped(originalBucketItem, catalogItem);
                break;
            }
            default:
                break;
        }
    },

    canDrop(props: Pick<IBucketItemProps, "itemIsAllowedToDrop" | "bucketItem">, monitor: DropTargetMonitor) {
        const { itemIsAllowedToDrop, bucketItem } = props;

        const draggedItem = (monitor.getItem() as IDraggableBucketItem) ?? {};
        return itemIsAllowedToDrop({
            ...draggedItem,
            destBucketItem: bucketItem.original,
        });
    },
};
