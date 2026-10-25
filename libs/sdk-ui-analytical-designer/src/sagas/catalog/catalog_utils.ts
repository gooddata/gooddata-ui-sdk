// (C) 2021-2026 GoodData Corporation

import { objRefToString } from "@gooddata/sdk-model";

import { type IOrganizedCatalogItem } from "../../typings/catalog.js";

/**
 * Key of the item's tooltip details in the catalog store. A computed attribute is keyed with its type, because
 * it may share an identifier with an attribute's label or another catalog item.
 */
export const getCatalogBubbleItemCacheKey = (item: IOrganizedCatalogItem) => {
    switch (item.type) {
        case "attribute":
            return objRefToString(item.dfRef);
        case "computedAttribute":
            return `${item.type}.${item.identifier}`;
        default:
            return item.identifier;
    }
};
