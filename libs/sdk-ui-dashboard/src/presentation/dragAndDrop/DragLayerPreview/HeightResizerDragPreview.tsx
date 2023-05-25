// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useState } from "react";

import { HeightResizer } from "../Resize/HeightResizer.js";
import { DragResizeProps, ReachedResizingLimit } from "./types.js";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { HeightResizerDragItem } from "../types.js";
import { useResizeHandlers } from "../LayoutResizeContext.js";
import { getLimitedSize } from "./sizeLimiting.js";

export type HeightResizerDragPreviewProps = DragResizeProps<HeightResizerDragItem>;

export const HeightResizerDragPreview = (props: HeightResizerDragPreviewProps) => {
    const { item, initialOffset, differenceFromInitialOffset, scrollCorrection, getDragLayerPosition } =
        props;

    const { toggleHeightLimitReached } = useResizeHandlers();
    const [hasReachedLimit, setReachedLimit] = useState<ReachedResizingLimit>("none");
    useEffect(() => {
        toggleHeightLimitReached(hasReachedLimit);
    }, [hasReachedLimit, toggleHeightLimitReached]);

    const dragLayerOffset = getDragLayerPosition();
    const currentUnlimitedHeightGR = getNewHeightGR(
        item.widgetHeights,
        differenceFromInitialOffset.y,
        scrollCorrection.y,
    );

    useEffect(() => {
        const hasNowReachedLimit = hasHeightReachedLimit(
            currentUnlimitedHeightGR,
            item.minLimit,
            item.maxLimit,
        );

        if (hasNowReachedLimit !== hasReachedLimit) {
            setReachedLimit(hasNowReachedLimit);
        }
    }, [currentUnlimitedHeightGR, item.minLimit, item.maxLimit, hasReachedLimit]);

    const top = getLimitedYCoord(item, initialOffset.y, differenceFromInitialOffset.y, scrollCorrection.y);
    const style = {
        top: `${top - dragLayerOffset.y + scrollCorrection.y}px`,
        left: `${initialOffset.x - dragLayerOffset.x + scrollCorrection.x}px`,
        right: `30px`,
    };

    return (
        <div className="height-resizer-drag-preview s-height-resizer-drag-preview" style={style}>
            <HeightResizer status={"active"} />
        </div>
    );
};

function getPrimaryHeightGR(heightsGR: number[]): number {
    heightsGR = heightsGR || [10];
    return Math.max(...heightsGR);
}

function hasHeightReachedLimit(heightGR: number, min: number, max: number): ReachedResizingLimit {
    if (heightGR < min) return "min";
    if (heightGR > max) return "max";
    return "none";
}

function getNewHeightGR(widgetHeights: number[], offsetYPX: number, scrollingCorrectionY: number): number {
    const primaryHeightGR = getPrimaryHeightGR(widgetHeights);
    const totalDelta = offsetYPX - scrollingCorrectionY;
    const deltaHeightGR = fluidLayoutDescriptor.toGridHeight(totalDelta);
    return primaryHeightGR + deltaHeightGR;
}

export function getLimitedYCoord(
    item: HeightResizerDragItem,
    initialSourceClientOffsetY: number,
    differenceFromInitialOffsetY: number,
    scrollingCorrectionY: number,
): number {
    const { minLimit, maxLimit } = item;

    const deltaSize = fluidLayoutDescriptor.toGridHeight(differenceFromInitialOffsetY - scrollingCorrectionY);
    const curPrimaryHeightGR = getPrimaryHeightGR(item.widgetHeights);
    const newSizeLimited = getLimitedSize(minLimit, maxLimit, curPrimaryHeightGR, deltaSize);
    const deltaY = fluidLayoutDescriptor.toHeightInPx(newSizeLimited - curPrimaryHeightGR);

    return initialSourceClientOffsetY + deltaY;
}
