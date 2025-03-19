// (C) 2022-2025 GoodData Corporation
import cx from "classnames";
import React, { useCallback, useEffect, useRef, useMemo } from "react";

import { getDropZoneDebugStyle } from "../../../dragAndDrop/debug.js";
import {
    isDashboardLayoutDraggableItem,
    isInsightDraggableItem,
    isKpiDraggableItem,
    isRichTextDraggableItem,
    isVisualizationSwitcherDraggableItem,
} from "../../../dragAndDrop/types.js";
import { useDashboardDrop } from "../../../dragAndDrop/index.js";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { useDashboardLayoutPlaceholderDropHandler } from "./useDashboardLayoutPlaceholderDropHandler.js";
import { ILayoutItemPath } from "../../../../types.js";
import { areLayoutPathsEqual, updateItem, getItemIndex } from "../../../../_staging/layout/coordinates.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";

interface IHotspotProps {
    layoutPath: ILayoutItemPath;
    isLastInSection?: boolean;
    isEndingHotspot?: boolean;
    classNames?: string;
    dropZoneType: "prev" | "next";
    hideBorder?: boolean;
}

export const Hotspot: React.FC<IHotspotProps> = (props) => {
    const { layoutPath, classNames, dropZoneType, isEndingHotspot, hideBorder = false } = props;
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
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler(desiredDestination);
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
                    handleKpiPlaceholderDrop,
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
            handleKpiPlaceholderDrop,
            handleWidgetDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
            handleDashboardLayoutPlaceholderDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            handleDragHoverStart(desiredDestination);
            isOverLastValue.current = isOver;
        }
    }, [isOver, desiredDestination, handleDragHoverStart]);

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

    const pathItems = layoutPath
        ? layoutPath.map((pathItem) => `-${pathItem.sectionIndex}_${pathItem.itemIndex}`).join("")
        : "";

    const testClass = layoutPath ? `s-dropzone${pathItems}` : undefined;

    return (
        <div
            className={cx(classNames, "dropzone", dropZoneType, testClass, {
                hidden: !canDrop || !canDropSafe(item),
                full: isEndingHotspot,
                active: isOver,
            })}
            style={debugStyle}
            ref={dropRef}
        >
            {hideBorder ? null : <HotspotBorder />}
        </div>
    );
};

/**
 * A functional component that render hotspot border as dropzone
 * @returns A JSX element representing the hotspot border.
 */
const HotspotBorder: React.FC = () => {
    const status = "active";
    return (
        <div className="gd-hotspot-border__container">
            <div className={`gd-hotspot-border__drop-target ${status}`}>
                <div className="drop-target-inner" />
            </div>
        </div>
    );
};
