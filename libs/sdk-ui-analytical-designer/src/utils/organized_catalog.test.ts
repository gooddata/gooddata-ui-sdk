// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type CatalogItem, type ICatalogAttribute, idRef } from "@gooddata/sdk-model";

import { catalogAttribute, catalogMeasure, getCatalogAttribute } from "../tests/catalog.test.helpers.js";
import { organizedCatalogItems } from "../tests/catalog_components.test.helpers.js";
import { type ICacheItem } from "../typings/state_objects.js";
import { OrganizedCatalogUtils } from "../utils/organized_catalog.js";

describe("OrganizedCatalogUtils", () => {
    describe("getUnavailableItemsCount", () => {
        const availableItems = organizedCatalogItems.slice(0, 4);
        const allItems = organizedCatalogItems;
        const availableSearchedItems = organizedCatalogItems.slice(0, 1);
        const allSearchedItems = organizedCatalogItems.slice(0, 3);

        it("should return difference of all and available items if search is not applied", () => {
            const result = OrganizedCatalogUtils.getUnavailableItemsCount(
                "",
                availableItems,
                allItems,
                availableSearchedItems,
                allSearchedItems,
            );
            expect(result).toBe(1);
        });

        it("should return difference of searched all and searched available items if search is applied", () => {
            const result = OrganizedCatalogUtils.getUnavailableItemsCount(
                "abc",
                availableItems,
                allItems,
                availableSearchedItems,
                allSearchedItems,
            );
            expect(result).toBe(2);
        });
    });

    const newCatalogItemBase: CatalogItem = { ...catalogAttribute };

    const cacheItemBase: ICacheItem = {
        ref: newCatalogItemBase.attribute.ref,
        identifier: newCatalogItemBase.attribute.id,
        title: newCatalogItemBase.attribute.title,
        type: newCatalogItemBase.type,
        dfUri: newCatalogItemBase.defaultDisplayForm.uri,
        dfIdentifier: newCatalogItemBase.defaultDisplayForm.id,
        dfRef: newCatalogItemBase.defaultDisplayForm.ref,
        uri: newCatalogItemBase.attribute.uri,
    };

    describe("convertToItemCacheList", () => {
        it("should return itemCache objects list having displayFormUri as dfUri", () => {
            const displayFormUri = "/uri/attribute/displayForm";
            const result = OrganizedCatalogUtils.convertToItemCacheList([
                {
                    ...newCatalogItemBase,
                    defaultDisplayForm: {
                        ...newCatalogItemBase.defaultDisplayForm,
                        uri: displayFormUri,
                    },
                    displayForms: [
                        {
                            ...newCatalogItemBase.defaultDisplayForm,
                            uri: displayFormUri,
                            isDefault: true,
                            isPrimary: true,
                        },
                    ],
                },
            ]);

            expect(result).toMatchSnapshot();
        });

        it("should return itemCache objects list having displayFormId as dfIdentifier", () => {
            const displayFormId = "label.displayForm";
            const result = OrganizedCatalogUtils.convertToItemCacheList([
                {
                    ...newCatalogItemBase,
                    defaultDisplayForm: {
                        ...newCatalogItemBase.defaultDisplayForm,
                        id: displayFormId,
                    },
                },
            ]);

            const expected: ICacheItem[] = [
                {
                    ...cacheItemBase,
                    dfIdentifier: displayFormId,
                },
            ];

            expect(result).toEqual(expected);
        });
    });

    describe("computed attributes", () => {
        const displayForm = {
            id: "computed_attr",
            uri: "computed_attr",
            ref: idRef("computed_attr", "displayForm"),
            type: "displayForm" as const,
            title: "Revenue bucket",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            attribute: idRef("computed_attr", "computedAttribute"),
            isDefault: true,
            isPrimary: true,
        };
        const computedAttributeCatalogItem: CatalogItem = {
            type: "computedAttribute",
            groups: [],
            computedAttribute: {
                type: "computedAttribute",
                ref: idRef("computed_attr", "computedAttribute"),
                id: "computed_attr",
                uri: "computed_attr",
                title: "Revenue bucket",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                expression: "SELECT 1",
                displayForms: [displayForm],
            },
            defaultDisplayForm: displayForm,
            displayForms: [displayForm],
        };

        it("should convert a computed attribute into a cache item carrying its fabricated display form", () => {
            const [result] = OrganizedCatalogUtils.convertToItemCacheList([computedAttributeCatalogItem]);

            expect(result).toMatchObject({
                type: "computedAttribute",
                identifier: "computed_attr",
                title: "Revenue bucket",
                expression: "SELECT 1",
                dfIdentifier: "computed_attr",
                dfRef: displayForm.ref,
            });
        });

        it("should cache a computed attribute in its own namespace, never among the attributes", () => {
            const attribute: CatalogItem = {
                ...catalogAttribute,
                attribute: { ...catalogAttribute.attribute, id: "computed_attr" },
            };

            const result = OrganizedCatalogUtils.convertToItemCacheMap([
                computedAttributeCatalogItem,
                attribute,
            ]);

            // an attribute sharing the identifier keeps its own entry - neither shadows the other
            expect(result["computedAttribute.computed_attr"].type).toEqual("computedAttribute");
            expect(result["attribute.computed_attr"].type).toEqual("attribute");
        });
    });

    describe("convertToItemCacheMap", () => {
        const displayFormUri = "/uri/first/attribute/displayForm";
        const firstCatalogItem: ICatalogAttribute = {
            ...(newCatalogItemBase as ICatalogAttribute),
            defaultDisplayForm: {
                ...newCatalogItemBase.defaultDisplayForm,
                uri: displayFormUri,
            },
        };

        const secondCatalogItem: CatalogItem = {
            ...getCatalogAttribute(2),
        };

        const thirdCatalogItem: CatalogItem = {
            ...catalogMeasure,
            type: "measure",
        };

        const measureCacheItemBase: ICacheItem = {
            ref: catalogMeasure.measure.ref,
            identifier: catalogMeasure.measure.id,
            title: catalogMeasure.measure.title,
            uri: catalogMeasure.measure.uri,
            type: "metric",
        };

        it("should return itemCache objects map", () => {
            const result = OrganizedCatalogUtils.convertToItemCacheMap([
                firstCatalogItem,
                secondCatalogItem,
                thirdCatalogItem,
            ]);

            expect(result).toEqual({
                [`attribute.${firstCatalogItem.attribute.id}`]: {
                    ...cacheItemBase,
                    dfUri: displayFormUri,
                },
                [`attribute.${secondCatalogItem.attribute.id}`]: {
                    dfRef: secondCatalogItem.defaultDisplayForm.ref,
                    dfIdentifier: secondCatalogItem.defaultDisplayForm.id,
                    dfUri: secondCatalogItem.defaultDisplayForm.uri,
                    ref: secondCatalogItem.attribute.ref,
                    title: secondCatalogItem.attribute.title,
                    type: secondCatalogItem.type,
                    identifier: secondCatalogItem.attribute.id,
                    uri: secondCatalogItem.attribute.uri,
                },
                [`metric.${thirdCatalogItem.measure.id}`]: measureCacheItemBase,
            });
        });
    });
});
