// (C) 2020-2025 GoodData Corporation
import { ILocalIdentifierQualifier, ObjQualifier, RankingFilterOperator } from "./legacyTypes.js";

import {
    DashboardDateFilterConfigMode,
    DashboardAttributeFilterConfigMode,
    IUpperBoundedFilter,
    ILowerBoundedFilter,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

/**
 * Attribute filter config with props non relevant for execution, but important for UI.
 * @public
 */
export interface IAttributeFilterConfig {
    /**
     * Configures the visibility mode of the attribute filter.
     *
     * @alpha
     */
    mode?: DashboardAttributeFilterConfigMode;
    /**
     * Configures the label used for representing attribute filter elements in UI.
     *
     * @alpha
     */
    displayAsLabel?: ObjQualifier;
}
/**
 * Attribute filters were exposed in the 'old' format that did not match backend and used the
 * textFilter boolean indicator. We have to honor this for the public API.
 * @public
 */
export interface IPositiveAttributeFilter extends IAttributeFilterConfig {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: string[];
        textFilter?: boolean;
        selectionMode?: AttributeFilterItemSelectionMode;
    };
}
/**
 * @public
 */
export interface INegativeAttributeFilter extends IAttributeFilterConfig {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: string[];
        textFilter?: boolean;
        selectionMode?: "multi";
    };
}

/**
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        // dataSet is required in AD only
        dataSet?: ObjQualifier;
        from: string;
        to: string;
    };
    /**
     * Configures the visibility mode of the date filter.
     *
     * @alpha
     */
    mode?: DashboardDateFilterConfigMode;
    /**
     * Local identifier of the date filter.
     *
     * @alpha
     */
    localIdentifier?: string;
}

/**
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        // dataSet is required in AD only
        dataSet?: ObjQualifier;
        granularity: string;
        from: number;
        to: number;
        boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    };
    /**
     * Configures the visibility mode of the date filter.
     *
     * @alpha
     */
    mode?: DashboardDateFilterConfigMode;
    /**
     * Local identifier of the date filter.
     *
     * @alpha
     */
    localIdentifier?: string;
}

/**
 * @public
 */
export interface IRankingFilter {
    rankingFilter: {
        measure: ILocalIdentifierQualifier;
        attributes?: ILocalIdentifierQualifier[];
        operator: RankingFilterOperator;
        value: number;
    };
}

/**
 * @public
 */
export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * @public
 */
export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

/**
 * @public
 */
export type FilterItem = DateFilterItem | AttributeFilterItem | IRankingFilter;

/**
 * @public
 */
export type AttributeFilterItemSelectionMode = "single" | "multi";

/**
 * @public
 */
export interface IRemoveDateFilterItem {
    dataSet: ObjQualifier;
}

/**
 * @public
 */
export interface IRemoveAttributeFilterItem {
    displayForm: ObjQualifier;
}

/**
 * @public
 */
export interface IRemoveRankingFilterItem {
    removeRankingFilter: unknown;
}

/**
 * @public
 */
export type RemoveFilterItem = IRemoveDateFilterItem | IRemoveAttributeFilterItem | IRemoveRankingFilterItem;

/**
 * @public
 */
export function isDateFilter(filter: unknown): filter is DateFilterItem {
    return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
}

/**
 * @public
 */
export function isRelativeDateFilter(filter: unknown): filter is IRelativeDateFilter {
    return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * @public
 */
export function isAbsoluteDateFilter(filter: unknown): filter is IAbsoluteDateFilter {
    return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * @public
 */
export function isAttributeFilter(filter: unknown): filter is AttributeFilterItem {
    return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
}

/**
 * @public
 */
export function isPositiveAttributeFilter(filter: unknown): filter is IPositiveAttributeFilter {
    return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isNegativeAttributeFilter(filter: unknown): filter is INegativeAttributeFilter {
    return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isRankingFilter(filter: unknown): filter is IRankingFilter {
    return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
}

/**
 * The filter context content that is used to exchange the filter context
 * between AD, KD embedded page and parent application
 * @public
 */
export interface IFilterContextContent {
    // array of date or attribute filter items
    filters: FilterItem[];
}

/**
 * The remove filter context content that is used to exchange the filter context
 * between AD, KD embedded page and parent application
 * @public
 */
export interface IRemoveFilterContextContent {
    // array of date or attribute filter items
    filters: RemoveFilterItem[];
}

/**
 * @public
 */
export function isRemoveDateFilter(filter: unknown): filter is IRemoveDateFilterItem {
    return !isEmpty(filter) && (filter as IRemoveDateFilterItem).dataSet !== undefined;
}

/**
 * @public
 */
export function isRemoveAttributeFilter(filter: unknown): filter is IRemoveAttributeFilterItem {
    return !isEmpty(filter) && (filter as IRemoveAttributeFilterItem).displayForm !== undefined;
}

/**
 * @public
 */
export function isRemoveRankingFilter(filter: unknown): filter is IRemoveRankingFilterItem {
    return !isEmpty(filter) && (filter as IRemoveRankingFilterItem).removeRankingFilter !== undefined;
}

/**
 * @public
 */
export type AllTimeType = "allTime";

/**
 * @public
 */
export type AbsoluteType = "absolute";

/**
 * @public
 */
export type RelativeType = "relative";

/**
 * @public
 */
export type DateString = string;

/**
 * @public
 */
export type DateFilterGranularity =
    | "GDC.time.minute"
    | "GDC.time.hour"
    | "GDC.time.date"
    | "GDC.time.week_us"
    | "GDC.time.month"
    | "GDC.time.quarter"
    | "GDC.time.year";

/**
 * @public
 */
export interface IDashboardAllTimeDateFilter {
    dateFilter: { type: AllTimeType };
}

/**
 * @public
 */
export interface IDashboardAbsoluteDateFilter {
    dateFilter: {
        type: AbsoluteType;
        granularity: DateFilterGranularity;
        from: DateString;
        to: DateString;
    };
}

/**
 * @public
 */
export interface IDashboardRelativeDateFilter {
    dateFilter: {
        type: RelativeType;
        granularity: DateFilterGranularity;
        from: number;
        to: number;
    };
}

/**
 * @public
 */
export type DashboardDateFilter =
    | IDashboardAllTimeDateFilter
    | IDashboardAbsoluteDateFilter
    | IDashboardRelativeDateFilter;

/**
 * @public
 */
export function isDashboardDateFilter(filter: unknown): filter is DashboardDateFilter {
    return !isEmpty(filter) && (filter as DashboardDateFilter).dateFilter !== undefined;
}

/**
 * @public
 */
export function isDashboardAllTimeDateFilter(filter: unknown): filter is IDashboardAllTimeDateFilter {
    return !isEmpty(filter) && (filter as IDashboardAllTimeDateFilter).dateFilter?.type === "allTime";
}

/**
 * @public
 */
export function isDashboardAbsoluteDateFilter(filter: unknown): filter is IDashboardAbsoluteDateFilter {
    return !isEmpty(filter) && (filter as IDashboardAbsoluteDateFilter).dateFilter?.type === "absolute";
}

/**
 * @public
 */
export function isDashboardRelativeDateFilter(filter: unknown): filter is IDashboardRelativeDateFilter {
    return !isEmpty(filter) && (filter as IDashboardRelativeDateFilter).dateFilter?.type === "relative";
}

/**
 * @public
 */
export interface IDashboardAttributeFilter {
    attributeFilter: {
        displayForm: string;
        negativeSelection: boolean;
        attributeElements: string[];
    };
}

/**
 * @public
 */
export function isDashboardAttributeFilter(filter: unknown): filter is IDashboardAttributeFilter {
    return !isEmpty(filter) && (filter as IDashboardAttributeFilter).attributeFilter !== undefined;
}

/**
 * @public
 */
export interface IResolvedAttributeFilterValues {
    [elementRef: string]: string | undefined; // restricted elements values cant be resolved
}

/**
 * @public
 */
export interface IResolvedDateFilterValue {
    from: string;
    to: string;
}

/**
 * @public
 */
export type ResolvedDateFilterValues = IResolvedDateFilterValue[];

/**
 * Resolved values for all resolvable filters
 * @public
 */
export interface IResolvedFilterValues {
    dateFilters: ResolvedDateFilterValues;
    attributeFilters: {
        [filterStringRef: string]: IResolvedAttributeFilterValues;
    };
}
