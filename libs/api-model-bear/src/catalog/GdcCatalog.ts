// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { GdcVisualizationObject } from "../visualizationObject/GdcVisualizationObject";

/**
 *
 * @public
 */
export namespace GdcCatalog {
    export type CatalogItemType = "attribute" | "metric" | "fact";

    export interface ICatalogGroup {
        readonly title: string;
        readonly identifier: string;
    }

    interface ICatalogItemBase {
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

    export interface ICatalogAttribute extends ICatalogItemBase {
        readonly type: "attribute";
        readonly links: {
            readonly self: string;
            readonly defaultDisplayForm: string;
            readonly geoPinDisplayForms?: string[];
        };
    }

    export function isCatalogAttribute(obj: unknown): obj is ICatalogAttribute {
        return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
    }

    export interface ICatalogMetric extends ICatalogItemBase {
        readonly type: "metric";
        readonly expression: string;
        readonly format: string;
    }

    export function isCatalogMetric(obj: unknown): obj is ICatalogMetric {
        return !isEmpty(obj) && (obj as ICatalogMetric).type === "metric";
    }

    export interface ICatalogFact extends ICatalogItemBase {
        readonly type: "fact";
    }

    export function isCatalogFact(obj: unknown): obj is ICatalogFact {
        return !isEmpty(obj) && (obj as ICatalogFact).type === "fact";
    }

    export type CatalogItem = ICatalogAttribute | ICatalogMetric | ICatalogFact;

    export type ItemDescription = { uri: string } | { expression: string };

    export interface IColumnsAndDefinitions {
        columns: string[];
        definitions: Array<{
            metricDefinition: {
                identifier: string;
                uri: string;
            };
        }>;
    }

    // request params for GET /gdc/internal/projects/${projectId}/catalog/items
    export interface ILoadCatalogItemsParams {
        readonly types?: CatalogItemType[];
        readonly offset?: number;
        readonly limit?: number;
        readonly includeWithTags?: string[];
        readonly excludeWithTags?: string[];
        readonly production?: 1 | 0;
        readonly csvDataSets?: string[]; // dataSet identifiers
    }

    // response for GET /gdc/internal/projects/${projectId}/catalog/items
    export interface ILoadCatalogItemsResponse {
        catalogItems: {
            items: CatalogItem[];
            paging: {
                offset: number;
                limit: number;
            };
        };
    }

    // request params for GET /gdc/internal/projects/${projectId}/catalog/groups
    export interface ILoadCatalogGroupsParams {
        readonly includeWithTags?: string[];
        readonly excludeWithTags?: string[];
        readonly production?: 1 | 0;
        readonly csvDataSets?: string[];
    }

    // response for GET /gdc/internal/projects/${projectId}/catalog/groups
    export interface ILoadCatalogGroupsResponse {
        catalogGroups: ICatalogGroup[];
    }

    // request params for POST /gdc/internal/projects/${projectId}/catalog/query
    export interface ILoadAvailableCatalogItemsParams {
        catalogQueryRequest: {
            bucketItems: ItemDescription[];
            types?: CatalogItemType[];
        };
    }

    // response for POST /gdc/internal/projects/${projectId}/catalog/query
    export interface ILoadAvailableCatalogItemsResponse {
        catalogAvailableItems: {
            // uris of available items
            items: string[];
        };
    }

    export interface ILoadDateDataSetsParams {
        bucketItems?: GdcVisualizationObject.IVisualizationObjectContent;
        excludeObjectsWithTags?: string[];
        includeObjectsWithTags?: string[];
        dataSetIdentifier?: string;
        includeAvailableDateAttributes?: boolean;
        includeUnavailableDateDataSetsCount?: boolean;
        returnAllDateDataSets?: boolean;
        returnAllRelatedDateDataSets?: boolean;
        attributesMap?: object;
    }
}
