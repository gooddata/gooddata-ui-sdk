// (C) 2022-2023 GoodData Corporation

import { ConnectDragSource, DragSourceMonitor, useDrag } from "react-dnd";
import { useCallback, useEffect, useRef } from "react";
import { DraggableItem } from "./types.js";

import { getEmptyImage } from "react-dnd-html5-backend";
import isFunction from "lodash/isFunction.js";
import { useBeforeDrag } from "./useBeforeDrag.js";

type CollectedProps<TItem> = {
    isDragging: boolean;
    item: TItem;
};

function basicDragCollect<TItem>(monitor: DragSourceMonitor<TItem, void>): CollectedProps<TItem> {
    return {
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
    };
}

export function useDashboardDrag<DragObject extends DraggableItem>(
    {
        dragItem,
        canDrag = true,
        hideDefaultPreview = true,
        dragEnd,
        dragStart,
    }: {
        dragItem: DragObject | (() => DragObject);
        canDrag?: boolean | ((monitor: DragSourceMonitor<DragObject, void>) => boolean);
        hideDefaultPreview?: boolean;
        dragEnd?: (item: DragObject, monitor: DragSourceMonitor<DragObject, void>) => void;
        dragStart?: (item: DragObject) => void;
    },
    deps: unknown[] = [],
) {
    const [collectedProps, dragRef, dragPreviewRef] = useDrag<
        DragObject,
        void,
        CollectedProps<DragObject | undefined>
    >(
        () => {
            const item = isFunction(dragItem) ? dragItem() : dragItem;
            return {
                type: item.type,
                item: dragItem,
                collect: basicDragCollect,
                canDrag,
                end: dragEnd,
            };
        },

        deps,
    );

    const beforeDrag = useBeforeDrag();

    const onInternalDragStart = useCallback(
        (item: DragObject) => {
            beforeDrag();

            if (dragStart) {
                dragStart(item);
            }
        },
        [dragStart, beforeDrag],
    );

    const hasHandledStart = useRef(false);
    useEffect(() => {
        if (collectedProps.isDragging) {
            if (!hasHandledStart.current) {
                const item = isFunction(dragItem) ? dragItem() : dragItem;
                hasHandledStart.current = true;
                onInternalDragStart(item);
            }
        } else {
            hasHandledStart.current = false;
        }
    }, [collectedProps.isDragging, onInternalDragStart, dragItem]);

    useEffect(() => {
        if (hideDefaultPreview) {
            // this is the way how to hide native drag preview, custom preview is rendered by DragLayer
            dragPreviewRef(getEmptyImage(), { captureDraggingState: false });
        }
    }, [dragPreviewRef, hideDefaultPreview]);

    return [collectedProps, dragRef] as [CollectedProps<DragObject>, ConnectDragSource];
}
