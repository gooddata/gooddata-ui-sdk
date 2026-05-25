// (C) 2026 GoodData Corporation

import {
    type ITigerDashboardMeasureValueFilter,
    type ITigerFilter,
    type ITigerFilterContextItem,
    isTigerFilterContextItems,
    isTigerFilters,
} from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IDashboardMeasureValueFilter,
    type IFilter,
    type MeasureValueFilterCondition,
    isComparisonCondition,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isRangeCondition,
} from "@gooddata/sdk-model";

import { cloneWithSanitizedIdsTyped as cloneWithSanitizedIdsTypedFromBackend } from "../fromBackend/IdSanitization.js";
import { cloneWithSanitizedIdsTyped as cloneWithSanitizedIdsTypedToBackend } from "../toBackend/IdSanitization.js";

import {
    convertMeasureValueFilterSdkToTiger,
    convertMeasureValueFilterTigerToSdk,
} from "./measureValueFilterConverter.js";
import { isFilterContextItems, isFilters } from "./sdkFilterTypeGuards.js";

// SINGULAR FILTER CONVERSIONS
// SDK -> Tiger

/**
 * Converts SDK filter to Tiger stored filter format.
 *
 * @remarks
 * Use this for stored filters in: insights, export definitions, dashboard filters, filter views, export metadata.
 * For AFM/execution filters, use the AFM filter converter instead.
 *
 * @param filter - SDK filter to convert
 * @returns Tiger stored filter with sanitized IDs and converted formats
 * @public
 */
export function convertSdkFilterToTigerStored(filter: IFilter): ITigerFilter {
    const sanitized = cloneWithSanitizedIdsTypedToBackend<IFilter, IFilter>(filter);
    return convertMeasureValueFilterSdkToTiger(sanitized);
}

/**
 * Converts SDK FilterContextItem to Tiger FilterContextItem.
 *
 * @param item - SDK FilterContextItem to convert
 * @returns Converted Tiger FilterContextItem
 * @public
 */
export function convertSdkFilterContextItemToTiger(item: FilterContextItem): ITigerFilterContextItem {
    if (isDashboardMatchAttributeFilter(item)) {
        return cloneWithSanitizedIdsTypedToBackend<FilterContextItem, ITigerFilterContextItem>({
            matchAttributeFilter: {
                ...item.matchAttributeFilter,
                caseSensitive: item.matchAttributeFilter.caseSensitive ?? false,
                negativeSelection: item.matchAttributeFilter.negativeSelection ?? false,
            },
        });
    }
    if (isDashboardMeasureValueFilter(item)) {
        return cloneWithSanitizedIdsTypedToBackend<unknown, ITigerFilterContextItem>(
            normalizeDashboardMvfForTiger(item),
        );
    }
    return cloneWithSanitizedIdsTypedToBackend<FilterContextItem, ITigerFilterContextItem>(item);
}

/**
 * Reshapes an sdk-model `IDashboardMeasureValueFilter` for the Tiger wire:
 * - lifts the per-condition `treatNullValuesAs` onto the filter body (first defined value wins, matching
 *   how AFM-compound MVF is handled — see `convertMeasureValueFilterSdkToTiger`),
 * - strips the field from each inner condition so they match the BE's `DashboardCompoundConditionItem`.
 *
 * The BE schema does not currently have a slot for `treatNullValuesAs` on `dashboardMeasureValueFilter`;
 * this is a forward-looking placement that pairs with the matching client type extension. Until the BE
 * adds the field, requests carrying it will be rejected — that's tracked separately.
 */
function normalizeDashboardMvfForTiger(filter: IDashboardMeasureValueFilter) {
    const { conditions, ...rest } = filter.dashboardMeasureValueFilter;

    const treatNullValuesAs = conditions ? firstDefinedTreatNullValuesAs(conditions) : undefined;
    const cleanConditions = conditions?.map(toCompoundConditionItem) ?? [];

    return {
        dashboardMeasureValueFilter: {
            ...rest,
            conditions: cleanConditions,
            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
        },
    };
}

function firstDefinedTreatNullValuesAs(conditions: MeasureValueFilterCondition[]): number | undefined {
    for (const c of conditions) {
        if (isComparisonCondition(c) && c.comparison.treatNullValuesAs !== undefined) {
            return c.comparison.treatNullValuesAs;
        }
        if (isRangeCondition(c) && c.range.treatNullValuesAs !== undefined) {
            return c.range.treatNullValuesAs;
        }
    }
    return undefined;
}

function toCompoundConditionItem(c: MeasureValueFilterCondition) {
    if (isComparisonCondition(c)) {
        return { comparison: { operator: c.comparison.operator, value: c.comparison.value } };
    }
    return { range: { operator: c.range.operator, from: c.range.from, to: c.range.to } };
}

// Tiger -> SDK

/**
 * Converts Tiger stored filter to SDK filter format.
 * This is the unified conversion function for all non-AFM filters crossing the Tiger/SDK boundary.
 *
 * @param filter - Tiger stored filter to convert
 * @returns SDK filter with converted formats
 * @public
 */
export function convertTigerStoredToSdkFilter(filter: ITigerFilter): IFilter {
    const sanitized = cloneWithSanitizedIdsTypedFromBackend<ITigerFilter, ITigerFilter>(filter);
    return convertMeasureValueFilterTigerToSdk(sanitized);
}

/**
 * Converts Tiger ITigerFilterContextItem to SDK FilterContextItem.
 *
 * @param item - Tiger ITigerFilterContextItem to convert
 * @returns SDK FilterContextItem with converted formats
 * @public
 */
function convertDashboardFilterToSdk(item: ITigerFilterContextItem): FilterContextItem {
    if ("dashboardMeasureValueFilter" in item) {
        return cloneWithSanitizedIdsTypedFromBackend<unknown, FilterContextItem>(
            denormalizeDashboardMvfFromTiger(item),
        );
    }
    return cloneWithSanitizedIdsTypedFromBackend<ITigerFilterContextItem, FilterContextItem>(item);
}

/**
 * Reverse of {@link normalizeDashboardMvfForTiger}: spreads the body-level `treatNullValuesAs` back onto
 * each inner condition's `comparison`/`range` so the result matches the sdk-model `IDashboardMeasureValueFilter`.
 */
function denormalizeDashboardMvfFromTiger(item: ITigerDashboardMeasureValueFilter) {
    const { treatNullValuesAs, conditions, ...rest } = item.dashboardMeasureValueFilter;

    const denormalizedConditions: MeasureValueFilterCondition[] = (conditions ?? []).map((c) =>
        spreadTreatNullValuesAs(c as unknown as MeasureValueFilterCondition, treatNullValuesAs),
    );

    return {
        dashboardMeasureValueFilter: {
            ...rest,
            conditions: denormalizedConditions,
        },
    };
}

function spreadTreatNullValuesAs(
    c: MeasureValueFilterCondition,
    treatNullValuesAs: number | undefined,
): MeasureValueFilterCondition {
    if (treatNullValuesAs === undefined) {
        return c;
    }
    if (isComparisonCondition(c)) {
        return { comparison: { ...c.comparison, treatNullValuesAs } };
    }
    return { range: { ...c.range, treatNullValuesAs } };
}

// BATCH CONVERSIONS
// SDK -> Tiger

type SdkFiltersToTigerInput = IFilter[] | FilterContextItem[] | undefined;
type SdkFiltersToTigerOutput<T extends SdkFiltersToTigerInput> = T extends IFilter[]
    ? ITigerFilter[]
    : T extends FilterContextItem[]
      ? ITigerFilterContextItem[]
      : undefined;

export function convertSdkFiltersToTiger<T extends SdkFiltersToTigerInput>(
    filters: T,
): SdkFiltersToTigerOutput<T> {
    if (!filters) {
        return undefined as SdkFiltersToTigerOutput<T>;
    }

    if (filters.length === 0) {
        return [] as unknown as SdkFiltersToTigerOutput<T>;
    }

    if (isFilterContextItems(filters)) {
        return filters.map(convertSdkFilterContextItemToTiger) as SdkFiltersToTigerOutput<T>;
    }

    if (isFilters(filters)) {
        return filters.map(convertSdkFilterToTigerStored) as SdkFiltersToTigerOutput<T>;
    }

    throw new Error("Unsupported filters type");
}

// Tiger -> SDK

type TigerToSdkFiltersInput = ITigerFilter[] | ITigerFilterContextItem[] | undefined;
type TigerToSdkFiltersOutput<T extends TigerToSdkFiltersInput> = T extends ITigerFilter[]
    ? IFilter[]
    : T extends ITigerFilterContextItem[]
      ? FilterContextItem[]
      : undefined;

export function convertTigerToSdkFilters<T extends TigerToSdkFiltersInput>(
    filters: T,
): TigerToSdkFiltersOutput<T> {
    if (!filters) {
        return undefined as TigerToSdkFiltersOutput<T>;
    }

    if (filters.length === 0) {
        return [] as unknown as TigerToSdkFiltersOutput<T>;
    }

    if (isTigerFilterContextItems(filters)) {
        return filters.map(convertDashboardFilterToSdk) as TigerToSdkFiltersOutput<T>;
    }

    if (isTigerFilters(filters)) {
        return filters.map(convertTigerStoredToSdkFilter) as TigerToSdkFiltersOutput<T>;
    }

    // Fallback: sometimes we receive filters in SDK format from Tiger, but we still need to sanitize the IDs.
    // Ideally, this should not happen, but we want to handle such cases gracefully instead of crashing.

    if (isFilterContextItems(filters)) {
        return cloneWithSanitizedIdsTypedFromBackend<FilterContextItem[], FilterContextItem[]>(
            filters,
        ) as unknown as TigerToSdkFiltersOutput<T>;
    }

    if (isFilters(filters)) {
        return cloneWithSanitizedIdsTypedFromBackend<IFilter[], IFilter[]>(
            filters,
        ) as unknown as TigerToSdkFiltersOutput<T>;
    }

    throw new Error("Unsupported filters type");
}
