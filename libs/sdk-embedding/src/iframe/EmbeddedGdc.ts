// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type DashboardAttributeFilterConfigMode,
    type DashboardDateFilterConfigMode,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
} from "@gooddata/sdk-model";

import {
    type ILocalIdentifierQualifier,
    type IObjIdentifierQualifier,
    type MeasureValueFilterCondition,
    type ObjQualifier,
    type RankingFilterOperator,
} from "./legacyTypes.js";

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
export interface IArbitraryAttributeFilterItem extends IAttributeFilterConfig {
    arbitraryAttributeFilter: {
        displayForm: IObjIdentifierQualifier;
        values: string[];
        negativeSelection?: boolean;
    };
}

/**
 * @public
 */
export interface IMatchAttributeFilterItem extends IAttributeFilterConfig {
    matchAttributeFilter: {
        displayForm: IObjIdentifierQualifier;
        operator: "contains" | "startsWith" | "endsWith";
        literal: string;
        caseSensitive?: boolean;
        negativeSelection?: boolean;
    };
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
 * Measure value (numeric) filter exchanged via the postMessage embedding API.
 *
 * @remarks
 * Used by KD/AD embedding to set, change or clear measure value filter conditions on a dashboard.
 * Dashboards apply the condition only to an existing MVF — embedded clients cannot add new MVFs
 * via postMessage. The measure is identified by a catalog identifier (Tiger backend; URI
 * references are not supported). When the dashboard holds multiple MVFs for the same metric,
 * `localIdentifier` disambiguates which one is targeted; without it the dashboard matches by
 * metric only and silently ignores the change if more than one filter exists for that metric.
 * Conditions are OR-ed; an empty array (or omitted property) clears the filter.
 *
 * @public
 */
export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: IObjIdentifierQualifier;
        localIdentifier?: string;
        conditions?: MeasureValueFilterCondition[];
    };
}

/**
 * @public
 */
export type AttributeFilterItem =
    | IPositiveAttributeFilter
    | INegativeAttributeFilter
    | IArbitraryAttributeFilterItem
    | IMatchAttributeFilterItem;

/**
 * @public
 */
export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

/**
 * @public
 */
export type FilterItem = DateFilterItem | AttributeFilterItem | IRankingFilter | IMeasureValueFilter;

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
 * Removes the conditions of a measure value filter on the dashboard, identified by its target
 * catalog metric identifier (Tiger backend; URI references are not supported). When the dashboard
 * holds multiple MVFs for the same metric, `localIdentifier` disambiguates which one is targeted.
 *
 * @public
 */
export interface IRemoveMeasureValueFilterItem {
    removeMeasureValueFilter: {
        measure: IObjIdentifierQualifier;
        localIdentifier?: string;
    };
}

/**
 * @public
 */
export type RemoveFilterItem =
    | IRemoveDateFilterItem
    | IRemoveAttributeFilterItem
    | IRemoveRankingFilterItem
    | IRemoveMeasureValueFilterItem;

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
    return (
        !isEmpty(filter) &&
        (isPositiveAttributeFilter(filter) ||
            isNegativeAttributeFilter(filter) ||
            isArbitraryAttributeFilterItem(filter) ||
            isMatchAttributeFilterItem(filter))
    );
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
 * @public
 */
export function isMeasureValueFilter(filter: unknown): filter is IMeasureValueFilter {
    return !isEmpty(filter) && (filter as IMeasureValueFilter).measureValueFilter !== undefined;
}

/**
 * @public
 */
export function isArbitraryAttributeFilterItem(filter: unknown): filter is IArbitraryAttributeFilterItem {
    return (
        !isEmpty(filter) && (filter as IArbitraryAttributeFilterItem).arbitraryAttributeFilter !== undefined
    );
}

/**
 * @public
 */
export function isMatchAttributeFilterItem(filter: unknown): filter is IMatchAttributeFilterItem {
    return !isEmpty(filter) && (filter as IMatchAttributeFilterItem).matchAttributeFilter !== undefined;
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
export function isRemoveMeasureValueFilter(filter: unknown): filter is IRemoveMeasureValueFilterItem {
    return (
        !isEmpty(filter) && (filter as IRemoveMeasureValueFilterItem).removeMeasureValueFilter !== undefined
    );
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
    | "GDC.time.year"
    | "GDC.time.fiscal_month"
    | "GDC.time.fiscal_quarter"
    | "GDC.time.fiscal_year";

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
 * Arbitrary attribute filter for embedded dashboards.
 * Filters by free-text values rather than element selection.
 * @public
 */
export interface IDashboardArbitraryAttributeFilter {
    arbitraryAttributeFilter: {
        displayForm: string;
        negativeSelection: boolean;
        values: Array<string | null>;
    };
}

/**
 * @public
 */
export function isDashboardArbitraryAttributeFilter(
    filter: unknown,
): filter is IDashboardArbitraryAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IDashboardArbitraryAttributeFilter).arbitraryAttributeFilter !== undefined
    );
}

/**
 * Match attribute filter for embedded dashboards.
 * Filters by pattern matching on attribute values.
 * @public
 */
export interface IDashboardMatchAttributeFilter {
    matchAttributeFilter: {
        displayForm: string;
        negativeSelection: boolean;
        operator: "contains" | "startsWith" | "endsWith";
        literal: string;
    };
}

/**
 * @public
 */
export function isDashboardMatchAttributeFilter(filter: unknown): filter is IDashboardMatchAttributeFilter {
    return !isEmpty(filter) && (filter as IDashboardMatchAttributeFilter).matchAttributeFilter !== undefined;
}

/**
 * Union of text mode attribute filter types for embedded dashboards.
 * @public
 */
export type DashboardTextAttributeFilter =
    | IDashboardArbitraryAttributeFilter
    | IDashboardMatchAttributeFilter;

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
