// (C) 2022 GoodData Corporation
import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef } from "react";
import { useDragLayer } from "react-dnd";
import { ContentDragPreview } from "./DragLayerPreview/ContentDragPreview";
import { HeightResizerDragPreview } from "./DragLayerPreview/HeightResizerDragPreview";
import { WidthResizerDragPreview } from "./DragLayerPreview/WidthResizerDragPreview";
import { useScrollCorrection } from "./Resize/useScrollCorrection";
import { DraggableInternalItemType, DraggableItemType, isDraggableInternalItemType } from "./types";
import { emptyDOMRect } from "../layout/constants";
import { useResizeHandlers } from "./LayoutResizeContext";

const previewComponentsMap: Record<DraggableInternalItemType, any> = {
    "internal-height-resizer": HeightResizerDragPreview,
    "internal-width-resizer": WidthResizerDragPreview,
};

export const DragLayerComponent: FC = () => {
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
        return dragLayerRef.current?.getBoundingClientRect() ?? (emptyDOMRect as DOMRect);
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
            zIndex: 5001,
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
};
