// (C) 2019-2026 GoodData Corporation

import { type ICatalogAttribute, isCatalogAttribute } from "./attribute/index.js";
import { type ICatalogAttributeHierarchy, isCatalogAttributeHierarchy } from "./attributeHierarchy/index.js";
import { type ICatalogDateDataset } from "./dateDataset/index.js";
import { type ICatalogFact, isCatalogFact } from "./fact/index.js";
import { type ICatalogMeasure, isCatalogMeasure } from "./measure/index.js";
import { type MetadataObject } from "../metadata/index.js";

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
