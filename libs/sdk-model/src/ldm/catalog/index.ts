// (C) 2019-2020 GoodData Corporation
import { ICatalogAttribute, isCatalogAttribute } from "./attribute/index.js";
import { ICatalogMeasure, isCatalogMeasure } from "./measure/index.js";
import { ICatalogFact, isCatalogFact } from "./fact/index.js";
import { ICatalogDateDataset } from "./dateDataset/index.js";
import { MetadataObject } from "../metadata/index.js";

/**
 * Type representing catalog item - attribute, measure, fact or dateDataset
 *
 * @public
 */
export type CatalogItem = ICatalogAttribute | ICatalogMeasure | ICatalogFact | ICatalogDateDataset;

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

export { CatalogItemType, ICatalogItemBase } from "./types.js";
export { ICatalogAttribute, isCatalogAttribute } from "./attribute/index.js";
export { ICatalogMeasure, isCatalogMeasure } from "./measure/index.js";
export { ICatalogFact, isCatalogFact } from "./fact/index.js";
export { ICatalogDateDataset, ICatalogDateAttribute, isCatalogDateDataset } from "./dateDataset/index.js";
export { ICatalogGroup, IGroupableCatalogItemBase } from "./group/index.js";
