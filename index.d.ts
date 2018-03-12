// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.
import { AFM, Execution, VisualizationObject } from '@gooddata/typings';

export type SortDirection = 'asc' | 'desc';

export interface IAccountInfo {
    login: string;
    loginMD5: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    profileUri: string;
}

export interface IUser {
    isLoggedIn(): Promise<boolean>;

    login(username: string, password: string): Promise<any>;

    logout(): Promise<void>;

    updateProfileSettings(profileId: string, profileSettings: any): Promise<any>;

    getAccountInfo(): Promise<IAccountInfo>;

    getFeatureFlags(): Promise<any>;
}

export interface IIdentifierUriPair {
    identifier: string;
    uri: string;
}

export interface IValidElementsOptions {
    limit?: number;
    offset?: number;
    order?: SortDirection;
    filter?: string;
    prompt?: string;
    uris?: string[];
    complement?: boolean;
    includeTotalCountWithoutFilters?: boolean;
    restrictiveDefinition?: string;
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

export interface IMetadata {
    getObjects<T>(projectId: string, objectUris: string[]): Promise<T>;

    getObjectsByQuery<T>(projectId: string, options: { category?: string, mode?: string, author?: string, limit?: number }): Promise<T>;

    getObjectUsing<T>(projectId: string, uri: string, options?: { types?: string[], nearest?: boolean }): T;

    getObjectUsingMany<T>(projectId: string, uris: string[], options?: { types?: string[], nearest?: boolean }): T;

    getAttribute(projectId: string): Promise<any>;

    getVisualizations(projectId: string): Promise<any>;

    getDimensions(projectId: string): Promise<any>;

    getFacts(projectId: string): Promise<any>;

    getMetrics(projectId: string): Promise<any>;

    getFolders(projectId: string, type: string): Promise<any>;

    getAvailableMetrics(projectId: string, attributes: string[]): Promise<any>;

    getAvailableAttributes(projectId: string, metrics: string[]): Promise<any>;

    getAvailableFacts(projectId: string, items: string[]): Promise<any>;

    getObjectDetails<T>(uri: string): Promise<T>;

    getFoldersWithItems(projectId: string, type: string): Promise<any>;

    getObjectIdentifier(uri: string): Promise<string>;

    getObjectUri(projectId: string, identifier: string): Promise<string>;

    getUrisFromIdentifiers(projectId: string, identifiers: string[]): Promise<IIdentifierUriPair[]>;

    getIdentifiersFromUris(projectId: string, uris: string[]): Promise<IIdentifierUriPair[]>;

    translateElementLabelsToUris(projectId: string, labelUri: string, patterns: string[], mode: 'EXACT' | 'WILD'): Promise<any>

    getValidElements(projectId: string, id: string, options: IValidElementsOptions): Promise<IValidElementsResponse>;

    deleteObject(uri: string): Promise<any>;

    createObject<T>(projectId: string, obj: T): Promise<T>;

    ldmManage(projectId: string, maql: string, options: { maxAttempts?: number, pollStep?: number }): Promise<any>;

    etlPull(projectId: string, uploadsDir: string, options: { maxAttempts?: number, pollStep?: number }): Promise<any>;
}

export interface IConfig {
    setCustomDomain(d: string): void;

    getCustomDomain(): string;

    setJsPackage(name: string, version: string): void;

    getJsPackage(): { name: string, version: string };

    setRequestHeader(key: string, value: string): void;

    getRequestHeader(key: string): string;
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

export interface ICatalogue {
    loadItems(projectId: string, options: ILoadCatalogOptions): Promise<any>;

    loadDateDataSets(projectId: string, options: ILoadDateDataSetOptions): Promise<any>;
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

export interface IExecution {
    getDataForVis(projectId: string, mdObj: IVisualizationObjectContent, settings: any): Promise<ISimpleExecutorResult>;

    getData(projectId: string, columns: string[], executionConfiguration: IExecutionConfiguration, settings: any): Promise<ISimpleExecutorResult>;

    executeAfm(projectId: string, execution: AFM.IExecution): Promise<Execution.IExecutionResponses>;
}

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export interface IProject {
    getCurrentProjectId(): Promise<string>;

    getProjects(profileId: string): Promise<string>;

    getDatasets(projectId: string): Promise<any>;

    getColorPalette(projectId: string): Promise<IColor[]>;

    setColorPalette(projectId: string, colors: IColor[]): Promise<void>;

    getTimezone(projectId: string): Promise<string>;

    setTimezone(projectId: string, timezone: string): Promise<void>;

    createProject(title: string, authorizationToken: string, options?: object): Promise<any>;

    deleteProject(projectId: string): Promise<void>;
}

export interface IUtils {
    loadAttributesMap(projectId: string, attributeDisplayFormUris: string[]): Promise<any>;

    getAttributesDisplayForms(mdObject: VisualizationObject.IVisualizationObject): string[];
}

export interface IXhrMockInBeforeSend {
    setRequestHeader(key: string, value: string): void;
}

export interface IXhrSettings {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    data?: any;
    beforeSend?(xhr: IXhrMockInBeforeSend, url: string): void;
}

export interface IXhr {
    get<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    post<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    put<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    ajax<T>(uri: string, settings?: IXhrSettings): Promise<T>;
    ajaxSetup(settings: IXhrSettings): void;
}

export interface ISdk { // TODO extends Clonable?
    xhr: IXhr;
    project: IProject;
    execution: IExecution;
    catalogue: ICatalogue;
    config: IConfig;
    md: IMetadata;
    user: IUser;
    clone(): ISdk;
    utils: IUtils;
}

export interface ISdkOptions {
    domain?: string;
}

export declare function factory(options?: ISdkOptions): ISdk;
