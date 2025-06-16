// (C) 2024-2025 GoodData Corporation

import { useNewSectionDashboardLayoutPlaceholderDropHandler } from "./useNewSectionDashboardLayoutPlaceholderDropHandler.js";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler.js";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler.js";
import { useNewSectionRichTextPlaceholderDropHandler } from "./useNewSectionRichTextPlaceholderDropHandler.js";
import { useNewSectionVisualizationSwitcherPlaceholderDropHandler } from "./useNewSectionVisualizationSwitcherPlaceholderDropHandler.js";
import { ILayoutSectionPath } from "../../../../types.js";
import {
    useDashboardDrop,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableListItem,
    isDashboardLayoutDraggableListItem,
    isInsightDraggableItem,
    isKpiDraggableItem,
    isRichTextDraggableItem,
    isVisualizationSwitcherDraggableItem,
    isDashboardLayoutDraggableItem,
} from "../../../dragAndDrop/index.js";

import { useMoveWidgetToNewSectionDropHandler } from "./useMoveWidgetToNewSectionDropHandler.js";

export const useEmptyContentHandlers = (sectionPath: ILayoutSectionPath) => {
    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(sectionPath);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(sectionPath);
    const handleRichTextPlaceholderDrop = useNewSectionRichTextPlaceholderDropHandler(sectionPath);
    const handleVisualizationSwitcherPlaceholderDrop =
        useNewSectionVisualizationSwitcherPlaceholderDropHandler(sectionPath);
    const handleDashboardLayoutPlaceholderDrop =
        useNewSectionDashboardLayoutPlaceholderDropHandler(sectionPath);

    const moveWidgetToNewSection = useMoveWidgetToNewSectionDropHandler(sectionPath);

    const [{ canDrop, isOver, itemType, item }, dropRef] = useDashboardDrop(
        [
            "insightListItem",
            "kpi-placeholder",
            "insight-placeholder",
            "richTextListItem",
            "visualizationSwitcherListItem",
            "dashboardLayoutListItem",
            "insight",
            "richText",
            "visualizationSwitcher",
            "dashboardLayout",
        ],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
                if (isRichTextDraggableListItem(item)) {
                    handleRichTextPlaceholderDrop(item.size);
                }
                if (isVisualizationSwitcherDraggableListItem(item)) {
                    handleVisualizationSwitcherPlaceholderDrop(item.size);
                }
                if (isDashboardLayoutDraggableListItem(item)) {
                    handleDashboardLayoutPlaceholderDrop(item.size);
                }
                if (
                    isInsightDraggableItem(item) ||
                    isKpiDraggableItem(item) ||
                    isRichTextDraggableItem(item) ||
                    isVisualizationSwitcherDraggableItem(item) ||
                    isDashboardLayoutDraggableItem(item)
                ) {
                    moveWidgetToNewSection(item);
                }
            },
        },
        [
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
            handleDashboardLayoutPlaceholderDrop,
            moveWidgetToNewSection,
        ],
    );
    return {
        canDrop,
        isOver,
        itemType,
        item,
        dropRef,
    };
};
