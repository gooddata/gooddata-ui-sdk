// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IVisualizationObjectContent } from "../visualizationObject/GdcVisualizationObject.js";

/**
 * @public
 */
export type CatalogItemType = "attribute" | "metric" | "fact" | "attributeHierarchy";

/**
 * @public
 */
export interface ICatalogGroup {
    readonly title: string;
    readonly identifier: string;
}

/**
 * @public
 */
export interface ICatalogItemBase {
    readonly type: CatalogItemType;
    readonly title: string;
    readonly identifier: string;
    readonly summary: string;
    readonly production: boolean;
    readonly groups?: string[];
    readonly links: {
        self: string;
    };
}

/**
 * @public
 */
export interface ICatalogAttribute extends ICatalogItemBase {
    readonly type: "attribute";
    readonly links: {
        readonly self: string;
        readonly defaultDisplayForm: string;
        readonly geoPinDisplayForms?: string[];
    };
}

/**
 * @public
 */
export function isCatalogAttribute(obj: unknown): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}

/**
 * @public
 */
export interface ICatalogMetric extends ICatalogItemBase {
    readonly type: "metric";
    readonly expression: string;
    readonly format: string;
}

/**
 * @public
 */
export function isCatalogMetric(obj: unknown): obj is ICatalogMetric {
    return !isEmpty(obj) && (obj as ICatalogMetric).type === "metric";
}

/**
 * @public
 */
export interface ICatalogFact extends ICatalogItemBase {
    readonly type: "fact";
}

/**
 * @public
 */
export function isCatalogFact(obj: unknown): obj is ICatalogFact {
    return !isEmpty(obj) && (obj as ICatalogFact).type === "fact";
}

/**
 * @public
 */
export type CatalogItem = ICatalogAttribute | ICatalogMetric | ICatalogFact;

/**
 * @public
 */
export interface IStoredItemDescription {
    uri: string;
}

/**
 * @public
 */
export interface IAdHocItemDescription {
    expression: string;
}

/**
 * @public
 */
export type ItemDescription = IStoredItemDescription | IAdHocItemDescription;

/**
 * @public
 */
export interface IColumnsAndDefinitions {
    columns: string[];
    definitions: Array<{
        metricDefinition: {
            identifier: string;
            uri: string;
        };
    }>;
}

/**
 * request params for GET /gdc/internal/projects/$\{projectId\}/catalog/items
 * @public
 */
export interface ILoadCatalogItemsParams {
    readonly types?: CatalogItemType[];
    readonly offset?: number;
    readonly limit?: number;
    readonly includeWithTags?: string[];
    readonly excludeWithTags?: string[];
    readonly production?: 1 | 0;
    readonly csvDataSets?: string[]; // dataSet identifiers
}

/**
 * response for GET /gdc/internal/projects/$\{projectId\}/catalog/items
 * @public
 */
export interface ILoadCatalogItemsResponse {
    catalogItems: {
        items: CatalogItem[];
        paging: {
            offset: number;
            limit: number;
        };
    };
}

/**
 * request params for GET /gdc/internal/projects/$\{projectId\}/catalog/groups
 * @public
 */
export interface ILoadCatalogGroupsParams {
    readonly includeWithTags?: string[];
    readonly excludeWithTags?: string[];
    readonly production?: 1 | 0;
    readonly csvDataSets?: string[];
}

/**
 * response for GET /gdc/internal/projects/$\{projectId\}/catalog/groups
 * @public
 */
export interface ILoadCatalogGroupsResponse {
    catalogGroups: ICatalogGroup[];
}

/**
 * request params for POST /gdc/internal/projects/$\{projectId\}/catalog/query
 * @public
 */
export interface ILoadAvailableCatalogItemsParams {
    catalogQueryRequest: {
        bucketItems: ItemDescription[];
        types?: CatalogItemType[];
    };
}

/**
 * response for POST /gdc/internal/projects/$\{projectId\}/catalog/query
 * @public
 */
export interface ILoadAvailableCatalogItemsResponse {
    catalogAvailableItems: {
        // uris of available items
        items: string[];
    };
}

/**
 * @public
 */
export interface ILoadDateDataSetsParams {
    bucketItems?: IVisualizationObjectContent;
    excludeObjectsWithTags?: string[];
    includeObjectsWithTags?: string[];
    dataSetIdentifier?: string;
    includeAvailableDateAttributes?: boolean;
    includeUnavailableDateDataSetsCount?: boolean;
    returnAllDateDataSets?: boolean;
    returnAllRelatedDateDataSets?: boolean;
    attributesMap?: Record<string, unknown>;
    includeDateGranularities?: string[];
}
