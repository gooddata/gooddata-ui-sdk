// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { moveAttributeFilter, useDashboardDispatch } from "../../../model";
import { DEBUG_SHOW_DROP_ZONES } from "../config";
import { useDashboardDrop } from "../useDashboardDrop";

export type AttributeFilterDropZonePlacement = "next" | "prev" | "outside";

function getIgnoreIndexes(type: AttributeFilterDropZonePlacement, targetIndex: number) {
    if (type === "outside") {
        return [targetIndex];
    }

    if (type === "next") {
        return [targetIndex, targetIndex + 1];
    }

    return [targetIndex, targetIndex - 1];
}

export type AttributeFilterDropZoneHintProps = {
    placement: AttributeFilterDropZonePlacement;
    targetIndex: number;
};

export function AttributeFilterDropZoneHint({ placement, targetIndex }: AttributeFilterDropZoneHintProps) {
    const dispatch = useDashboardDispatch();
    const inactiveIndexes = getIgnoreIndexes(placement, targetIndex);

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        "attributeFilter",
        {
            canDrop: ({ filterIndex }) => {
                return !inactiveIndexes.includes(filterIndex);
            },
            drop: ({ filter }) => {
                const identifier = filter.attributeFilter.localIdentifier!;
                dispatch(moveAttributeFilter(identifier, targetIndex));
            },
        },
        [inactiveIndexes, targetIndex],
    );

    const isActive = canDrop && isOver;
    const isHidden = !canDrop;

    const className = cx("attr-filter-dropzone", placement, {
        hidden: isHidden,
    });

    const debugStyle = DEBUG_SHOW_DROP_ZONES && isOver ? { backgroundColor: "rgba(0, 255, 0, 0.4)" } : {};

    return (
        <div className={className} style={debugStyle} ref={dropRef}>
            {isActive && <div className="drop-hint" />}
        </div>
    );
}
