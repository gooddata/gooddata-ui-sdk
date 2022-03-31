// (C) 2019-2020 GoodData Corporation

/**
 * Type representing catalog item type - attribute, measure, fact or dateDataset
 *
 * @public
 */
export type CatalogItemType = "attribute" | "measure" | "fact" | "dateDataset";

/**
 * Properties contained in each catalog item
 *
 * @public
 */
export interface ICatalogItemBase {
    type: CatalogItemType;
}
