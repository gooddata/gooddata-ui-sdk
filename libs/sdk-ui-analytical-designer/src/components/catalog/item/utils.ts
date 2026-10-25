// (C) 2023-2026 GoodData Corporation

import {
    type CatalogItem,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    areObjRefsEqual,
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
} from "@gooddata/sdk-model";

import { type IDateDatasetAttribute } from "../../../typings/dataset_attribute.js";

export const extractTitle = (hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) =>
    isCatalogAttributeHierarchy(hierarchy) ? hierarchy.attributeHierarchy.title : hierarchy.title;

export const extractDescription = (hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) =>
    isCatalogAttributeHierarchy(hierarchy) ? hierarchy.attributeHierarchy.description : undefined;

const extractAttributes = (hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) =>
    isCatalogAttributeHierarchy(hierarchy) ? hierarchy.attributeHierarchy.attributes : hierarchy.attributes;

export const mapAttributeItems = (
    attributeHierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    catalogItems: ReadonlyArray<CatalogItem>,
    dateAttributes: IDateDatasetAttribute[],
) =>
    extractAttributes(attributeHierarchy)
        .map((attribute) => {
            const catalogItem = catalogItems.find(
                (item) => isCatalogAttribute(item) && areObjRefsEqual(item.attribute.ref, attribute),
            );
            if (catalogItem) {
                return {
                    isDate: false,
                    title: (catalogItem as ICatalogAttribute).attribute.title,
                };
            }
            const dateItem = dateAttributes.find((dateAttribute) =>
                areObjRefsEqual(dateAttribute.ref, attribute),
            );
            if (dateItem) {
                return {
                    isDate: true,
                    title: dateItem.title,
                };
            }
            return undefined;
        })
        .filter((attribute) => !!attribute);
