// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { moveAttributeFilter, useDashboardDispatch } from "../../../model";
import { getDropZoneDebugStyle } from "../debug";
import { isAttributeFilterDraggableItem, isAttributeFilterPlaceholderDraggableItem } from "../types";
import { useDashboardDrop } from "../useDashboardDrop";

export type AttributeFilterDropZonePlacement = "inside" | "outside";
export type AttributeFilterDropZoneHintPosition = "next" | "prev";

function getIgnoreIndexes(
    placement: AttributeFilterDropZonePlacement,
    position: AttributeFilterDropZoneHintPosition,
    targetIndex: number,
) {
    if (placement === "outside") {
        return [targetIndex];
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
                if (isAttributeFilterDraggableItem(item)) {
                    const identifier = item.filter.attributeFilter.localIdentifier!;
                    dispatch(moveAttributeFilter(identifier, targetIndex));
                }

                if (isAttributeFilterPlaceholderDraggableItem(item) && onAddAttributePlaceholder) {
                    const index =
                        placement === "inside" && hintPosition === "next" ? targetIndex + 1 : targetIndex;
                    return onAddAttributePlaceholder(index);
                }
            },
        },
        [inactiveIndexes, targetIndex],
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
            {isActive && <div className="drop-hint" />}
        </div>
    );
}
