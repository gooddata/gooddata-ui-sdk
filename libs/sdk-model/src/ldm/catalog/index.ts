// (C) 2019-2025 GoodData Corporation
import { ICatalogAttribute, isCatalogAttribute } from "./attribute/index.js";
import { ICatalogAttributeHierarchy, isCatalogAttributeHierarchy } from "./attributeHierarchy/index.js";
import { ICatalogDateDataset } from "./dateDataset/index.js";
import { ICatalogFact, isCatalogFact } from "./fact/index.js";
import { ICatalogMeasure, isCatalogMeasure } from "./measure/index.js";
import { MetadataObject } from "../metadata/index.js";

/**
 * Type representing catalog item - attribute, measure, fact or dateDataset
 *
 * @public
 */
export type CatalogItem =
    | ICatalogAttribute
    | ICatalogMeasure
    | ICatalogFact
    | ICatalogDateDataset
    | ICatalogAttributeHierarchy;

/**
 * Get metadata object that catalog item represents
 *
 * @param catalogItem - catalog item
 * @returns metadata object
 * @public
 */
export const catalogItemMetadataObject = (catalogItem: CatalogItem): MetadataObject => {
    let item: MetadataObject;

    if (isCatalogAttribute(catalogItem)) {
        item = catalogItem.attribute;
    } else if (isCatalogMeasure(catalogItem)) {
        item = catalogItem.measure;
    } else if (isCatalogFact(catalogItem)) {
        item = catalogItem.fact;
    } else if (isCatalogAttributeHierarchy(catalogItem)) {
        item = catalogItem.attributeHierarchy;
    } else {
        item = catalogItem.dataSet;
    }

    if (!item) {
        throw new Error("Catalog metadata item not found!");
    }

    return item;
};

/**
 * Type representing groupable catalog item - attribute, measure or fact
 *
 * @public
 */
export type GroupableCatalogItem = ICatalogAttribute | ICatalogMeasure | ICatalogFact;

export type { CatalogItemType, ICatalogItemBase } from "./types.js";
export type { ICatalogAttribute } from "./attribute/index.js";
export { isCatalogAttribute } from "./attribute/index.js";
export type { ICatalogMeasure } from "./measure/index.js";
export { isCatalogMeasure } from "./measure/index.js";
export type { ICatalogFact } from "./fact/index.js";
export { isCatalogFact } from "./fact/index.js";
export type { ICatalogDateDataset, ICatalogDateAttribute } from "./dateDataset/index.js";
export { isCatalogDateDataset, isCatalogDateAttribute } from "./dateDataset/index.js";
export type { ICatalogGroup, IGroupableCatalogItemBase } from "./group/index.js";
export type {
    ICatalogAttributeHierarchy,
    ICatalogDateAttributeHierarchy,
} from "./attributeHierarchy/index.js";
export {
    isCatalogAttributeHierarchy,
    isCatalogDateAttributeHierarchy,
    getHierarchyRef,
    getHierarchyTitle,
    getHierarchyAttributes,
} from "./attributeHierarchy/index.js";
