// (C) 2007-2018 GoodData Corporation
export type SortDirection = 'asc' | 'desc';

export type EmbeddedFilter = IEmbeddedDateFilter | IEmbeddedListAttributeFilter;

export type EmbeddedDateFilterType = 'relative' | 'absolute';

export interface IEmbeddedDateFilter {
    dateFilter: {
        type: EmbeddedDateFilterType;
        from?: string | number;
        to?: string | number;
        granularity: string;
        attribute?: string;
        dataset?: string;
        dimension?: string;
    };
}

export interface IEmbeddedListAttributeFilter {
    listAttributeFilter: {
        attribute?: string;
        displayForm: string;
        'default': {
            negativeSelection: boolean;
            attributeElements: string[];
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
        type: MeasureType;
        aggregation?: MeasureAggregation;
        objectUri: string;
        showInPercent: boolean;
        showPoP: boolean;
        title: string;
        measureFilters: EmbeddedFilter[];
        format?: string;
        sort?: IMeasureSort;
        styles?: IVisualizationStyle[];
        localIdentifier?: string; // Used only in AD,
        alias?: string;
    };
}

export type CategoryType = 'attribute' | 'date';

export interface ICategory {
    category: {
        type: CategoryType;
        collection: CategoryCollection;
        displayForm: string;
        attribute?: string;
        sort?: SortDirection;
        styles?: IVisualizationStyle[];
        localIdentifier?: string; // Used only in AD,
        alias?: string;
    };
}

export type CategoryCollection = 'attribute' | 'stack' | 'view' | 'trend' | 'segment';

export type VisualizationType = 'table' | 'line' | 'column' | 'bar' | 'pie' | 'doughnut' | 'combo';

export interface IVisualizationObject {
    meta: IVisualizationObjectMeta;
    content: IVisualizationObjectContent;
}

export interface IVisualization {
    visualization: IVisualizationObject;
}

export interface IVisualizationObjectResponse {
    visualization: IVisualizationObject;
}

export interface IBuckets {
    measures: IMeasure[];
    categories: ICategory[];
    filters: EmbeddedFilter[];
    totals?: IVisualizationTotal[];
}

export type TotalType = 'sum' | 'max' | 'min' | 'avg' | 'med' | 'nat';

export interface IVisualizationTotal {
    total: {
        type: TotalType;
        outputMeasureIndexes: number[];
        alias?: string;
    };
}

export interface IVisualizationObjectMeta {
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
}

export interface IVisualizationObjectContent {
    type: VisualizationType;
    buckets: IBuckets;
}

export interface IAttributesMap {
    [x: string]: string;
}

export interface IVisualizationMetadataResult {
    metadata: IVisualizationObject;
}

export function isEmbeddedDateFilter(dateFilter: EmbeddedFilter): dateFilter is IEmbeddedDateFilter { // TODO unused
    return (dateFilter as IEmbeddedDateFilter).dateFilter !== undefined;
}
