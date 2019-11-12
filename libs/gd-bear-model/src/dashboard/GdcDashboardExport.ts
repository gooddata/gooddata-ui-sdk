// (C) 2019 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";

/**
 * @internal
 */
export namespace GdcDashboardExport {
    export type RelativeType = "relative";
    export type AbsoluteType = "absolute";
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
            granularity: GdcExtendedDateFilters.DateFilterGranularity;
            from?: GdcExtendedDateFilters.DateString | number;
            to?: GdcExtendedDateFilters.DateString | number;
            dataSet?: string;
            attribute?: string;
        };
    }

    export type FilterContextItem = IAttributeFilter | IDateFilter;

    export function isDateFilter(filter: FilterContextItem): filter is IDateFilter {
        return !isEmpty(filter) && !!(filter as IDateFilter).dateFilter;
    }

    export function isAttributeFilter(filter: FilterContextItem): filter is IAttributeFilter {
        return !isEmpty(filter) && !!(filter as IAttributeFilter).attributeFilter;
    }
}
