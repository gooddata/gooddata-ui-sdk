// (C) 2022-2025 GoodData Corporation
import React from "react";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilter,
    IInsight,
    IKpi,
} from "@gooddata/sdk-model";
import { ICustomWidget } from "../../model/types/layoutTypes.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../types.js";

/**
 * @internal
 */
export type DraggableContentItemType =
    | "attributeFilter"
    | "dateFilter"
    | "attributeFilter-placeholder"
    | "insightListItem"
    | "insight"
    | "insight-placeholder"
    | "kpi"
    | "kpi-placeholder"
    | "richText"
    | "richTextListItem"
    | "visualizationSwitcher"
    | "visualizationSwitcherListItem"
    | "dashboardLayout"
    | "dashboardLayoutListItem"
    | "custom";

/**
 * @internal
 */
export type DraggableInternalItemType = "internal-width-resizer" | "internal-height-resizer";
/**
 * @internal
 */
export function isDraggableInternalItemType(type: string): type is DraggableInternalItemType {
    return type === "internal-width-resizer" || type === "internal-height-resizer";
}

/**
 * @internal
 */
export type DraggableItemType = DraggableContentItemType | DraggableInternalItemType;

/**
 * @internal
 */
export type AttributeFilterDraggableItem = {
    type: "attributeFilter";
    filter: IDashboardAttributeFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export function isAttributeFilterDraggableItem(item: any): item is AttributeFilterDraggableItem {
    return item.type === "attributeFilter";
}

/**
 * @internal
 */
export type DateFilterDraggableItem = {
    type: "dateFilter";
    filter: IDashboardDateFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export function isDateFilterDraggableItem(item: any): item is DateFilterDraggableItem {
    return item.type === "dateFilter";
}

/**
 * @internal
 */
export type BaseDraggableLayoutItemSize = {
    gridWidth: number;
    gridHeight: number;
};

/**
 * @internal
 */
export type BaseDraggableLayoutItem = {
    size: BaseDraggableLayoutItemSize;
};

/**
 * @internal
 */
export function isBaseDraggableLayoutItem(item: any): item is BaseDraggableMovingItem {
    return item.size?.gridWidth !== undefined && item.size?.gridHeight !== undefined;
}

/**
 * @internal
 */
export type BaseDraggableMovingItem = BaseDraggableLayoutItem & {
    title: string;
    isOnlyItemInSection: boolean;
    // TODO LX-608: remove
    sectionIndex: number;
    // TODO LX-608: remove
    itemIndex: number;
    // TODO LX-608: make required
    layoutPath?: ILayoutItemPath;
};

/**
 * @internal
 */
export function isBaseDraggableMovingItem(item: any): item is BaseDraggableMovingItem {
    return (
        isBaseDraggableLayoutItem(item) &&
        (item.layoutPath !== undefined || (item.sectionIndex !== undefined && item.itemIndex !== undefined))
    );
}

/**
 * @internal
 */
export type InsightDraggableItem = BaseDraggableMovingItem & {
    type: "insight";
    insight: IInsight;
};

/**
 * @internal
 */
export function isInsightDraggableItem(item: any): item is InsightDraggableItem {
    return item.type === "insight";
}

/**
 * @internal
 */
export type KpiDraggableItem = BaseDraggableMovingItem & {
    type: "kpi";
    kpi: IKpi;
};

/**
 * @internal
 */
export function isKpiDraggableItem(item: any): item is KpiDraggableItem {
    return item.type === "kpi";
}

/**
 * @internal
 */
export type RichTextDraggableItem = BaseDraggableMovingItem & {
    type: "richText";
};

/**
 * @internal
 */
export function isRichTextDraggableItem(item: any): item is InsightDraggableItem {
    return item.type === "richText";
}

/**
 * @internal
 */
export type RichTextDraggableListItem = BaseDraggableLayoutItem & {
    type: "richTextListItem";
};

/**
 * @internal
 */
export function isRichTextDraggableListItem(item: any): item is RichTextDraggableListItem {
    return item.type === "richTextListItem";
}

/**
 * @internal
 */
export type VisualizationSwitcherDraggableItem = BaseDraggableMovingItem & {
    type: "visualizationSwitcher";
};

/**
 * @internal
 */
export function isVisualizationSwitcherDraggableItem(item: any): item is VisualizationSwitcherDraggableItem {
    return item.type === "visualizationSwitcher";
}

/**
 * @internal
 */
export type VisualizationSwitcherDraggableListItem = BaseDraggableLayoutItem & {
    type: "visualizationSwitcherListItem";
};

/**
 * @internal
 */
export function isVisualizationSwitcherDraggableListItem(
    item: any,
): item is VisualizationSwitcherDraggableListItem {
    return item.type === "visualizationSwitcherListItem";
}

/**
 * @internal
 */
export type DashboardLayoutDraggableItem = BaseDraggableMovingItem & {
    type: "dashboardLayout";
};

/**
 * @internal
 */
export function isDashboardLayoutDraggableItem(item: any): item is DashboardLayoutDraggableItem {
    return item.type === "dashboardLayout";
}

/**
 * @internal
 */
export type DashboardLayoutDraggableListItem = BaseDraggableLayoutItem & {
    type: "dashboardLayoutListItem";
};

/**
 * @internal
 */
export function isDashboardLayoutDraggableListItem(item: any): item is DashboardLayoutDraggableListItem {
    return item.type === "dashboardLayoutListItem";
}

/**
 * @internal
 */
export type CustomWidgetDraggableItem = BaseDraggableMovingItem & {
    type: "customWidget";
    widget: ICustomWidget;
};

/**
 * @internal
 */
export type AttributeFilterPlaceholderDraggableItem = {
    type: "attributeFilter-placeholder";
};

/**
 * @internal
 */
export function isAttributeFilterPlaceholderDraggableItem(
    item: any,
): item is AttributeFilterPlaceholderDraggableItem {
    return item.type === "attributeFilter-placeholder";
}

/**
 * @internal
 */
export type KpiPlaceholderDraggableItem = BaseDraggableLayoutItem & {
    type: "kpi-placeholder";
};

/**
 * @internal
 */
export function isKpiPlaceholderDraggableItem(item: any): item is KpiPlaceholderDraggableItem {
    return item.type === "kpi-placeholder";
}

/**
 * @internal
 */
export type InsightPlaceholderDraggableItem = BaseDraggableLayoutItem & {
    type: "insight-placeholder";
};

/**
 * @internal
 */
export function isInsightPlaceholderDraggableItem(item: any): item is InsightPlaceholderDraggableItem {
    return item.type === "insight-placeholder";
}

/**
 * @internal
 */
export type InsightDraggableListItem = BaseDraggableLayoutItem & {
    type: "insightListItem";
    insight: IInsight;
};

/**
 * @internal
 */
export function isInsightDraggableListItem(item: any): item is InsightDraggableListItem {
    return item.type === "insightListItem";
}

/**
 * @internal
 */
export type CustomDraggableItem = {
    type: "custom";
    [key: string]: any;
};

/**
 * @internal
 */
export type DraggableContentItem =
    | AttributeFilterDraggableItem
    | AttributeFilterPlaceholderDraggableItem
    | DateFilterDraggableItem
    | InsightDraggableItem
    | InsightDraggableListItem
    | InsightPlaceholderDraggableItem
    | KpiDraggableItem
    | KpiPlaceholderDraggableItem
    | RichTextDraggableItem
    | RichTextDraggableListItem
    | VisualizationSwitcherDraggableItem
    | VisualizationSwitcherDraggableListItem
    | DashboardLayoutDraggableItem
    | DashboardLayoutDraggableListItem
    | CustomWidgetDraggableItem
    | CustomDraggableItem;

/**
 * @internal
 */
export type DraggableLayoutItem =
    | InsightDraggableItem
    | KpiDraggableItem
    | RichTextDraggableItem
    | VisualizationSwitcherDraggableItem
    | DashboardLayoutDraggableItem
    | CustomWidgetDraggableItem;

/**
 * @internal
 */
export type DraggableInternalItem = HeightResizerDragItem | WidthResizerDragItem;

/**
 * @internal
 */
export type DraggableItem = DraggableContentItem | DraggableInternalItem;

/**
 * @internal
 */
export type DraggableItemTypeMapping = DraggableItemComponentTypeMapping & DraggableItemInternalTypeMapping;

/**
 * @internal
 */
export type DraggableItemComponentTypeMapping = {
    attributeFilter: AttributeFilterDraggableItem;
    dateFilter: DateFilterDraggableItem;
    "attributeFilter-placeholder": AttributeFilterPlaceholderDraggableItem;
    insight: InsightDraggableItem;
    insightListItem: InsightDraggableListItem;
    "insight-placeholder": InsightPlaceholderDraggableItem;
    kpi: KpiDraggableItem;
    "kpi-placeholder": KpiPlaceholderDraggableItem;
    richText: RichTextDraggableItem;
    richTextListItem: RichTextDraggableListItem;
    visualizationSwitcher: VisualizationSwitcherDraggableItem;
    visualizationSwitcherListItem: VisualizationSwitcherDraggableListItem;
    dashboardLayout: DashboardLayoutDraggableItem;
    dashboardLayoutListItem: DashboardLayoutDraggableListItem;
    custom: CustomDraggableItem;
};

/**
 * @internal
 */
export interface HeightResizerDragItem {
    type: "internal-height-resizer";
    // TODO LX-608: remove
    sectionIndex: number;
    // TODO LX-608: make required
    sectionPath?: ILayoutSectionPath;
    itemIndexes: number[];
    widgetHeights: number[];
    initialLayoutDimensions: DOMRect;
    minLimit: number;
    maxLimit: number;
}

/**
 * @internal
 */
export interface WidthResizerDragItem {
    type: "internal-width-resizer";
    // TODO LX-608: remove
    sectionIndex: number;
    // TODO LX-608: remove
    itemIndex: number;
    // TODO LX-608: make required
    layoutPath?: ILayoutItemPath;
    gridColumnWidth: number;
    gridColumnHeightInPx: number;
    currentWidth: number;
    initialLayoutDimensions: DOMRect;
    minLimit: number;
    maxLimit: number;
    // TODO LX-608: make required
    rowIndex?: number;
}

/**
 * @internal
 */
export type DraggableItemInternalTypeMapping = {
    "internal-width-resizer": WidthResizerDragItem;
    "internal-height-resizer": HeightResizerDragItem;
};

/**
 * @internal
 */
export type CustomDashboardInsightListItemComponentProps = {
    isLocked?: boolean;
    title?: string;
    description?: string;
    updated?: string;
    type?: string;
    className?: string;
    showDescriptionPanel?: boolean;
    onDescriptionPanelOpen?: () => void;
    metadataTimeZone?: string;
    filters?: IFilter[];
    useRichText?: boolean;
    useReferences?: boolean;
    LoadingComponent?: React.ComponentType;
};

/**
 * @internal
 */
export type CustomDashboardInsightListItemComponent =
    React.ComponentType<CustomDashboardInsightListItemComponentProps>;

/**
 * @internal
 */
export type IWrapCreatePanelItemWithDragProps = {
    children: JSX.Element;
    dragItem: DraggableItem;
    hideDefaultPreview?: boolean;
    disabled?: boolean;
    onDragStart?: (item: DraggableItem) => void;
};

/**
 * @internal
 */
export type IWrapCreatePanelItemWithDragInnerProps = {
    children: JSX.Element;
    dragItem: DraggableItem;
    hideDefaultPreview?: boolean;
    disabled?: boolean;
    canDrag: boolean;
    onDragStart?: (item: DraggableItem) => void;
    onDragEnd?: (didDrop: boolean) => void;
};

/**
 * @internal
 */
export type IWrapCreatePanelItemWithDragComponent = React.ComponentType<IWrapCreatePanelItemWithDragProps>;

/**
 * @internal
 */
export interface IWrapInsightListItemWithDragProps {
    children: JSX.Element;
    insight: IInsight;
    onDragStart?: (item: DraggableItem) => void;
}

/**
 * @internal
 */
export type IWrapInsightListItemWithDragComponent = React.ComponentType<IWrapInsightListItemWithDragProps>;
