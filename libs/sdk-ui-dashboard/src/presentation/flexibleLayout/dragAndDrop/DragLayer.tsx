// (C) 2022-2026 GoodData Corporation

import { type CSSProperties, useCallback, useEffect, useMemo, useRef } from "react";

import { useDragLayer } from "@evil-internetmann/react-dnd";

import { ContentDragPreview } from "./DragLayerPreview/ContentDragPreview.js";
import { HeightResizerDragPreview } from "./DragLayerPreview/HeightResizerDragPreview.js";
import { WidthResizerDragPreview } from "./DragLayerPreview/WidthResizerDragPreview.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../constants/index.js";
import { emptyDOMRect } from "../../constants.js";
import {
    type DraggableInternalItemType,
    type DraggableItemType,
    isDraggableInternalItemType,
    useResizeHandlers,
} from "../../dragAndDrop/index.js";
import { useScrollCorrection } from "../../dragAndDrop/Resize/useScrollCorrection.js";

const previewComponentsMap: Record<DraggableInternalItemType, any> = {
    "internal-height-resizer": HeightResizerDragPreview,
    "internal-width-resizer": WidthResizerDragPreview,
};

export function DragLayerComponent() {
    const dragLayerRef = useRef<HTMLDivElement>(null);
    const { setScrollCorrection } = useResizeHandlers();

    const dragLayerProperties = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType() as DraggableItemType,
        clientOffset: monitor.getClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
    }));

    const { itemType, isDragging } = dragLayerProperties;

    const getDragLayerPosition = useCallback(() => {
        return dragLayerRef.current?.getBoundingClientRect() ?? emptyDOMRect;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragLayerRef.current]);

    const isResizing = itemType === "internal-height-resizer" || itemType === "internal-width-resizer";
    const { scrollCorrection } = useScrollCorrection(getDragLayerPosition, isDragging && isResizing);

    useEffect(() => {
        setScrollCorrection(scrollCorrection);
    }, [scrollCorrection, setScrollCorrection]);

    const layerStyles: CSSProperties = useMemo(() => {
        const position = isResizing ? "relative" : "fixed";

        return {
            position,
            pointerEvents: "none",
            zIndex: DASHBOARD_HEADER_OVERLAYS_Z_INDEX + 1,
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
        };
    }, [isResizing]);

    if (!isDragging) {
        return null;
    }

    const Component = isDraggableInternalItemType(itemType)
        ? previewComponentsMap[itemType]
        : ContentDragPreview;

    const previewProps = isDraggableInternalItemType(itemType)
        ? { ...dragLayerProperties, getDragLayerPosition, scrollCorrection }
        : dragLayerProperties;

    return (
        <div className="drag-layer" style={layerStyles} ref={dragLayerRef}>
            <Component {...previewProps} />
        </div>
    );
}
