// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import cx from "classnames";

import { IDashboardLayoutContainerDirection } from "@gooddata/sdk-model";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { useDashboardLayoutPlaceholderDropHandler } from "./useDashboardLayoutPlaceholderDropHandler.js";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";
import {
    areLayoutPathsEqual,
    getItemIndex,
    serializeLayoutItemPath,
    updateItem,
} from "../../../../_staging/layout/coordinates.js";
import { DropZoneType, ILayoutItemPath } from "../../../../types.js";
import { getDropZoneDebugStyle } from "../../../dragAndDrop/debug.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";
import { useDashboardDrop } from "../../../dragAndDrop/index.js";
import {
    isDashboardLayoutDraggableItem,
    isInsightDraggableItem,
    isKpiDraggableItem,
    isRichTextDraggableItem,
    isVisualizationSwitcherDraggableItem,
} from "../../../dragAndDrop/types.js";

interface IHotspotProps {
    layoutPath: ILayoutItemPath;
    dropZoneType: DropZoneType;
    direction: IDashboardLayoutContainerDirection;
    isEndingHotspot?: boolean;
    hideDropTarget?: boolean;
    isOverNestedLayout?: boolean;
    isInFirstRow?: boolean;
}

const { e: dropzoneBemElement, b: dropzoneBemBlock } = bemFactory("gd-grid-layout-dropzone");

export const Hotspot: React.FC<IHotspotProps> = (props) => {
    const {
        layoutPath,
        dropZoneType,
        direction,
        isEndingHotspot = false,
        hideDropTarget = false,
        isInFirstRow = false,
        isOverNestedLayout = false,
    } = props;
    const isOverLastValue = useRef(false);

    const currentItemIndex = getItemIndex(layoutPath);

    // for "next" we need to add the item after the current index, for "prev" on the current one
    const targetItemIndex = dropZoneType === "next" ? currentItemIndex + 1 : currentItemIndex;
    const targetSectionIndex = layoutPath[layoutPath.length - 1].sectionIndex;
    const desiredDestination = useMemo(
        () => updateItem(layoutPath, targetSectionIndex, targetItemIndex),
        [layoutPath, targetItemIndex, targetSectionIndex],
    );

    const handleInsightListItemDrop = useInsightListItemDropHandler(desiredDestination);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(desiredDestination);
    const handleRichTextPlaceholderDrop = useRichTextPlaceholderDropHandler(desiredDestination);
    const handleVisualizationSwitcherPlaceholderDrop =
        useVisualizationSwitcherPlaceholderDropHandler(desiredDestination);
    const handleDashboardLayoutPlaceholderDrop = useDashboardLayoutPlaceholderDropHandler(desiredDestination);

    const handleWidgetDrop = useMoveWidgetDropHandler(desiredDestination);
    const { handleDragHoverStart } = useWidgetDragHoverHandlers();

    const [{ canDrop, isOver, item }, dropRef] = useDashboardDrop(
        [
            "insightListItem",
            "kpi-placeholder",
            "insight-placeholder",
            "kpi",
            "insight",
            "richText",
            "richTextListItem",
            "visualizationSwitcher",
            "visualizationSwitcherListItem",
            "dashboardLayout",
            "dashboardLayoutListItem",
        ],
        {
            drop: (item) => {
                draggableWidgetDropHandler(item, {
                    handleInsightListItemDrop,
                    handleInsightPlaceholderDrop,
                    handleRichTextPlaceholderDrop,
                    handleVisualizationSwitcherPlaceholderDrop,
                    handleDashboardLayoutPlaceholderDrop,
                    handleWidgetDrop,
                });
            },
        },
        [
            targetItemIndex,
            targetSectionIndex,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleWidgetDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
            handleDashboardLayoutPlaceholderDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            // Special case for the last hotspot: it is triggered only when the mouse is over the "next"
            // dropzone, otherwise it would render also on the previous row when there is a space on that
            // row and the mouse is on the "prev" hotspot on the left most item of the row. However, the
            // ending hotspot is registered as "prev" for insertion indexes being set up correctly. When
            // a user would hover over the hotspot, "prev" would be reported by the handler below and the drop
            // zone would be hidden. Therefore, we need to send "next" to satisfy the condition.
            handleDragHoverStart(desiredDestination, isEndingHotspot ? "next" : dropZoneType);
            isOverLastValue.current = isOver;
        }
    }, [isOver, desiredDestination, handleDragHoverStart, dropZoneType, isEndingHotspot]);

    const [canBeDisplayed, setCanBeDisplayed] = React.useState(false);
    const isDragging = !!item;
    React.useEffect(() => {
        // There is a bug in Chrome that calls dragstop immediately after dragstart unless we defer the visibility
        // of the hotspot to setTimeout. Chrome doesn't like a new element suddenly appearing under the mouse cursor
        // immediately when dragging starts and just aborts the whole thing.

        const timeout = setTimeout(() => {
            setCanBeDisplayed(isDragging);
        }, 0);
        return () => {
            clearTimeout(timeout);
        };
    }, [isDragging]);

    const debugStyle = getDropZoneDebugStyle({ isOver });
    const canDropSafe = useCallback(
        (item: unknown) => {
            if (!item) {
                return false;
            }

            if (
                isInsightDraggableItem(item) ||
                isKpiDraggableItem(item) ||
                isRichTextDraggableItem(item) ||
                isVisualizationSwitcherDraggableItem(item) ||
                isDashboardLayoutDraggableItem(item)
            ) {
                return isEndingHotspot || !areLayoutPathsEqual(item.layoutPath, layoutPath);
            }

            return true;
        },
        [isEndingHotspot, layoutPath],
    );

    return (
        <div
            className={cx(
                dropzoneBemBlock({
                    direction,
                    type: dropZoneType,
                    active: isOver,
                    full: isEndingHotspot,
                    hidden: !canBeDisplayed || !canDrop || !canDropSafe(item),
                    isInFirstRow,
                    isOverNestedLayout,
                }),
                `s-dropzone-${dropZoneType}`,
                {
                    [`s-dropzone-${serializeLayoutItemPath(layoutPath)}`]: !!layoutPath,
                },
            )}
            style={debugStyle}
            ref={dropRef}
        >
            {hideDropTarget ? null : (
                <div className={dropzoneBemElement("drop-target", { direction })}>
                    <div className={dropzoneBemElement("drop-target-border")}>
                        <div className={dropzoneBemElement("drop-target-inner")} />
                    </div>
                </div>
            )}
        </div>
    );
};
