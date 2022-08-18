// (C) 2022 GoodData Corporation

import { ConnectDragSource, DragSourceMonitor, useDrag } from "react-dnd";
import { useEffect, useRef } from "react";
import { DraggableItem } from "./types";

import { getEmptyImage } from "react-dnd-html5-backend";
import isFunction from "lodash/isFunction";

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
    const [collectedProps, dragRef, dragPreviewRef] = useDrag<DragObject, void, CollectedProps<DragObject>>(
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

    const hasHandledStart = useRef(false);
    useEffect(() => {
        if (collectedProps.isDragging) {
            if (!hasHandledStart.current && dragStart) {
                const item = isFunction(dragItem) ? dragItem() : dragItem;
                hasHandledStart.current = true;
                dragStart(item);
            }
        } else {
            hasHandledStart.current = false;
        }
    }, [collectedProps.isDragging]);

    useEffect(() => {
        if (hideDefaultPreview) {
            // this is the way how to hide native drag preview, custom preview is rendered by DragLayer
            dragPreviewRef(getEmptyImage(), { captureDraggingState: false });
        }
    }, [dragPreviewRef, hideDefaultPreview]);

    return [collectedProps, dragRef] as [CollectedProps<DragObject>, ConnectDragSource];
}
