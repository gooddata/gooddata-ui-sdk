// (C) 2022-2026 GoodData Corporation

import { type Ref } from "react";

import cx from "classnames";

import {
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
} from "@gooddata/sdk-model";

import {
    moveAttributeFilter,
    moveDateFilter,
    moveMeasureValueFilter,
} from "../../../model/commands/filters.js";
import { useDashboardDispatch } from "../../../model/react/DashboardStoreProvider.js";
import { getDropZoneDebugStyle } from "../debug.js";
import {
    isAttributeFilterDraggableItem,
    isAttributeFilterPlaceholderDraggableItem,
    isDateFilterDraggableItem,
    isMeasureValueFilterDraggableItem,
} from "../types.js";
import { useDashboardDrop } from "../useDashboardDrop.js";

export type DraggableFilterDropZonePlacement = "inside" | "outside";
export type DraggableFilterDropZoneHintPosition = "next" | "prev";

function getIgnoreIndexes(
    placement: DraggableFilterDropZonePlacement,
    position: DraggableFilterDropZoneHintPosition,
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

export type DraggableFilterDropZoneHintProps = {
    placement?: DraggableFilterDropZonePlacement;
    hintPosition: DraggableFilterDropZoneHintPosition;
    targetIndex: number;
    acceptPlaceholder?: boolean;
    onAddAttributePlaceholder?: (index: number) => void;
};

export function DraggableFilterDropZoneHint({
    placement = "inside",
    hintPosition,
    targetIndex,
    acceptPlaceholder = true,
    onAddAttributePlaceholder,
}: DraggableFilterDropZoneHintProps) {
    const dispatch = useDashboardDispatch();
    const inactiveIndexes = getIgnoreIndexes(placement, hintPosition, targetIndex);

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        acceptPlaceholder
            ? ["attributeFilter", "dateFilter", "attributeFilter-placeholder", "measureValueFilter"]
            : "attributeFilter",
        {
            canDrop: (item) => {
                if (
                    isAttributeFilterDraggableItem(item) ||
                    isDateFilterDraggableItem(item) ||
                    isMeasureValueFilterDraggableItem(item)
                ) {
                    return !inactiveIndexes.includes(item.filterIndex);
                }

                return isAttributeFilterPlaceholderDraggableItem(item);
            },
            drop: (item) => {
                const targetIndexPositionCorrection =
                    placement === "inside" && hintPosition === "next" ? 1 : 0;
                const getMoveIndex = (originalIndex: number) => {
                    const originalPositionCorrection = originalIndex < targetIndex ? -1 : 0;
                    return targetIndex + targetIndexPositionCorrection + originalPositionCorrection;
                };

                if (isAttributeFilterDraggableItem(item)) {
                    const identifier = dashboardAttributeFilterItemLocalIdentifier(item.filter)!;
                    const index = getMoveIndex(item.filterIndex);
                    dispatch(moveAttributeFilter(identifier, index));
                }

                if (isDateFilterDraggableItem(item)) {
                    const ref = item.filter.dateFilter.dataSet!;
                    const index = getMoveIndex(item.filterIndex);
                    dispatch(moveDateFilter(ref, index));
                }

                if (isMeasureValueFilterDraggableItem(item)) {
                    const localIdentifier = dashboardFilterLocalIdentifier(item.filter)!;
                    const index = getMoveIndex(item.filterIndex);
                    dispatch(moveMeasureValueFilter(localIdentifier, index));
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
        <div
            className={className}
            style={debugStyle}
            ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
        >
            {isActive ? <div className="drop-hint" /> : null}
        </div>
    );
}
