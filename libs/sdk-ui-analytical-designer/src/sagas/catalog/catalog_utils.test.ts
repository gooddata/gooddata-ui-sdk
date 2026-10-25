// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { objRefToString } from "@gooddata/sdk-model";

import { organizedCatalogItems } from "../../tests/catalog_components.test.helpers.js";
import { type IOrganizedCatalogItem } from "../../typings/catalog.js";

import { getCatalogBubbleItemCacheKey } from "./catalog_utils.js";

describe("getCatalogBubbleItemCacheKey", () => {
    it.each([
        ["metric1", "metric", organizedCatalogItems[0]],
        ["fact1", "fact", organizedCatalogItems[2]],
        ["df1", "attribute", organizedCatalogItems[3]],
    ])(
        "should return key '%s' for %s item",
        (expectedKey: string, _itemType: string, item: IOrganizedCatalogItem) => {
            expect(getCatalogBubbleItemCacheKey(item)).toEqual(expectedKey);
        },
    );

    it("should keep a computed attribute apart from an attribute whose label shares its identifier", () => {
        const attribute = organizedCatalogItems[3];
        const computedAttribute = {
            ...attribute,
            type: "computedAttribute",
            identifier: objRefToString(attribute.dfRef!),
        } as IOrganizedCatalogItem;

        expect(getCatalogBubbleItemCacheKey(computedAttribute)).not.toEqual(
            getCatalogBubbleItemCacheKey(attribute),
        );
    });
});
