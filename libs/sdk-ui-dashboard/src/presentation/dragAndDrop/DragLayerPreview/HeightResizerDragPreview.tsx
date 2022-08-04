// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useState } from "react";

import { HeightResizer } from "../Resize/HeightResizer";
import { DragPreviewProps, ReachedHeightResizingLimit } from "./types";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { HeightResizerDragItem } from "../types";
import { useResizeHandlers } from "../LayoutResizeContext";
import { getLimitedSize } from "./sizeLimiting";

export type HeightResizerDragPreviewProps = DragPreviewProps<HeightResizerDragItem>;

export const HeightResizerDragPreview = (props: HeightResizerDragPreviewProps) => {
    const { item, initialOffset, differenceFromInitialOffset, documentDimensions } = props;
    const [hasReachedLimit, setReachedLimit] = useState<ReachedHeightResizingLimit>("none");

    const { toggleHeightLimitReached } = useResizeHandlers();
    useEffect(() => {
        toggleHeightLimitReached(hasReachedLimit);
    }, [hasReachedLimit, toggleHeightLimitReached]);

    const currentOffsetY = differenceFromInitialOffset.y;
    const currentUnlimitedHeightGR = getNewHeightGR(
        item.widgetHeights,
        currentOffsetY,
        documentDimensions.scrollTop,
        item.initialScrollTop,
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

    const top = getLimitedYCoord(item, initialOffset.y, currentOffsetY, documentDimensions.scrollTop);
    const style = {
        top: `${top + 4}px`,
        left: `${initialOffset.x}px`,
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

function hasHeightReachedLimit(heightGR: number, min: number, max: number): ReachedHeightResizingLimit {
    if (heightGR < min) return "min";
    if (heightGR > max) return "max";
    return "none";
}

function getNewHeightGR(
    widgetHeights: number[],
    offsetYPX: number,
    currentScrollTop: number,
    initialScrollTop: number,
): number {
    const primaryHeightGR = getPrimaryHeightGR(widgetHeights);
    const totalDelta = offsetYPX + (currentScrollTop - initialScrollTop);
    const deltaHeightGR = fluidLayoutDescriptor.toGridHeight(totalDelta);
    return primaryHeightGR + deltaHeightGR;
}

export function getLimitedYCoord(
    item: HeightResizerDragItem,
    initialSourceClientOffsetY: number,
    differenceFromInitialOffsetY: number,
    currentScrollTop: number,
): number {
    const { minLimit, maxLimit, initialScrollTop } = item;

    const absoluteY = initialSourceClientOffsetY + initialScrollTop;
    const deltaSize = fluidLayoutDescriptor.toGridHeight(
        differenceFromInitialOffsetY + (currentScrollTop - initialScrollTop),
    );
    const curPrimaryHeightGR = getPrimaryHeightGR(item.widgetHeights);
    const newSizeLimited = getLimitedSize(minLimit, maxLimit, curPrimaryHeightGR, deltaSize);
    const deltaY = fluidLayoutDescriptor.toHeightInPx(newSizeLimited - curPrimaryHeightGR);

    return absoluteY + deltaY;
}
