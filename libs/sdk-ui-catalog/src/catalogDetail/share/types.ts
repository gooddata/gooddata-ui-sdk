// (C) 2026 GoodData Corporation

import type {
    ICatalogItemAttribute,
    ICatalogItemComputedAttribute,
    ICatalogItemFact,
    ICatalogItemMeasure,
} from "../../catalogItem/types.js";

/**
 * Catalog items that can be shared: attributes, facts, measures and computed attributes.
 * Labels are sub-selected from inside an attribute share, not shared as standalone
 * targets; a computed attribute has no labels at all.
 */
export type ShareableCatalogItem =
    | ICatalogItemAttribute
    | ICatalogItemFact
    | ICatalogItemMeasure
    | ICatalogItemComputedAttribute;
