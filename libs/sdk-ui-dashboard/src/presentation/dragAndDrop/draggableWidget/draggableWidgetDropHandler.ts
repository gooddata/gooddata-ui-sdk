// (C) 2024 GoodData Corporation

import {
    isInsightDraggableListItem,
    isKpiPlaceholderDraggableItem,
    isInsightPlaceholderDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableListItem,
    isDashboardLayoutDraggableListItem,
    isInsightDraggableItem,
    isKpiDraggableItem,
    isRichTextDraggableItem,
    isVisualizationSwitcherDraggableItem,
    isDashboardLayoutDraggableItem,
    DraggableItemType,
    DraggableItemTypeMapping,
    BaseDraggableLayoutItemSize,
    DashboardLayoutDraggableItem,
    InsightDraggableItem,
    KpiDraggableItem,
    RichTextDraggableItem,
    VisualizationSwitcherDraggableItem,
} from "../types.js";

type DroppableItem =
    | DashboardLayoutDraggableItem
    | InsightDraggableItem
    | KpiDraggableItem
    | RichTextDraggableItem
    | VisualizationSwitcherDraggableItem;

export type DropHandlers = {
    handleKpiPlaceholderDrop: () => void;
    handleInsightListItemDrop: (insight: any) => void;
    handleInsightPlaceholderDrop: () => void;
    handleRichTextPlaceholderDrop: (size: BaseDraggableLayoutItemSize) => void;

    handleVisualizationSwitcherPlaceholderDrop: (size: BaseDraggableLayoutItemSize) => void;
    handleDashboardLayoutPlaceholderDrop: (size: BaseDraggableLayoutItemSize) => void;
    handleWidgetDrop: (item: DroppableItem) => void;
};

export function draggableWidgetDropHandler<
    DragType extends DraggableItemType,
    DragObject = DraggableItemTypeMapping[DragType],
>(item: DragObject, handlers: DropHandlers) {
    if (isKpiPlaceholderDraggableItem(item)) {
        handlers.handleKpiPlaceholderDrop();
    }
    if (isInsightDraggableListItem(item)) {
        handlers.handleInsightListItemDrop(item.insight);
    }
    if (isInsightPlaceholderDraggableItem(item)) {
        handlers.handleInsightPlaceholderDrop();
    }
    if (isRichTextDraggableListItem(item)) {
        handlers.handleRichTextPlaceholderDrop(item.size);
    }
    if (isVisualizationSwitcherDraggableListItem(item)) {
        handlers.handleVisualizationSwitcherPlaceholderDrop(item.size);
    }
    if (isDashboardLayoutDraggableListItem(item)) {
        handlers.handleDashboardLayoutPlaceholderDrop(item.size);
    }
    if (
        isInsightDraggableItem(item) ||
        isKpiDraggableItem(item) ||
        isRichTextDraggableItem(item) ||
        isVisualizationSwitcherDraggableItem(item) ||
        isDashboardLayoutDraggableItem(item)
    ) {
        handlers.handleWidgetDrop(item);
    }
}
