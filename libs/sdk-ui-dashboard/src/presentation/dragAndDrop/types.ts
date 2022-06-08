// (C) 2022 GoodData Corporation

import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type DraggableItemType = "attributeFilter" | "attributeFilter-placeholder" | "widget" | "custom";

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
export type CustomDraggableItem = {
    type: "custom";
    [key: string]: any;
};

/**
 * @internal
 */
export type WidgetDraggableItem = {
    type: "widget";
    widget: never;
};

/**
 * @internal
 */
export type DraggableItem =
    | AttributeFilterDraggableItem
    | AttributeFilterPlaceholderDraggableItem
    | CustomDraggableItem
    | WidgetDraggableItem;

/**
 * @internal
 */
export type DraggableItemTypeMapping = {
    attributeFilter: AttributeFilterDraggableItem;
    "attributeFilter-placeholder": AttributeFilterPlaceholderDraggableItem;
    custom: CustomDraggableItem;
    widget: WidgetDraggableItem;
};

/**
 * @internal
 */
export type CustomDashboardAttributeFilterPlaceholderComponentProps = {
    disabled: boolean;
};

/**
 * @internal
 */
export type CustomDashboardAttributeFilterPlaceholderComponent =
    React.ComponentType<CustomDashboardAttributeFilterPlaceholderComponentProps>;
