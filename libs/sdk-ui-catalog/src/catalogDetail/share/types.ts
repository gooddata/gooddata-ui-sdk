// (C) 2026 GoodData Corporation

import type {
    ICatalogItemAttribute,
    ICatalogItemFact,
    ICatalogItemMeasure,
} from "../../catalogItem/types.js";

/**
 * Catalog items that can be shared: attributes, facts and measures. Labels are
 * sub-selected from inside an attribute share, not shared as standalone targets.
 */
export type ShareableCatalogItem = ICatalogItemAttribute | ICatalogItemFact | ICatalogItemMeasure;
