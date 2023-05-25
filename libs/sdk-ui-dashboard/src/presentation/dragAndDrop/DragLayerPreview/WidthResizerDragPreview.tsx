// (C) 2019-2022 GoodData Corporation
import React, { useEffect } from "react";
import { XYCoord } from "react-dnd";
import { WidthResizer } from "../Resize/WidthResizer.js";
import { DragResizeProps } from "./types.js";
import { WidthResizerDragItem } from "../types.js";
import { applySizeLimitation } from "./sizeLimiting.js";
import { useResizeHandlers } from "../LayoutResizeContext.js";

interface IWidthResizerDragPreviewOwnProps {
    item: WidthResizerDragItem;
    differenceFromInitialOffset: XYCoord;
    initialSourceClientOffset: XYCoord;
}

export interface IWidthResizerDragPreviewDispatchProps {
    toggleMinLimitReached: (value: boolean) => void;
    positionIndexChanged: (initialIndex: number, currentIndex: number) => void;
}

export type IWidthResizerDragPreviewProps = IWidthResizerDragPreviewDispatchProps &
    IWidthResizerDragPreviewOwnProps;

export type WidthResizerDragPreviewProps = DragResizeProps<WidthResizerDragItem>;

export function WidthResizerDragPreview(props: WidthResizerDragPreviewProps) {
    const { setWidthState } = useResizeHandlers();

    const { item, differenceFromInitialOffset, initialOffset, scrollCorrection, getDragLayerPosition } =
        props;
    const { gridColumnHeightInPx } = item;
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
        <div className="s-resizer-drag-preview resizer-drag-preview" style={style}>
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
