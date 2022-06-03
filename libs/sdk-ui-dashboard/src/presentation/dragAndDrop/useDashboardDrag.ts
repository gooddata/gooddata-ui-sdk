// (C) 2022 GoodData Corporation

import { ConnectDragSource, DragSourceMonitor, useDrag } from "react-dnd";
import { useEffect } from "react";
import { DraggableItemType, DraggableItem } from "./types";

import { getEmptyImage } from "react-dnd-html5-backend";

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
    }: {
        dragItem: DragObject;
        canDrag?: boolean | ((monitor: DragSourceMonitor<DragObject, void>) => boolean);
        hideDefaultPreview?: boolean;
    },
    deps: unknown[] = [],
) {
    const [collectedProps, dragRef, dragPreviewRef] = useDrag<DragObject, void, CollectedProps>(
        {
            type: dragItem.type,
            item: dragItem,
            collect: basicDragCollect,
            canDrag,
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
