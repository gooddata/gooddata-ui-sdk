// (C) 2022-2024 GoodData Corporation
import cx from "classnames";
import React, { useEffect } from "react";
import { useDashboardDispatch } from "../../../model/index.js";
import {
    isBaseDraggableMovingItem,
    isInsightDraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiDraggableItem,
    isKpiPlaceholderDraggableItem,
    isRichTextDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableItem,
    isVisualizationSwitcherDraggableListItem,
} from "../types.js";
import { getDropZoneDebugStyle } from "../debug.js";
import { useDashboardDrop } from "../useDashboardDrop.js";
import { SectionDropZoneBox } from "./SectionDropZoneBox.js";
import { useMoveWidgetToNewSectionDropHandler } from "./useMoveWidgetToNewSectionDropHandler.js";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler.js";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler.js";
import { useNewSectionKpiPlaceholderDropHandler } from "./useNewSectionKpiPlaceholderDropHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";
import { useNewSectionRichTextPlaceholderDropHandler } from "./useNewSectionRichTextPlaceholderDropHandler.js";
import { useNewSectionVisualizationSwitcherPlaceholderDropHandler } from "./useNewSectionVisualizationSwitcherPlaceholderDropHandler.js";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: number;
    targetPosition?: RowPosition;
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = (props) => {
    const { index, targetPosition } = props;

    const dispatch = useDashboardDispatch();

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(index);
    const handleKpiPlaceholderDrop = useNewSectionKpiPlaceholderDropHandler(index);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(index);
    const handleRichTextPlaceholderDrop = useNewSectionRichTextPlaceholderDropHandler(index);
    const handleVisualizationSwitcherPlaceholderDrop =
        useNewSectionVisualizationSwitcherPlaceholderDropHandler(index);
    const moveWidgetToNewSection = useMoveWidgetToNewSectionDropHandler(index);
    const { handleDragHoverEnd } = useWidgetDragHoverHandlers();

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
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
        ],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isInsightDraggableItem(item)) {
                    moveWidgetToNewSection(item);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
                if (isRichTextDraggableListItem(item)) {
                    handleRichTextPlaceholderDrop();
                }
                if (isRichTextDraggableItem(item)) {
                    moveWidgetToNewSection(item);
                }
                if (isVisualizationSwitcherDraggableItem(item)) {
                    moveWidgetToNewSection(item);
                }
                if (isVisualizationSwitcherDraggableListItem(item)) {
                    handleVisualizationSwitcherPlaceholderDrop();
                }
                if (isKpiDraggableItem(item)) {
                    moveWidgetToNewSection(item);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
            },
            canDrop: (item) => {
                if (isBaseDraggableMovingItem(item)) {
                    const isAdjacentSection = index === item.sectionIndex || index === item.sectionIndex + 1;
                    return !(item.isOnlyItemInSection && isAdjacentSection);
                }
                return true;
            },
        },
        [
            dispatch,
            index,
            handleInsightListItemDrop,
            handleKpiPlaceholderDrop,
            handleInsightPlaceholderDrop,
            handleVisualizationSwitcherPlaceholderDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            handleDragHoverEnd();
        }
    }, [handleDragHoverEnd, isOver]);

    if (!canDrop) {
        return null;
    }

    const isLast = targetPosition === "below";

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx("row-hotspot-container", {
                last: isLast && canDrop,
                "s-last-drop-position": isLast && canDrop,
                hidden: !canDrop,
            })}
        >
            <div className={cx("row-hotspot", { hidden: !canDrop })} style={{ ...debugStyle }} ref={dropRef}>
                {!!isOver && <SectionDropZoneBox isOver={isOver} />}
            </div>
        </div>
    );
};
