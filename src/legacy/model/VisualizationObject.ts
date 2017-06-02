export type SortDirection = 'asc' | 'desc';

export type EmbeddedFilter = IEmbeddedDateFilter | IEmbeddedListAttributeFilter;

export interface IEmbeddedDateFilter {
    dateFilter: {
        type: 'relative' | 'absolute';
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
        attribute: string;
        displayForm: string;
        'default': {
            negativeSelection: boolean;
            attributeElements: string[];
        }
    };
}

export interface IMeasureSort {
    direction: SortDirection;
    sortByPoP: boolean;
}

export interface IVisualizationStyle {
    visualizationStyle: {
        type: 'common' | 'table' | 'line' | 'column' | 'bar';
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

export interface IMeasure {
    measure: {
        type: MeasureType;
        aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'runsum';
        objectUri: string;
        showInPercent: boolean;
        showPoP: boolean;
        title: string;
        measureFilters: IEmbeddedListAttributeFilter[];
        format?: string;
        sort?: IMeasureSort;
        styles?: IVisualizationStyle[];
    };
}

export interface ICategory {
    category: {
        type: 'attribute' | 'date';
        collection: CategoryCollection;
        displayForm: string;
        attribute?: string;
        sort?: SortDirection;
        styles?: IVisualizationStyle[];
    };
}

export type CategoryCollection = 'attribute' | 'stack' | 'view' | 'trend' | 'segment';

export type VisualizationType = 'table' | 'line' | 'column' | 'bar';

export interface IVisualizationObject {
    type: VisualizationType;

    buckets: {
        measures: IMeasure[];
        categories: ICategory[];
        filters: EmbeddedFilter[];
    };
}
