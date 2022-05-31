// (C) 2022 GoodData Corporation

import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type DraggableItemType = "attributeFilter" | "widget" | "custom";

/**
 * @internal
 */
export type AttributeFilterDraggableItem = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export type CustomDraggableItem = {
    [key: string]: any;
};

/**
 * @internal
 */
export type WidgetDraggableItem = {
    widget: never;
};

/**
 * @internal
 */
export type DraggableItemTypeMapping = {
    attributeFilter: AttributeFilterDraggableItem;
    custom: CustomDraggableItem;
    widget: WidgetDraggableItem;
};
