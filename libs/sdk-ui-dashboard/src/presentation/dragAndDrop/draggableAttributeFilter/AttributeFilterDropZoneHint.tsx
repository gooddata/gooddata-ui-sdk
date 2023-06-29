// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { moveAttributeFilter, useDashboardDispatch } from "../../../model/index.js";
import { getDropZoneDebugStyle } from "../debug.js";
import { isAttributeFilterDraggableItem, isAttributeFilterPlaceholderDraggableItem } from "../types.js";
import { useDashboardDrop } from "../useDashboardDrop.js";

export type AttributeFilterDropZonePlacement = "inside" | "outside";
export type AttributeFilterDropZoneHintPosition = "next" | "prev";

function getIgnoreIndexes(
    placement: AttributeFilterDropZonePlacement,
    position: AttributeFilterDropZoneHintPosition,
    targetIndex: number,
) {
    if (placement === "outside") {
        return position === "next" ? [targetIndex] : [targetIndex - 1];
    }

    if (position === "next") {
        return [targetIndex, targetIndex + 1];
    }

    return [targetIndex, targetIndex - 1];
}

export type AttributeFilterDropZoneHintProps = {
    placement?: AttributeFilterDropZonePlacement;
    hintPosition: AttributeFilterDropZoneHintPosition;
    targetIndex: number;
    acceptPlaceholder?: boolean;
    onAddAttributePlaceholder?: (index: number) => void;
};

export function AttributeFilterDropZoneHint({
    placement = "inside",
    hintPosition,
    targetIndex,
    acceptPlaceholder = true,
    onAddAttributePlaceholder,
}: AttributeFilterDropZoneHintProps) {
    const dispatch = useDashboardDispatch();
    const inactiveIndexes = getIgnoreIndexes(placement, hintPosition, targetIndex);

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        acceptPlaceholder ? ["attributeFilter", "attributeFilter-placeholder"] : "attributeFilter",
        {
            canDrop: (item) => {
                if (isAttributeFilterDraggableItem(item)) {
                    return !inactiveIndexes.includes(item.filterIndex);
                }

                return isAttributeFilterPlaceholderDraggableItem(item);
            },
            drop: (item) => {
                const targetIndexPositionCorrection =
                    placement === "inside" && hintPosition === "next" ? 1 : 0;

                if (isAttributeFilterDraggableItem(item)) {
                    const identifier = item.filter.attributeFilter.localIdentifier!;
                    const originalIndex = item.filterIndex;
                    const originalPositionCorrection = originalIndex < targetIndex ? -1 : 0;
                    const index = targetIndex + targetIndexPositionCorrection + originalPositionCorrection;
                    dispatch(moveAttributeFilter(identifier, index));
                }

                if (isAttributeFilterPlaceholderDraggableItem(item) && onAddAttributePlaceholder) {
                    const index = targetIndex + targetIndexPositionCorrection;
                    return onAddAttributePlaceholder(index);
                }
            },
        },
        [inactiveIndexes, targetIndex, placement, hintPosition],
    );

    const isActive = canDrop && isOver;
    const isHidden = !canDrop;

    const className = cx("attr-filter-dropzone", hintPosition, {
        outside: placement === "outside",
        hidden: isHidden,
    });

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div className={className} style={debugStyle} ref={dropRef}>
            {isActive ? <div className="drop-hint" /> : null}
        </div>
    );
}
