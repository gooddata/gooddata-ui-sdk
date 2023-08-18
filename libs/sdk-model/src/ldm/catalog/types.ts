// (C) 2019-2020 GoodData Corporation

/**
 * Type representing catalog item type - attribute, measure, fact, dateDataset or attributeHierarchy
 *
 * @public
 */
export type CatalogItemType = "attribute" | "measure" | "fact" | "dateDataset" | "attributeHierarchy";

/**
 * Properties contained in each catalog item
 *
 * @public
 */
export interface ICatalogItemBase {
    type: CatalogItemType;
}
