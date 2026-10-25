// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type MatchFilterOperator,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { type Granularity } from "../../models/granularity.js";

import { type IParameterFilter } from "./parameter_filter_types.js";

export interface IArbitraryFilterData {
    readonly mode: "arbitrary";
    readonly values: string[];
    readonly negativeSelection?: boolean;
}

export interface IMatchFilterData {
    readonly mode: "match";
    readonly operator: MatchFilterOperator;
    readonly literal: string;
    readonly caseSensitive?: boolean;
    readonly negativeSelection?: boolean;
}

export type TextModeFilterData = IArbitraryFilterData | IMatchFilterData;

export function isArbitraryFilterData(data: TextModeFilterData): data is IArbitraryFilterData {
    return data.mode === "arbitrary";
}

export function isMatchFilterData(data: TextModeFilterData): data is IMatchFilterData {
    return data.mode === "match";
}

/**
 * Returns true when the text-mode filter represents the "All" condition
 * (arbitrary with no values and negative selection).
 *
 * A non-array `values` counts as EMPTY, which is what the old `toArray?.() ?? []` fallback did.
 */
export function isTextFilterAll(data: unknown): boolean {
    if (!data || typeof data !== "object") {
        return false;
    }
    const { mode, values, negativeSelection } = data as {
        mode?: unknown;
        values?: unknown;
        negativeSelection?: unknown;
    };
    return (
        mode === "arbitrary" &&
        (Array.isArray(values) ? values.length === 0 : true) &&
        negativeSelection === true
    );
}

/**
 * Returns true when the given filter has a text-mode filter that represents the "All" condition.
 */
export function filterHasTextFilterAll(filter: unknown): boolean {
    if (!filter || typeof filter !== "object") {
        return false;
    }
    return isTextFilterAll((filter as { textModeFilter?: unknown }).textModeFilter);
}

export type FilterType = "date" | "attribute" | "measure" | "ranking" | "parameter";

export type IFilter = IDateFilter | IAttributeFilter | IMeasureValueFilter | IRankingFilter;

/**
 * Union of everything that can render in the filter bar. `IFilter` represents predicate-style
 * filters that share bucket validation semantics; parameters are value overrides that live in
 * their own slice and are intentionally kept out of the `IFilter` union.
 */
export type IFilterBarItem = IFilter | IParameterFilter;

export interface IFilterBase {
    readonly type: FilterType;
    readonly localIdentifier: string;
}

export type EmptyDateValuesFilterMode = "include" | "exclude" | "only";

export interface IDateFilterConfig {
    readonly granularity: Granularity;
    readonly interval: [string, string] | [number, number];
    readonly type?: "absolute" | "relative";
    readonly name?: string;
    readonly boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
}

export interface IDateFilter extends IFilterBase {
    readonly type: "date";
    readonly cacheItemIdentifier: string;
    readonly overTimeComparisonType: OverTimeComparisonType;
    readonly filterConfig?: IDateFilterConfig;
    readonly dateDatasetRef: ObjRef;
    readonly emptyDateValuesFilter?: EmptyDateValuesFilterMode;
}

export interface IAttributeElement {
    readonly title?: string;
    readonly formattedTitle?: string;
    readonly uri: string;
    readonly available?: boolean;
}

export interface IAttributeFilterConfig {
    readonly selectedElements: ReadonlyArray<IAttributeElement>;
    readonly isInverted: boolean;
    readonly totalElementsCount: number;
    readonly type?: "absolute" | "relative";
}

export interface IAttributeFilter extends IFilterBase {
    readonly type: "attribute";
    readonly cacheItemIdentifier: string;
    readonly displayFormRef: ObjRef;
    readonly filterConfig?: IAttributeFilterConfig;
    /**
     * Stores mode-specific data for arbitrary or match text-mode attribute filters.
     * When present, this takes precedence over filterConfig for constructing the
     * visualization object filter on save. The displayForm and localIdentifier
     * are taken from the parent IAttributeFilter, avoiding duplication.
     */
    readonly textModeFilter?: TextModeFilterData;
}

export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

export interface IComparisonCondition {
    readonly comparison: {
        readonly operator: ComparisonConditionOperator;
        readonly value: number;
        readonly treatNullValuesAs?: number;
    };
}

export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

export interface IRangeCondition {
    readonly range: {
        readonly operator: RangeConditionOperator;
        readonly from: number;
        readonly to: number;
        readonly treatNullValuesAs?: number;
    };
}

export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

export interface IMeasureValueFilter extends IFilterBase {
    readonly type: "measure";
    /**
     * Local identifier of the measure in the execution.
     * Used when the measure is in the buckets.
     */
    readonly measureLocalIdentifier?: string;
    /**
     * Object reference to a catalog measure.
     * Used when the measure is NOT in the buckets (dragged from catalog to filter bar).
     */
    readonly measureRef?: ObjRef;
    /**
     * Multi-condition MVF combined with OR.
     */
    readonly conditions?: MeasureValueFilterCondition[];
    /**
     * Attributes defining dimensionality for the filter.
     * Can be local identifiers (strings) for attributes in buckets,
     * or ObjRefs for catalog attributes.
     */
    readonly dimensionality?: Array<string | ObjRef>;
    /**
     * Indicates whether this filter should be applied on result.
     * When undefined, backend defaults are used.
     */
    readonly applyOnResult?: boolean;
}

/**
 * Normalizes legacy single-condition shape to the new multi-condition array.
 */
export const normalizeMeasureValueFilterConditions = (
    filter: Pick<IMeasureValueFilter, "conditions"> & {
        condition?: MeasureValueFilterCondition | null | undefined;
    },
): MeasureValueFilterCondition[] | undefined => {
    if (filter.conditions?.length) {
        return filter.conditions;
    }
    return filter.condition ? [filter.condition] : undefined;
};

export type FilterBarAcceptedType = "date" | "attribute" | "fact" | "metric";

export interface IFilterBarConfig {
    readonly itemsLimit: number;
    readonly acceptedTypes: ReadonlyArray<FilterBarAcceptedType>;
}

export type RankingFilterOperator = "TOP" | "BOTTOM";

export interface IRankingFilter extends IFilterBase {
    readonly type: "ranking";
    /**
     * Local identifier of the ranked measure in the execution.
     * Used when the measure is in the buckets.
     */
    readonly measureLocalIdentifier?: string;
    /**
     * Object reference to a catalog measure used for ranking.
     * Used when the ranked measure is NOT in the buckets (picked from catalog).
     */
    readonly measureRef?: ObjRef;
    /**
     * Attributes the ranking ranks "out of". Strings are bucket attribute local identifiers; ObjRefs are
     * catalog attributes (picked from outside the buckets). Mirrors the SDK model
     * {@link @gooddata/sdk-model#IRankingFilterBody.attributes} and {@link IMeasureValueFilter.dimensionality}.
     */
    readonly attributes?: Array<string | ObjRef>;
    readonly operator: RankingFilterOperator;
    readonly value: number;
    readonly applyOnResult?: boolean;
    readonly strictLimitOfRows?: boolean;
}

export type IOnAttributeFilterApplyProps = {
    displayFormRef: ObjRef;
    filterLocalIdentifier: string;
    totalElementsCount: number;
    selectedElements: ReadonlyArray<IAttributeElement>;
    isInverted: boolean;
    textModeFilter?: TextModeFilterData;
};

const isDateFilter = (filterItem: IFilterBarItem): filterItem is IDateFilter => {
    return !isEmpty(filterItem) && filterItem.type === "date";
};

const isAttributeFilter = (filterItem: IFilterBarItem): filterItem is IAttributeFilter => {
    return !isEmpty(filterItem) && filterItem.type === "attribute";
};

const isMeasureValueFilter = (filterItem: IFilterBarItem): filterItem is IMeasureValueFilter => {
    return !isEmpty(filterItem) && filterItem.type === "measure";
};

const isRankingFilter = (filterItem: IFilterBarItem): filterItem is IRankingFilter => {
    return !isEmpty(filterItem) && filterItem.type === "ranking";
};

const isComparisonCondition = (condition: MeasureValueFilterCondition): condition is IComparisonCondition => {
    return !isEmpty(condition) && (condition as IComparisonCondition).comparison !== undefined;
};

const isRangeCondition = (condition: MeasureValueFilterCondition): condition is IRangeCondition => {
    return !isEmpty(condition) && (condition as IRangeCondition).range !== undefined;
};

const isAttributeFilterSelectAll = ({ selectedElements, isInverted }: IAttributeFilterConfig): boolean => {
    const selectedAvailable = selectedElements.filter((element) => element.available !== false).length;
    return selectedElements.length === 0 || (isInverted && selectedAvailable === 0);
};

/**
 * Utility to check if a measure value filter references a catalog measure (not in buckets).
 * Catalog measure filters use measureRef (ObjRef) to reference the measure.
 */
const isCatalogMeasureValueFilter = (filter: IMeasureValueFilter): boolean => {
    return filter.measureRef !== undefined;
};

/**
 * Utility to check if a measure value filter references a bucket measure.
 * Bucket measure filters use measureLocalIdentifier to reference the measure in the execution.
 */
const isBucketMeasureValueFilter = (filter: IMeasureValueFilter): boolean => {
    return filter.measureLocalIdentifier !== undefined && filter.measureRef === undefined;
};

/**
 * Utility to check if a ranking filter ranks by a catalog measure (not in buckets).
 * Catalog ranking filters use measureRef (ObjRef) to reference the measure.
 */
const isCatalogRankingFilter = (filter: IRankingFilter): boolean => {
    return filter.measureRef !== undefined;
};

/**
 * Utility to check if a ranking filter ranks by a bucket measure.
 * Bucket ranking filters use measureLocalIdentifier to reference the measure in the execution.
 */
const isBucketRankingFilter = (filter: IRankingFilter): boolean => {
    return filter.measureLocalIdentifier !== undefined && filter.measureRef === undefined;
};

export const FilterBar = {
    isDateFilter,
    isAttributeFilter,
    isMeasureValueFilter,
    isRankingFilter,
    isComparisonCondition,
    isRangeCondition,
    isAttributeFilterSelectAll,
    isCatalogMeasureValueFilter,
    isBucketMeasureValueFilter,
    isCatalogRankingFilter,
    isBucketRankingFilter,
};
