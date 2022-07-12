// (C) 2022 GoodData Corporation

import { ConnectDragSource, DragSourceMonitor, useDrag } from "react-dnd";
import { useEffect } from "react";
import { DraggableItemType, DraggableItem } from "./types";

import { getEmptyImage } from "react-dnd-html5-backend";
import isFunction from "lodash/isFunction";

type CollectedProps = {
    isDragging: boolean;
};

const basicDragCollect = (monitor: DragSourceMonitor<DraggableItemType, void>): CollectedProps => ({
    isDragging: monitor.isDragging(),
});

export function useDashboardDrag<DragObject extends DraggableItem>(
    {
        dragItem,
        canDrag = true,
        hideDefaultPreview = true,
        dragEnd,
    }: {
        dragItem: DragObject | (() => DragObject);
        canDrag?: boolean | ((monitor: DragSourceMonitor<DragObject, void>) => boolean);
        hideDefaultPreview?: boolean;
        dragEnd?: (item: DragObject, monitor: DragSourceMonitor<DragObject, void>) => void;
    },
    deps: unknown[] = [],
) {
    const [collectedProps, dragRef, dragPreviewRef] = useDrag<DragObject, void, CollectedProps>(
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

    useEffect(() => {
        if (hideDefaultPreview) {
            // this is the way how to hide native drag preview, custom preview is rendered by DragLayer
            dragPreviewRef(getEmptyImage(), { captureDraggingState: false });
        }
    }, [dragPreviewRef, hideDefaultPreview]);

    return [collectedProps, dragRef] as [CollectedProps, ConnectDragSource];
}
