// (C) 2019-2025 GoodData Corporation
import React, { useEffect } from "react";
import { XYCoord } from "react-dnd";
import cx from "classnames";

import { WidthResizer } from "../Resize/WidthResizer.js";
import { WidthResizerDragItem } from "../../../dragAndDrop/types.js";

import { applySizeLimitation } from "./sizeLimiting.js";
import { DragResizeProps } from "../../../dragAndDrop/DragLayerPreview/types.js";
import { useResizeHandlers } from "../../../dragAndDrop/index.js";

export type WidthResizerDragPreviewProps = DragResizeProps<WidthResizerDragItem>;

export function WidthResizerDragPreview(props: WidthResizerDragPreviewProps) {
    const { setWidthState } = useResizeHandlers();

    const { item, differenceFromInitialOffset, initialOffset, scrollCorrection, getDragLayerPosition } =
        props;
    const { gridColumnHeightInPx, rowIndex } = item;

    const sizeAndCoords = getSizeAndXCoords(
        item,
        initialOffset.x,
        differenceFromInitialOffset.x,
        scrollCorrection.x,
    );

    const style = getWidthResizerStyle({
        gridColumnHeightInPx,
        initialOffset,
        limitedX: sizeAndCoords.limitedX,
        dragLayerOffset: getDragLayerPosition(),
        scrollCorrection,
    });

    useEffect(() => {
        setWidthState({
            initialIndex: sizeAndCoords.initialIndex,
            currentIndex: sizeAndCoords.currentIndex,
            limitReached: sizeAndCoords.limitReached,
        });
    }, [
        sizeAndCoords.initialIndex,
        sizeAndCoords.currentIndex,
        sizeAndCoords.isLimited,
        sizeAndCoords.limitReached,
        setWidthState,
    ]);

    return (
        <div
            className={cx(
                "s-resizer-drag-preview",
                "resizer-drag-preview",
                "gd-grid-layout-resizer-drag-preview",
                "gd-grid-layout-width-resizer-drag-preview",
                {
                    "gd-first-container-row-widget": rowIndex === 0,
                },
            )}
            style={style}
        >
            <WidthResizer status="active" />
        </div>
    );
}

export function getSizeAndXCoords(
    item: WidthResizerDragItem,
    initialSourceClientOffsetX: number,
    differenceFromInitialOffsetX: number,
    scrollCorrectionX: number,
) {
    const { minLimit, maxLimit, currentWidth, initialLayoutDimensions, gridColumnWidth } = item;

    const deltaSize = getDiffInGridColumns(differenceFromInitialOffsetX - scrollCorrectionX, gridColumnWidth);
    const sizeLimitation = applySizeLimitation(minLimit, maxLimit, currentWidth, deltaSize);
    const deltaSizeLimited = sizeLimitation.limitedSize - currentWidth;
    const deltaXLimited = deltaSizeLimited * gridColumnWidth;
    const deltaXUnlimited = deltaSize * gridColumnWidth;

    const initialIndex = Math.round(
        (initialSourceClientOffsetX - initialLayoutDimensions.left) / gridColumnWidth,
    );
    const currentIndex = initialIndex + deltaSizeLimited;

    return {
        ...sizeLimitation,
        limitedX: initialSourceClientOffsetX + deltaXLimited,
        unlimitedX: initialSourceClientOffsetX + deltaXUnlimited,
        initialIndex,
        currentIndex,
    };
}

export function getDiffInGridColumns(pxDiffX: number, gridColumnWidth: number): number {
    return Math.round(pxDiffX / gridColumnWidth);
}

function getWidthResizerStyle({
    initialOffset,
    limitedX,
    gridColumnHeightInPx,
    dragLayerOffset,
    scrollCorrection,
}: {
    initialOffset: XYCoord;
    limitedX: number;
    gridColumnHeightInPx: number;
    dragLayerOffset: XYCoord;
    scrollCorrection: XYCoord;
}): React.CSSProperties {
    return {
        position: "absolute",
        top: `${initialOffset.y - dragLayerOffset.y + scrollCorrection.y}px`,
        left: `${limitedX - dragLayerOffset.x + scrollCorrection.x}px`,
        height: `${gridColumnHeightInPx}px`,
    };
}
