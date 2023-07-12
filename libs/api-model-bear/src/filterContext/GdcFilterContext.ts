// (C) 2019-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { DateFilterGranularity } from "../extendedDateFilters/GdcExtendedDateFilters.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";
import { DateString, Uri, Timestamp, NumberAsString } from "../base/GdcTypes.js";

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
export interface IFilterContextAttributeFilter {
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
export interface IFilterContextDateFilter {
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
export type FilterContextItem = IFilterContextAttributeFilter | IFilterContextDateFilter;

/**
 * @public
 */
export function isFilterContextDateFilter(filter: FilterContextItem): filter is IFilterContextDateFilter {
    return !isEmpty(filter) && !!(filter as IFilterContextDateFilter).dateFilter;
}

/**
 * @public
 */
export function isFilterContextAttributeFilter(
    filter: FilterContextItem,
): filter is IFilterContextAttributeFilter {
    return !isEmpty(filter) && !!(filter as IFilterContextAttributeFilter).attributeFilter;
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
        (obj as ITempFilterContext).filters.every(
            (x) => isFilterContextDateFilter(x) || isFilterContextAttributeFilter(x),
        )
    );
}

/**
 * @public
 */
export function isWrappedTempFilterContext(obj: unknown): obj is IWrappedTempFilterContext {
    // eslint-disable-next-line no-prototype-builtins
    return !isEmpty(obj) && (obj as IWrappedTempFilterContext).hasOwnProperty("tempFilterContext");
}
