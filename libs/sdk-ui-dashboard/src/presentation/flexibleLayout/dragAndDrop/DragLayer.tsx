// (C) 2022-2026 GoodData Corporation

import { type CSSProperties, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDragLayer } from "@evil-internetmann/react-dnd";
import { createPortal } from "react-dom";

import { emptyDOMRect } from "../../constants.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../constants/zIndex.js";
import { useResizeHandlers } from "../../dragAndDrop/LayoutResizeContext.js";
import { useScrollCorrection } from "../../dragAndDrop/Resize/useScrollCorrection.js";
import {
    type DraggableInternalItemType,
    type DraggableItemType,
    isDraggableInternalItemType,
} from "../../dragAndDrop/types.js";

import { ContentDragPreview } from "./DragLayerPreview/ContentDragPreview.js";
import { HeightResizerDragPreview } from "./DragLayerPreview/HeightResizerDragPreview.js";
import { WidthResizerDragPreview } from "./DragLayerPreview/WidthResizerDragPreview.js";

const previewComponentsMap: Record<DraggableInternalItemType, any> = {
    "internal-height-resizer": HeightResizerDragPreview,
    "internal-width-resizer": WidthResizerDragPreview,
};

export function DragLayerComponent({
    contentRef,
    resizeLayer,
    enableCanvasScroll = false,
}: {
    contentRef: RefObject<HTMLDivElement | null>;
    /**
     * Element outside the horizontally scrolled canvas that hosts resize previews. It is passed as state
     * (not as a ref read during render) so the portal target is stable for the whole drag.
     */
    resizeLayer: HTMLElement | null;
    enableCanvasScroll?: boolean;
}) {
    const dragLayerRef = useRef<HTMLDivElement>(null);
    const [isDragLayerMounted, setIsDragLayerMounted] = useState(false);
    const setDragLayerRef = useCallback((element: HTMLDivElement | null) => {
        dragLayerRef.current = element;
        setIsDragLayerMounted(element !== null);
    }, []);
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
    }, []);

    const getContentPosition = useCallback(() => {
        return contentRef.current?.getBoundingClientRect() ?? emptyDOMRect;
    }, [contentRef]);

    const isResizing = itemType === "internal-height-resizer" || itemType === "internal-width-resizer";
    const { scrollCorrection } = useScrollCorrection(
        enableCanvasScroll ? getContentPosition : getDragLayerPosition,
        isDragging && isResizing && (enableCanvasScroll || isDragLayerMounted),
    );

    useEffect(() => {
        setScrollCorrection(scrollCorrection);
    }, [scrollCorrection, setScrollCorrection]);

    const isPortaled = enableCanvasScroll && isResizing && resizeLayer !== null;

    const layerStyles: CSSProperties = useMemo(() => {
        // Without the resize layer, resize previews keep the original in-place relative positioning.
        const position = isPortaled ? "absolute" : isResizing ? "relative" : "fixed";

        return {
            position,
            pointerEvents: "none",
            // Above the resizable sidebar, which sits one level over the header (see sidebar.scss).
            zIndex: DASHBOARD_HEADER_OVERLAYS_Z_INDEX + 2,
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
        };
    }, [isPortaled, isResizing]);

    if (!isDragging) {
        return null;
    }

    const Component = isDraggableInternalItemType(itemType)
        ? previewComponentsMap[itemType]
        : ContentDragPreview;

    const previewProps = isDraggableInternalItemType(itemType)
        ? { ...dragLayerProperties, getDragLayerPosition, scrollCorrection }
        : dragLayerProperties;

    const layer = (
        <div className="drag-layer" style={layerStyles} ref={setDragLayerRef}>
            <Component {...previewProps} />
        </div>
    );

    // Clip resize previews horizontally without limiting vertical resizing beyond the current canvas height.
    return isPortaled ? createPortal(layer, resizeLayer) : layer;
}
