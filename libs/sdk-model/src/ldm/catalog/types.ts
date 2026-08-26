// (C) 2019-2026 GoodData Corporation

/**
 * Type representing catalog item type - attribute, measure, fact, dateDataset, attributeHierarchy
 * or computedAttribute
 *
 * @public
 */
export type CatalogItemType =
    | "attribute"
    | "measure"
    | "fact"
    | "dateDataset"
    | "attributeHierarchy"
    | "computedAttribute";

/**
 * Properties contained in each catalog item
 *
 * @public
 */
export interface ICatalogItemBase {
    type: CatalogItemType;
}
