// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.
import { AFM, Execution } from '@gooddata/typings';

export type SortDirection = 'asc' | 'desc';

export interface IAccountInfo {
    login: string;
    loginMD5: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    profileUri: string;
}

export module user {
    export function isLoggedIn(): Promise<boolean>;

    export function login(username: string, password: string): Promise<any>;

    export function logout(): Promise<void>;

    export function updateProfileSettings(profileId: string, profileSettings: any): Promise<any>;

    export function getAccountInfo(): Promise<IAccountInfo>;

    export function getFeatureFlags(): Promise<any>;
}

export interface IIdentifierUriPair {
    identifier: string;
    uri: string;
}

export interface IValidElementsOptions {
    limit: number;
    offset: number;
    order: SortDirection;
    filter: string;
    prompt: string;
    uris: string[];
    complement: boolean;
    includeTotalCountWithoutFilters: boolean;
    restrictiveDefinition: string;
}

export interface IElement {
    element: {
        uri: string;
        title: string;
    };
}

export interface IValidElementsResponse {
    validElements: {
        items: IElement[];
        paging: {
            count: number;
            offset: string;
            total: string;
        };
        elementsMeta: {
            attribute: string;
            attributeDisplayForm: string;
            filter: string;
            order: SortDirection;
        };
    }
}

export module md {
    export function getObjects<T>(projectId: string, objectUris: string[]): Promise<T>;

    export function getObjectsByQuery<T>(projectId: string, options: { category?: string, mode?: string, author?: string, limit?: number }): Promise<T>;

    export function getObjectUsing<T>(projectId: string, uri: string, options?: { types?: string[], nearest?: boolean }): T;

    export function getObjectUsingMany<T>(projectId: string, uris: string[], options?: { types?: string[], nearest?: boolean }): T;

    export function getAttribute(projectId: string): Promise<any>;

    export function getVisualizations(projectId: string): Promise<any>;

    export function getDimensions(projectId: string): Promise<any>;

    export function getFacts(projectId: string): Promise<any>;

    export function getMetrics(projectId: string): Promise<any>;

    export function getFolders(projectId: string, type: string): Promise<any>;

    export function getAvailableMetrics(projectId: string, attributes: string[]): Promise<any>;

    export function getAvailableAttributes(projectId: string, metrics: string[]): Promise<any>;

    export function getAvailableFacts(projectId: string, items: string[]): Promise<any>;

    export function getObjectDetails<T>(uri: string): Promise<T>;

    export function getFoldersWithItems(projectId: string, type: string): Promise<any>;

    export function getObjectIdentifier(uri: string): Promise<string>;

    export function getObjectUri(projectId: string, identifier: string): Promise<string>;

    export function getUrisFromIdentifiers(projectId: string, identifiers: string[]): Promise<IIdentifierUriPair[]>;

    export function getIdentifiersFromUris(projectId: string, uris: string[]): Promise<IIdentifierUriPair[]>;

    export function translateElementLabelsToUris(projectId: string, labelUri: string, patterns: string[], mode: 'EXACT' | 'WILD'): Promise<any>

    export function getValidElements(projectId: string, id: string, options: IValidElementsOptions): Promise<IValidElementsResponse>;

    export function deleteObject(uri: string): Promise<any>;

    export function createObject<T>(projectId: string, obj: T): Promise<T>;

    export function ldmManage(projectId: string, maql: string, options: { maxAttempts?: number, pollStep?: number }): Promise<any>;

    export function etlPull(projectId: string, uploadsDir: string, options: { maxAttempts?: number, pollStep?: number }): Promise<any>;
}

export module config {
    export function setCustomDomain(d: string): void;
}

export interface ILoadCatalogOptions {
    bucketItems: IVisualizationObjectContent;
    excludeObjectsWithTags?: string[];
    filter?: string;
    includeObjectsWithTags?: string[];
    paging?: {
        limit: number;
        offset: number;
    };
    types?: string[];
}

export interface ILoadDateDataSetOptions {
    bucketItems: IVisualizationObjectContent;
    dataSetIdentifier?: string;
    excludeObjectsWithTags?: string[];
    includeAvailableDateAttributes?: boolean;
    includeObjectsWithTags?: string[];
    includeUnavailableDateDataSetsCount?: boolean;
    returnAllDateDataSets?: boolean;
    returnAllRelatedDateDataSets?: boolean;
}

export module catalogue {
    export function loadItems(projectId: string, options: ILoadCatalogOptions): Promise<any>;

    export function loadDateDataSets(projectId: string, options: ILoadDateDataSetOptions): Promise<any>;
}

export interface ISort {
    column: string;
    direction: string;
}

export interface IMetricDefinition {
    expression: string;
    format?: string;
    identifier: string;
    title?: string;
}

export interface IDefinition {
    metricDefinition: IMetricDefinition;
}

export interface IExecutionConfiguration {
    definitions?: IDefinition[];
    filters?: any[];
    orderBy?: ISort[];
    where?: {
        [key: string]: any;
    }
}

export interface IAttributeHeader {
    id: string;
    title: string;
    type: 'attrLabel';
    uri: string;
}

export interface IMetricHeader {
    format?: string;
    id: string;
    title: string;
    type: 'metric';
    uri?: string;
}

export type Header = IAttributeHeader | IMetricHeader;

export type WarningParameterType = boolean | number | string | null;

export interface ISimpleExecutorWarning {
    errorCode: string;
    message: string;
    parameters: WarningParameterType[];
}

export type MetricValue = string;

export interface IAttributeValue {
    id: string;
    name: string;
}

export type ResultDataType = MetricValue | IAttributeValue;

export interface ISimpleExecutorResult {
    headers?: Header[];
    isEmpty?: boolean;
    isLoaded?: boolean;
    rawData?: ResultDataType[][];
    warnings?: ISimpleExecutorWarning[];
}

export type EmbeddedFilter = IEmbeddedDateFilter | IEmbeddedListAttributeFilter;

export type EmbeddedDateFilterType = 'relative' | 'absolute';

export interface IEmbeddedDateFilter {
    dateFilter: {
        attribute?: string;
        dataset?: string;
        dimension?: string;
        from?: string | number;
        granularity: string;
        to?: string | number;
        type: EmbeddedDateFilterType;
    };
}

export interface IEmbeddedListAttributeFilter {
    listAttributeFilter: {
        attribute: string;
        displayForm: string;
        'default': {
            attributeElements: string[];
            negativeSelection: boolean;
        }
    };
}

export interface IMeasureSort {
    direction: SortDirection;
    sortByPoP?: boolean;
}

export type VisualizationStyleType = 'common' | 'table' | 'line' | 'column' | 'bar';

export interface IVisualizationStyle {
    visualizationStyle: {
        type: VisualizationStyleType;
        colorPalette: {
            measure?: {
                color: string;
                periodOverPeriod: string;
            }

            stack?: any
        }
    };
}

export type MeasureType = 'metric' | 'fact' | 'attribute';
export type MeasureAggregation = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'runsum';

export interface IMeasure {
    measure: {
        aggregation?: MeasureAggregation;
        format?: string;
        generatedId?: string
        measureFilters: EmbeddedFilter[];
        objectUri: string;
        showInPercent: boolean;
        showPoP: boolean;
        sort?: IMeasureSort;
        styles?: IVisualizationStyle[];
        title: string;
        type: MeasureType;
    };
}

export type CategoryType = 'attribute' | 'date';

export interface ICategory {
    category: {
        attribute?: string;
        collection: CategoryCollection;
        displayForm: string;
        sort?: SortDirection;
        styles?: IVisualizationStyle[];
        type: CategoryType;
    };
}

export type CategoryCollection = 'attribute' | 'stack' | 'view' | 'trend' | 'segment';

export type VisualizationType = 'table' | 'line' | 'column' | 'bar' | 'pie' | 'doughnut' | 'combo';

export interface IBuckets {
    categories: ICategory[];
    filters: EmbeddedFilter[];
    measures: IMeasure[];
}

export interface IVisualizationObjectContent {
    buckets: IBuckets;
    type: VisualizationType;
}

export interface IVisualizationObject {
    visualization: {
        content: IVisualizationObjectContent;
        meta: {
            author?: string;
            category?: string;
            contributor?: string;
            created?: Date;
            deprecated?: boolean;
            identifier?: string;
            isProduction?: boolean;
            locked?: boolean;
            projectTemplate?: string;
            sharedWithSomeone?: boolean;
            summary?: string;
            tags?: string;
            title: string;
            unlisted?: boolean;
            updated?: Date;
            uri?: string;
        };
    }
}

export module execution {
    export function getDataForVis(projectId: string, mdObj: IVisualizationObjectContent, settings: any): Promise<ISimpleExecutorResult>;

    export function getData(projectId: string, columns: string[], executionConfiguration: IExecutionConfiguration, settings: any): Promise<ISimpleExecutorResult>;

    export function executeAfm(projectId: string, execution: AFM.IExecution): Promise<Execution.IExecutionResponses>;
}

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export module project {
    export function getCurrentProjectId(): Promise<string>;

    export function getProjects(profileId: string): Promise<string>;

    export function getDatasets(projectId: string): Promise<any>;

    export function getColorPalette(projectId: string): Promise<IColor[]>;

    export function setColorPalette(projectId: string, colors: IColor[]): Promise<void>;

    export function getTimezone(projectId: string): Promise<string>;

    export function setTimezone(projectId: string, timezone: string): Promise<void>;

    export function createProject(title: string, authorizationToken: string, options?: object): Promise<any>;

    export function deleteProject(projectId: string): Promise<void>;
}

export interface IXhrSettings {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    data?: any;
}

export module xhr {
    export function get<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    export function post<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    export function put<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    export function ajax<T>(uri: string, settings?: IXhrSettings): Promise<T>;
}
