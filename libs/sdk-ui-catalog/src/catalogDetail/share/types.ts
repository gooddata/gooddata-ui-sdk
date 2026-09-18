// (C) 2026 GoodData Corporation

import type {
    ICatalogItemAttribute,
    ICatalogItemComputedAttribute,
    ICatalogItemFact,
    ICatalogItemInsight,
    ICatalogItemMeasure,
} from "../../catalogItem/types.js";

/**
 * Catalog items that can be shared: attributes, facts, measures, computed attributes and
 * visualizations. Labels are sub-selected from inside an attribute share, not shared as
 * standalone targets; the other kinds have no labels at all.
 */
export type ShareableCatalogItem =
    | ICatalogItemAttribute
    | ICatalogItemFact
    | ICatalogItemMeasure
    | ICatalogItemComputedAttribute
    | ICatalogItemInsight;
