// (C) 2022 GoodData Corporation
import cx from "classnames";
import React, { useCallback, useEffect, useRef } from "react";

import { getDropZoneDebugStyle } from "../debug.js";
import {
    isInsightDraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types.js";
import { useDashboardDrop } from "../useDashboardDrop.js";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";

interface IHotspotProps {
    sectionIndex: number;
    itemIndex: number;
    isLastInSection?: boolean;
    isEndingHotspot?: boolean;
    classNames?: string;
    dropZoneType: "prev" | "next";
}

export const Hotspot: React.FC<IHotspotProps> = (props) => {
    const { itemIndex, sectionIndex, classNames, dropZoneType, isEndingHotspot } = props;
    const isOverLastValue = useRef(false);

    // for "next" we need to add the item after the current index, for "prev" on the current one
    const targetItemIndex = dropZoneType === "next" ? itemIndex + 1 : itemIndex;

    const handleInsightListItemDrop = useInsightListItemDropHandler(sectionIndex, targetItemIndex);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(sectionIndex, targetItemIndex);
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler(sectionIndex, targetItemIndex);
    const handleWidgetDrop = useMoveWidgetDropHandler(sectionIndex, targetItemIndex);
    const { handleDragHoverStart } = useWidgetDragHoverHandlers();

    const [{ canDrop, isOver, item }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder", "kpi", "insight"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }

                if (isInsightDraggableItem(item) || isKpiDraggableItem(item)) {
                    handleWidgetDrop(item);
                }
            },
        },
        [
            targetItemIndex,
            sectionIndex,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleKpiPlaceholderDrop,
            handleWidgetDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            handleDragHoverStart({ sectionIndex, itemIndex: targetItemIndex });
            isOverLastValue.current = isOver;
        }
    }, [isOver, sectionIndex, targetItemIndex, handleDragHoverStart]);

    const debugStyle = getDropZoneDebugStyle({ isOver });
    const canDropSafe = useCallback(
        (item: unknown) => {
            if (!item) {
                return false;
            }

            if (isInsightDraggableItem(item) || isKpiDraggableItem(item)) {
                return isEndingHotspot || item.sectionIndex !== sectionIndex || item.itemIndex !== itemIndex;
            }

            return true;
        },
        [isEndingHotspot, sectionIndex, itemIndex],
    );

    return (
        <div
            className={cx(classNames, "dropzone", dropZoneType, {
                hidden: !canDrop || !canDropSafe(item),
                full: isEndingHotspot,
            })}
            style={debugStyle}
            ref={dropRef}
        />
    );
};
