// (C) 2019-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { Uri, Timestamp, NumberAsString } from "../aliases.js";
import { DateFilterGranularity, DateString } from "../extendedDateFilters/GdcExtendedDateFilters.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

/**
 * @public
 */
export type RelativeType = "relative";

/**
 * @public
 */
export type AbsoluteType = "absolute";

/**
 * @public
 */
export type DateFilterType = RelativeType | AbsoluteType;

/**
 * @public
 */
export type AttributeFilterSelectionMode = "single" | "multi";

/**
 * @public
 */
export interface IFilterContext {
    meta: IObjectMeta;
    content: {
        filters: FilterContextItem[];
    };
}

/**
 * @public
 */
export interface IWrappedFilterContext {
    filterContext: IFilterContext;
}

/**
 * Temporary filter context stored during exports
 * @public
 */
export interface ITempFilterContext {
    uri: Uri;
    created: Timestamp;
    filters: FilterContextItem[];
}

/**
 * @public
 */
export interface IWrappedTempFilterContext {
    tempFilterContext: ITempFilterContext;
}

/**
 * @public
 */
export interface IAttributeFilter {
    attributeFilter: {
        displayForm: string;
        negativeSelection: boolean;
        attributeElements: string[];
        localIdentifier?: string;
        title?: string;
        filterElementsBy?: Array<{
            filterLocalIdentifier: string;
            over: {
                attributes: Array<string>;
            };
        }>;
        selectionMode?: AttributeFilterSelectionMode;
    };
}

/**
 * @public
 */
export interface IDateFilter {
    dateFilter: {
        type: DateFilterType;
        granularity: DateFilterGranularity;
        from?: DateString | NumberAsString;
        to?: DateString | NumberAsString;
        dataSet?: string;
        attribute?: string;
    };
}

/**
 * @public
 */
export type FilterContextItem = IAttributeFilter | IDateFilter;

/**
 * @public
 */
export function isDateFilter(filter: FilterContextItem): filter is IDateFilter {
    return !isEmpty(filter) && !!(filter as IDateFilter).dateFilter;
}

/**
 * @public
 */
export function isAttributeFilter(filter: FilterContextItem): filter is IAttributeFilter {
    return !isEmpty(filter) && !!(filter as IAttributeFilter).attributeFilter;
}

/**
 * @public
 */
export function isFilterContext(obj: unknown): obj is IFilterContext {
    return !isEmpty(obj) && (obj as IFilterContext).meta.category === "filterContext";
}

/**
 * @public
 */
export function isWrappedFilterContext(obj: unknown): obj is IWrappedFilterContext {
    // eslint-disable-next-line no-prototype-builtins
    return !isEmpty(obj) && (obj as IWrappedFilterContext).hasOwnProperty("filterContext");
}

/**
 * @public
 */
export function isTempFilterContext(obj: unknown): obj is ITempFilterContext {
    return !!(
        !isEmpty(obj) &&
        (obj as ITempFilterContext).created &&
        (obj as ITempFilterContext).uri &&
        (obj as ITempFilterContext).filters.every((x) => isDateFilter(x) || isAttributeFilter(x))
    );
}

/**
 * @public
 */
export function isWrappedTempFilterContext(obj: unknown): obj is IWrappedTempFilterContext {
    // eslint-disable-next-line no-prototype-builtins
    return !isEmpty(obj) && (obj as IWrappedTempFilterContext).hasOwnProperty("tempFilterContext");
}
