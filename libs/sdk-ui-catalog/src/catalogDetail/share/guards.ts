// (C) 2026 GoodData Corporation

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type ISettings, idRef } from "@gooddata/sdk-model";

import { isCatalogItemAttribute, isCatalogItemFact, isCatalogItemMeasure } from "../../catalogItem/guards.js";
import type { ICatalogItem } from "../../catalogItem/types.js";

import type { ShareableCatalogItem } from "./types.js";

/**
 * Catalog items the share dialog can target: attributes, facts and measures. Labels
 * are not first-class catalog items; they appear inside the labels picker when
 * sharing an attribute.
 */
export function isShareableCatalogItem(item: ICatalogItem): item is ShareableCatalogItem {
    return isCatalogItemAttribute(item) || isCatalogItemFact(item) || isCatalogItemMeasure(item);
}

/**
 * Tests whether sharing is enabled for the item: attributes and facts are gated by
 * the column-level-permissions flag, measures by the metric-permissions flag. The
 * two flags are independent — a workspace may enable either on its own.
 */
export function isSharingEnabledForItem(item: ICatalogItem, settings: ISettings | undefined): boolean {
    if (isCatalogItemMeasure(item)) {
        return Boolean(settings?.enableMetricPermissions);
    }
    if (isCatalogItemAttribute(item) || isCatalogItemFact(item)) {
        return Boolean(settings?.enableColumnLevelPermissions);
    }
    return false;
}

/**
 * Build the backend target descriptor from a shareable catalog item. The kind
 * enum matches the catalog item's discriminator, so the mapping is direct.
 */
export function toShareTarget(item: ShareableCatalogItem): IObjectPermissionsObject {
    return {
        kind: item.type,
        ref: idRef(item.identifier, item.type),
    };
}
