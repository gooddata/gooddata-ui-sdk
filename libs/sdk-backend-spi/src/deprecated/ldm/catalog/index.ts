// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Type representing catalog item - attribute, measure, fact or dateDataset
 * @deprecated Use {@link @gooddata/sdk-model#CatalogItem}
 * @public
 */
export type CatalogItem = m.CatalogItem;

/**
 * Get metadata object that catalog item represents
 * @param catalogItem - catalog item
 * @returns metadata object
 * @deprecated Use {@link @gooddata/sdk-model#catalogItemMetadataObject}
 * @public
 */
export const catalogItemMetadataObject = m.catalogItemMetadataObject;

/**
 * Type representing groupable catalog item - attribute, measure or fact
 * @deprecated Use {@link @gooddata/sdk-model#GroupableCatalogItem}
 * @public
 */
export type GroupableCatalogItem = m.GroupableCatalogItem;

export { CatalogItemType, ICatalogItemBase } from "./types";
export { ICatalogAttribute, isCatalogAttribute } from "./attribute";
export { ICatalogMeasure, isCatalogMeasure } from "./measure";
export { ICatalogFact, isCatalogFact } from "./fact";
export { ICatalogDateDataset, ICatalogDateAttribute, isCatalogDateDataset } from "./dateDataset";
export { ICatalogGroup, IGroupableCatalogItemBase } from "./group";
