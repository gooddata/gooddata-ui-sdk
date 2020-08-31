// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { GdcExtendedDateFilters } from "../extendedDateFilters/GdcExtendedDateFilters";
import { GdcMetadata } from "../meta/GdcMetadata";
import { Uri, Timestamp } from "../aliases";

/**
 * @public
 */
export namespace GdcFilterContext {
    export type RelativeType = "relative";
    export type AbsoluteType = "absolute";
    export type DateFilterType = RelativeType | AbsoluteType;

    export interface IFilterContext {
        meta: GdcMetadata.IObjectMeta;
        content: {
            filters: FilterContextItem[];
        };
    }

    export interface IWrappedFilterContext {
        filterContext: IFilterContext;
    }

    /**
     * Temporary filter context stored during exports
     */
    export interface ITempFilterContext {
        uri: Uri;
        created: Timestamp;
        filters: FilterContextItem[];
    }

    export interface IWrappedTempFilterContext {
        tempFilterContext: ITempFilterContext;
    }

    export interface IAttributeFilter {
        attributeFilter: {
            displayForm: string;
            negativeSelection: boolean;
            attributeElements: string[];
            localIdentifier?: string;
            filterElementsBy?: Array<{
                filterLocalIdentifier: string;
                over: {
                    attributes: Array<string>;
                };
            }>;
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

    export function isFilterContext(obj: unknown): obj is IFilterContext {
        return !isEmpty(obj) && (obj as IFilterContext).meta.category === "filterContext";
    }

    export function isWrappedFilterContext(obj: unknown): obj is IWrappedFilterContext {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && (obj as IWrappedFilterContext).hasOwnProperty("filterContext");
    }

    export function isTempFilterContext(obj: unknown): obj is ITempFilterContext {
        return (
            !isEmpty(obj) &&
            (obj as ITempFilterContext).created &&
            (obj as ITempFilterContext).uri &&
            (obj as ITempFilterContext).filters.every((x) => isDateFilter(x) || isAttributeFilter(x))
        );
    }

    export function isWrappedTempFilterContext(obj: unknown): obj is IWrappedTempFilterContext {
        // eslint-disable-next-line no-prototype-builtins
        return !isEmpty(obj) && (obj as IWrappedTempFilterContext).hasOwnProperty("tempFilterContext");
    }
}
