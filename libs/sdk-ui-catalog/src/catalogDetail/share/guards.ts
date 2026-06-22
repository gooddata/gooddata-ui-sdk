// (C) 2026 GoodData Corporation

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { isCatalogItemAttribute, isCatalogItemFact } from "../../catalogItem/guards.js";
import type { ICatalogItem } from "../../catalogItem/types.js";

import type { ShareableCatalogItem } from "./types.js";

/**
 * Catalog items the share dialog can target: attributes and facts. Labels are
 * not first-class catalog items; they appear inside the labels picker when
 * sharing an attribute.
 */
export function isShareableCatalogItem(item: ICatalogItem): item is ShareableCatalogItem {
    return isCatalogItemAttribute(item) || isCatalogItemFact(item);
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
