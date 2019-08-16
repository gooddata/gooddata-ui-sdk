// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from './ExtendedDateFilters';

export namespace DashboardExport {
    export type RelativeType = 'relative';
    export type AbsoluteType = 'absolute';
    export type DateFilterType = RelativeType | AbsoluteType;

    export interface IAttributeFilter {
        attributeFilter: {
            displayForm: string;
            negativeSelection: boolean;
            attributeElements: string[];
        };
    }

    export interface IDateFilter {
        dateFilter: {
            type: DateFilterType;
            granularity: ExtendedDateFilters.DateFilterGranularity;
            from?: ExtendedDateFilters.DateString | number;
            to?: ExtendedDateFilters.DateString | number;
            dataSet?: string;
            attribute?: string;
        };
    }

    export type FilterContextItem = IAttributeFilter | IDateFilter;
}
