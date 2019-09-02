// (C) 2019 GoodData Corporation

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type Identifier = string;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjUriQualifier {
    uri: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjIdentifierQualifier {
    identifier: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjLocalIdentifierQualifier {
    localIdentifier: Identifier;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier | IObjLocalIdentifierQualifier;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "med";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface ITotal {
    type: TotalType;
    measureIdentifier: string;
    attributeIdentifier: string;
    alias?: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface INativeTotalItem {
    nativeTotal: {
        measureIdentifier: Identifier;
        attributeIdentifiers: Identifier[];
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeSortItem {
    attributeSortItem: {
        direction: SortDirection;
        attributeIdentifier: Identifier;
        aggregation?: "sum";
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type SortItem = IAttributeSortItem | IMeasureSortItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IMeasureSortItem {
    measureSortItem: {
        direction: SortDirection;
        locators: LocatorItem[];
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element: string;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: Identifier;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IResultSpec {
    dimensions?: IDimension[];
    sorts?: SortItem[];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotal[];
}
