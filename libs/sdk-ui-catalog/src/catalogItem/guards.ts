// (C) 2025-2026 GoodData Corporation

import type {
    ICatalogItem,
    ICatalogItemAttribute,
    ICatalogItemDashboard,
    ICatalogItemDataSet,
    ICatalogItemFact,
    ICatalogItemHidable,
    ICatalogItemInsight,
    ICatalogItemMeasure,
    ICatalogItemParameter,
    ICatalogItemRef,
    VisualizationType,
} from "./types.js";

/**
 * @internal
 */
export function isCatalogItemDashboard(item: ICatalogItem | undefined | null): item is ICatalogItemDashboard {
    return item?.type === "analyticalDashboard";
}

/**
 * @internal
 */
export function isCatalogItemInsight(item: ICatalogItem | undefined | null): item is ICatalogItemInsight {
    return item?.type === "insight";
}

/**
 * @internal
 */
export function isCatalogItemMeasure(item: ICatalogItem | undefined | null): item is ICatalogItemMeasure {
    return item?.type === "measure";
}

/**
 * @internal
 */
export function isCatalogItemParameter(item: ICatalogItem | undefined | null): item is ICatalogItemParameter {
    return item?.type === "parameter";
}

/**
 * @internal
 */
export function isCatalogItemAttribute(item: ICatalogItem | undefined | null): item is ICatalogItemAttribute {
    return item?.type === "attribute";
}

/**
 * @internal
 */
export function isCatalogItemFact(item: ICatalogItem | undefined | null): item is ICatalogItemFact {
    return item?.type === "fact";
}

/**
 * @internal
 */
export function isCatalogItemDataSet(item: ICatalogItem | undefined | null): item is ICatalogItemDataSet {
    return item?.type === "dataSet";
}

/**
 * Returns whether a catalog item supports the `isHidden` flag.
 * @internal
 */
export function isCatalogItemHidable(item: ICatalogItem | undefined | null): item is ICatalogItemHidable {
    return (
        isCatalogItemInsight(item) ||
        isCatalogItemMeasure(item) ||
        isCatalogItemAttribute(item) ||
        isCatalogItemFact(item)
    );
}

/**
 * Returns true when the provided value is a fully loaded catalog item
 * as opposed to just an identity-only reference.
 * @internal
 */
export function isCatalogItemLoaded(
    item: ICatalogItemRef | ICatalogItem | undefined | null,
): item is ICatalogItem {
    return item != null && "title" in item;
}

/**
 * Extract the visualization type from a catalog item, or `undefined` for non-insight items.
 * @internal
 */
export function getVisualizationType(item: ICatalogItem | undefined | null): VisualizationType | undefined {
    return isCatalogItemInsight(item) ? item.visualizationType : undefined;
}
