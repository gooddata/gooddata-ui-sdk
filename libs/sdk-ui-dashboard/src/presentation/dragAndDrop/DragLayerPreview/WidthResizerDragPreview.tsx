// (C) 2019-2022 GoodData Corporation
import React, { useEffect } from "react";
import { XYCoord } from "react-dnd";
import { WidthResizer } from "../Resize/WidthResizer";
import { DragPreviewProps } from "./types";
import { WidthResizerDragItem } from "../types";
import { applySizeLimitation } from "./sizeLimiting";
import { useResizeHandlers } from "../LayoutResizeContext";

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

export type WidthResizerDragPreviewProps = DragPreviewProps<WidthResizerDragItem>;

export function WidthResizerDragPreview(props: WidthResizerDragPreviewProps) {
    const { setWidthState } = useResizeHandlers();

    const { item, differenceFromInitialOffset, initialOffset } = props;
    const { gridColumnHeightInPx } = item;
    const scrollLeft = document.documentElement.scrollLeft;

    const sizeAndCoords = getSizeAndXCoords(item, initialOffset.x, differenceFromInitialOffset.x, scrollLeft);

    const style = getWidthResizerStyle({
        gridColumnHeightInPx,
        initialOffset,
        limitedX: sizeAndCoords.limitedX,
    });

    useEffect(() => {
        setWidthState({
            initialIndex: sizeAndCoords.initialIndex,
            currentIndex: sizeAndCoords.currentIndex,
            limitReached: sizeAndCoords.isLimited,
        });
    }, [sizeAndCoords.initialIndex, sizeAndCoords.currentIndex, sizeAndCoords.isLimited, setWidthState]);

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
    documentScrollLeft: number,
) {
    const { minLimit, maxLimit, currentWidth, initialLayoutDimensions, gridColumnWidth } = item;

    const absoluteX = initialSourceClientOffsetX + documentScrollLeft;
    const deltaSize = getDiffInGridColumns(differenceFromInitialOffsetX, gridColumnWidth);
    const sizeLimitation = applySizeLimitation(minLimit, maxLimit, currentWidth, deltaSize);
    const deltaSizeLimited = sizeLimitation.limitedSize - currentWidth;
    const deltaXLimited = deltaSizeLimited * gridColumnWidth;
    const deltaXUnlimited = deltaSize * gridColumnWidth;

    const initialIndex = Math.round((absoluteX - initialLayoutDimensions.left) / gridColumnWidth);
    const currentIndex = initialIndex + deltaSizeLimited;

    return {
        ...sizeLimitation,
        limitedX: absoluteX + deltaXLimited,
        unlimitedX: absoluteX + deltaXUnlimited,
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
}: {
    initialOffset: XYCoord;
    limitedX: number;
    gridColumnHeightInPx: number;
}): React.CSSProperties {
    return {
        position: "absolute",
        top: `${initialOffset.y}px`,
        left: `${limitedX}px`,
        height: `${gridColumnHeightInPx}px`,
    };
}
