// (C) 2019 GoodData Corporation

/**
 * Type representing catalog item type - attribute, measure, fact, dateDataset or dataset
 *
 * @public
 */
export type CatalogItemType = "attribute" | "measure" | "fact"; // TODO: "dateDataset" | 'dataset';

/**
 * Catalog group can be used to group catalog items
 *
 * @public
 */
export interface ICatalogGroup {
    readonly title: string;
    readonly identifier: string;
}

/**
 * Properties contained in each catalog item
 *
 * @internal
 */
export interface ICatalogItemBase {
    readonly type: CatalogItemType;
    readonly title: string;
    readonly identifier: string;
    readonly summary: string;
    readonly production: boolean;
    readonly groups: string[];
}

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogAttribute extends ICatalogItemBase {
    readonly type: "attribute";
    readonly defaultDisplayForm: string;
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogAttribute.
 *
 * @public
 */
export function isCatalogAttribute(item: CatalogItem): item is ICatalogAttribute {
    return item.type === "attribute";
}

/**
 * Type representing catalog measure
 *
 * @public
 */
export interface ICatalogMeasure extends ICatalogItemBase {
    readonly type: "measure";
    readonly expression: string;
    readonly format: string;
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogMeasure.
 *
 * @public
 */
export function isCatalogMeasure(item: CatalogItem): item is ICatalogMeasure {
    return item.type === "measure";
}

/**
 * Type representing catalog fact
 *
 * @public
 */
export interface ICatalogFact extends ICatalogItemBase {
    readonly type: "fact";
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogFact.
 *
 * @public
 */
export function isCatalogFact(item: CatalogItem): item is ICatalogFact {
    return item.type === "fact";
}

/**
 * Type representing catalog item - attribute, measure, fact // TODO: dateDataset or dataset
 *
 * @public
 */
export type CatalogItem = ICatalogAttribute | ICatalogMeasure | ICatalogFact;
