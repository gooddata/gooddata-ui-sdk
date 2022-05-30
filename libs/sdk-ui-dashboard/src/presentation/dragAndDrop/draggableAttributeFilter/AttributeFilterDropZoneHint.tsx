// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { useDrop } from "react-dnd";
import { moveAttributeFilter, useDashboardDispatch } from "../../../model";
import { AttributeFilterDraggableItem } from "../../componentDefinition";
import { DEBUG_SHOW_DROP_ZONES } from "../config";

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

    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: ["attributeFilter"],
            drop: (item: AttributeFilterDraggableItem) => {
                const identifier = item.filter.attributeFilter.localIdentifier!;
                dispatch(moveAttributeFilter(identifier, targetIndex));
            },
            canDrop: (item: AttributeFilterDraggableItem) => {
                return !inactiveIndexes.includes(item.filterIndex);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [inactiveIndexes, targetIndex],
    );

    const isActive = canDrop && isOver;
    const isHidden = !canDrop;

    const className = cx("attr-filter-dropzone", placement, {
        hidden: isHidden,
    });

    const debugStyle = DEBUG_SHOW_DROP_ZONES && isOver ? { backgroundColor: "rgba(0, 255, 0, 0.4)" } : {};

    return (
        <div className={className} style={debugStyle} ref={drop}>
            {isActive && <div className="drop-hint" />}
        </div>
    );
}
