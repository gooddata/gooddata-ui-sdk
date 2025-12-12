// (C) 2024-2025 GoodData Corporation

import {
    type BaseDraggableLayoutItemSize,
    type DashboardLayoutDraggableItem,
    type DraggableItemType,
    type DraggableItemTypeMapping,
    type InsightDraggableItem,
    type KpiDraggableItem,
    type RichTextDraggableItem,
    type VisualizationSwitcherDraggableItem,
    isDashboardLayoutDraggableItem,
    isDashboardLayoutDraggableListItem,
    isInsightDraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isRichTextDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableItem,
    isVisualizationSwitcherDraggableListItem,
} from "../types.js";

type DroppableItem =
    | DashboardLayoutDraggableItem
    | InsightDraggableItem
    | KpiDraggableItem
    | RichTextDraggableItem
    | VisualizationSwitcherDraggableItem;

export type DropHandlers = {
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
        isRichTextDraggableItem(item) ||
        isVisualizationSwitcherDraggableItem(item) ||
        isDashboardLayoutDraggableItem(item)
    ) {
        handlers.handleWidgetDrop(item);
    }
}
