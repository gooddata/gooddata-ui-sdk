// (C) 2021-2025 GoodData Corporation

import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilter,
    IDashboardDateFilterConfig,
    IDashboardDateFilterConfigItem,
    ObjRef,
    areObjRefsEqual,
    attributeElementsCount,
    dashboardFilterObjRef,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

/**
 * Describes validation errors that can occur when merging dashboard filters.
 *
 * @internal
 */
export type FilterValidationErrorType =
    | "cannot-apply-hidden" // The filter is hidden and cannot be modified
    | "cannot-apply-readonly" // The filter is readonly and cannot be modified
    | "cannot-apply-multi-to-single" // Cannot apply a multi-value filter to a single-value filter
    | "cannot-apply-missing-filter" // The filter doesn't exist in the dashboard
    | "parent-filter-is-missing"; // The filter parent doesn't exist in the dashboard

/**
 * Result of filter validation containing the filter and the specific error.
 *
 * @internal
 */
export type ValidationResult = {
    filter: FilterContextItem;
    error: FilterValidationErrorType;
};

/**
 * Dashboard filter configuration for merging operations.
 *
 * @internal
 */
export interface IDashboardFilterMergeConfig {
    dateFilterConfig?: IDashboardDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

/**
 * Creates a mapping of attribute filter configs by their local identifiers.
 *
 * @param attributeFilterConfigs - Attribute filter configurations
 * @returns Map with local identifiers as keys and attribute filter configs as values
 * @internal
 */
function createAttributeFilterConfigsMap(
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
): Map<string, IDashboardAttributeFilterConfig> {
    return (
        attributeFilterConfigs?.reduce((acc, config) => {
            acc.set(config.localIdentifier, config);
            return acc;
        }, new Map<string, IDashboardAttributeFilterConfig>()) ??
        new Map<string, IDashboardAttributeFilterConfig>()
    );
}

/**
 * Creates a mapping of date filter configs by their date data set references.
 *
 * @param dateFilterConfigs - Date filter configurations
 * @returns Map with date data set references as keys and date filter configs as values
 * @internal
 */
function createDateFilterConfigsMap(
    dateFilterConfigs?: IDashboardDateFilterConfigItem[],
): Map<ObjRef, IDashboardDateFilterConfigItem> {
    return (
        dateFilterConfigs?.reduce((acc, config) => {
            acc.set(config.dateDataSet, config);
            return acc;
        }, new Map<ObjRef, IDashboardDateFilterConfigItem>()) ??
        new Map<ObjRef, IDashboardDateFilterConfigItem>()
    );
}

/**
 * Finds a matching filter to merge from the filters to merge collection.
 *
 * @param originalFilter - The original filter
 * @param filtersToMerge - Collection of filters to merge
 * @returns The matching filter to merge, if any
 */
function findMatchingFilterToMerge(
    originalFilter: FilterContextItem,
    filtersToMerge: FilterContextItem[],
): FilterContextItem | undefined {
    // Special case for common date filters (without dataSet)
    if (isDashboardDateFilter(originalFilter) && !originalFilter.dateFilter.dataSet) {
        // Match by localIdentifier for common date filters
        return filtersToMerge.find(
            (filter) =>
                isDashboardDateFilter(filter) &&
                !filter.dateFilter.dataSet &&
                filter.dateFilter.localIdentifier === originalFilter.dateFilter.localIdentifier,
        );
    }

    // Standard case for other filters
    const originalDisplayForm = dashboardFilterObjRef(originalFilter);
    if (!originalDisplayForm) {
        return undefined;
    }

    return filtersToMerge.find((filter) => {
        const displayForm = dashboardFilterObjRef(filter);
        return displayForm && areObjRefsEqual(displayForm, originalDisplayForm);
    });
}

/**
 * Identifies filters in filtersToMerge that have no corresponding filter in originalFilters.
 *
 * @param originalFilters - Original filters from the dashboard
 * @param filtersToMerge - Filters to merge into the dashboard
 * @returns Array of validation results for missing filters
 */
function findMissingFilters(
    originalFilters: FilterContextItem[],
    filtersToMerge: FilterContextItem[],
): ValidationResult[] {
    // Create a list of all original filter display forms
    const originalDisplayForms = originalFilters
        .map((filter) => dashboardFilterObjRef(filter))
        .filter((ref): ref is ObjRef => ref !== undefined);

    // Find filters that don't match any original filter
    return filtersToMerge
        .filter((filter) => {
            const displayForm = dashboardFilterObjRef(filter);
            if (!displayForm) {
                return false;
            }

            // Check if this display form exists in original filters
            return !originalDisplayForms.some((originalRef) => areObjRefsEqual(displayForm, originalRef));
        })
        .map((filter) => ({
            filter,
            error: "cannot-apply-missing-filter" as const,
        }));
}

/**
 * Validates if an attribute filter can be applied based on its configuration.
 *
 * @param originalFilter - Original attribute filter
 * @param filterToMerge - Attribute filter to merge
 * @param filterConfig - Filter configuration
 * @param missingAttributeFilterLocalIdentifiers - List of local identifiers of missing attribute filters
 * @returns Array of validation results
 */
function validateAttributeFilter(
    originalFilter: IDashboardAttributeFilter,
    filterToMerge: IDashboardAttributeFilter,
    filterConfig: IDashboardAttributeFilterConfig | undefined,
    missingAttributeFilterLocalIdentifiers: string[],
): ValidationResult[] {
    const validationResults: ValidationResult[] = [];

    if (filterConfig?.mode === "hidden") {
        validationResults.push({
            filter: filterToMerge,
            error: "cannot-apply-hidden",
        });
    } else if (filterConfig?.mode === "readonly") {
        validationResults.push({
            filter: filterToMerge,
            error: "cannot-apply-readonly",
        });
    } else if (
        originalFilter.attributeFilter.selectionMode === "single" &&
        attributeElementsCount(filterToMerge.attributeFilter.attributeElements) > 1
    ) {
        validationResults.push({
            filter: filterToMerge,
            error: "cannot-apply-multi-to-single",
        });
    }

    if (
        filterToMerge.attributeFilter.filterElementsBy?.some((filter) =>
            missingAttributeFilterLocalIdentifiers.includes(filter.filterLocalIdentifier),
        )
    ) {
        validationResults.push({
            filter: filterToMerge,
            error: "parent-filter-is-missing",
        });
    }

    return validationResults;
}

/**
 * Modifies a multi-value attribute filter to use only the first element.
 *
 * @param filter - Attribute filter to modify
 * @returns Modified filter with only the first element
 */
function limitAttributeFilterToFirstElement(filter: IDashboardAttributeFilter): IDashboardAttributeFilter {
    const result: IDashboardAttributeFilter = {
        ...filter,
        attributeFilter: {
            ...filter.attributeFilter,
            selectionMode: "single",
        },
    };

    const elements = filter.attributeFilter.attributeElements;

    if ("values" in elements && Array.isArray(elements.values)) {
        result.attributeFilter.attributeElements = {
            ...elements,
            values: elements.values.slice(0, 1),
        };
    } else if ("uris" in elements && Array.isArray(elements.uris)) {
        result.attributeFilter.attributeElements = {
            ...elements,
            uris: elements.uris.slice(0, 1),
        };
    }

    return result;
}

// remove invalid parent filter links to not hit invariant error in useParentFilters hook
function removeInvalidParentFilterLinks(
    filter: IDashboardAttributeFilter,
    missingAttributeFilterLocalIdentifiers: string[],
): IDashboardAttributeFilter {
    return {
        ...filter,
        attributeFilter: {
            ...filter.attributeFilter,
            filterElementsBy: filter.attributeFilter.filterElementsBy?.filter(
                (parentFilter) =>
                    !missingAttributeFilterLocalIdentifiers.includes(parentFilter.filterLocalIdentifier),
            ),
        },
    };
}

/**
 * Determines the appropriate filter to use based on validation results.
 *
 * @param originalFilter - Original filter from the dashboard
 * @param filterToMerge - Filter to merge
 * @param validationResults - Validation results for this filter pair
 * @param missingAttributeFilterLocalIdentifiers - List of local identifiers of missing attribute filters
 * @returns The filter to use in the merged result
 */
function determineFilterToUse(
    originalFilter: FilterContextItem,
    filterToMerge: FilterContextItem,
    validationResults: ValidationResult[],
    missingAttributeFilterLocalIdentifiers: string[],
): FilterContextItem {
    // If no validation issues, use the filter to merge
    if (validationResults.length === 0) {
        return filterToMerge;
    }

    // Handle special case of multi-to-single validation
    if (
        isDashboardAttributeFilter(originalFilter) &&
        isDashboardAttributeFilter(filterToMerge) &&
        validationResults.some((result) => result.error === "cannot-apply-multi-to-single")
    ) {
        return limitAttributeFilterToFirstElement(filterToMerge);
    }

    if (
        isDashboardAttributeFilter(filterToMerge) &&
        validationResults.some((result) => result.error === "parent-filter-is-missing")
    ) {
        return removeInvalidParentFilterLinks(filterToMerge, missingAttributeFilterLocalIdentifiers);
    }

    // For all other validation issues, keep the original filter
    return originalFilter;
}

/**
 * Merges an attribute filter from the original filter list with a corresponding filter to merge.
 *
 * @param originalFilter - Original attribute filter
 * @param filterToMerge - Attribute filter to merge, if found
 * @param attributeFilterConfigs - Attribute filter configurations
 * @param missingAttributeFilterLocalIdentifiers - List of local identifiers of missing attribute filters
 * @returns Object containing the merged filter and validation results
 */
function mergeAttributeFilter(
    originalFilter: IDashboardAttributeFilter,
    filterToMerge: FilterContextItem | undefined,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] | undefined,
    missingAttributeFilterLocalIdentifiers: string[],
): { mergedFilter: FilterContextItem; validationResults: ValidationResult[] } {
    // No matching filter found, keep original
    if (!filterToMerge || !isDashboardAttributeFilter(filterToMerge)) {
        return {
            mergedFilter: originalFilter,
            validationResults: [],
        };
    }

    // Find the filter configuration using the local identifier
    const filterLocalIdentifier = originalFilter.attributeFilter.localIdentifier;
    const filterConfigsMap = createAttributeFilterConfigsMap(attributeFilterConfigs);
    const filterConfig = filterLocalIdentifier ? filterConfigsMap.get(filterLocalIdentifier) : undefined;

    // Validate filter
    const validationResults = validateAttributeFilter(
        originalFilter,
        filterToMerge,
        filterConfig,
        missingAttributeFilterLocalIdentifiers,
    );

    // Determine which filter to use based on validation
    const mergedFilter = determineFilterToUse(
        originalFilter,
        filterToMerge,
        validationResults,
        missingAttributeFilterLocalIdentifiers,
    );

    return {
        mergedFilter,
        validationResults,
    };
}

/**
 * Merges a date filter from the original filter list with a corresponding filter to merge.
 *
 * @param originalFilter - Original date filter
 * @param filterToMerge - Date filter to merge, if found
 * @param dateFilterConfig - Common date filter configuration
 * @param dateFilterConfigs - Date filter configurations by dataset
 * @returns Object containing the merged filter and validation results
 */
function mergeDateFilter(
    originalFilter: IDashboardDateFilter,
    filterToMerge: FilterContextItem | undefined,
    dateFilterConfig?: IDashboardDateFilterConfig,
    dateFilterConfigs?: IDashboardDateFilterConfigItem[],
): { mergedFilter: FilterContextItem; validationResults: ValidationResult[] } {
    // No matching filter found, keep original
    if (!filterToMerge || !isDashboardDateFilter(filterToMerge)) {
        return {
            mergedFilter: originalFilter,
            validationResults: [],
        };
    }

    const isCommonDateFilter = !originalFilter.dateFilter.dataSet;
    const validationResults: ValidationResult[] = [];

    // Apply the appropriate validation rules based on filter type
    if (isCommonDateFilter) {
        // For common date filters (without dataSet)
        if (dateFilterConfig?.mode === "hidden") {
            validationResults.push({
                filter: filterToMerge,
                error: "cannot-apply-hidden",
            });
        } else if (dateFilterConfig?.mode === "readonly") {
            validationResults.push({
                filter: filterToMerge,
                error: "cannot-apply-readonly",
            });
        }
    } else {
        // For date filters with dimensions (with dataSet)
        const dateDataSet = originalFilter.dateFilter.dataSet;
        if (dateDataSet) {
            const dateFilterConfigsMap = createDateFilterConfigsMap(dateFilterConfigs || []);
            const filterConfig = dateFilterConfigsMap.get(dateDataSet);

            if (filterConfig?.config.mode === "hidden") {
                validationResults.push({
                    filter: filterToMerge,
                    error: "cannot-apply-hidden",
                });
            } else if (filterConfig?.config.mode === "readonly") {
                validationResults.push({
                    filter: filterToMerge,
                    error: "cannot-apply-readonly",
                });
            }
        }
    }

    // If there are validation issues, keep the original filter
    // Otherwise use the filter to merge
    return {
        mergedFilter: validationResults.length > 0 ? originalFilter : filterToMerge,
        validationResults,
    };
}

/**
 * Merges dashboard filters according to configuration rules.
 *
 * This function validates and merges dashboard filters from one context into another,
 * respecting filter configuration settings like read-only or hidden status.
 *
 * @param originalFilters - Original filters from the dashboard
 * @param filtersToMerge - Filters to be merged into the dashboard
 * @param config - Dashboard filter configuration
 * @returns Object containing merged filters and validation results
 * @internal
 */
export function mergeFilterContextFilters(
    originalFilters: FilterContextItem[],
    filtersToMerge: FilterContextItem[],
    config: IDashboardFilterMergeConfig,
): { mergedFilters: FilterContextItem[]; validationResults: ValidationResult[] } {
    // Find filters that are missing in the dashboard
    const missingFilterValidationResults = findMissingFilters(originalFilters, filtersToMerge);
    const missingAttributeFilterLocalIdentifiers = missingFilterValidationResults
        .map((result) =>
            isDashboardAttributeFilter(result.filter)
                ? result.filter.attributeFilter.localIdentifier
                : undefined,
        )
        .filter((localIdentifier) => localIdentifier !== undefined);

    // Process each original filter
    const mergeResults = originalFilters.map((originalFilter) => {
        // Find matching filter to merge
        const filterToMerge = findMatchingFilterToMerge(originalFilter, filtersToMerge);

        if (isDashboardAttributeFilter(originalFilter)) {
            return mergeAttributeFilter(
                originalFilter,
                filterToMerge,
                config.attributeFilterConfigs,
                missingAttributeFilterLocalIdentifiers,
            );
        } else if (isDashboardDateFilter(originalFilter)) {
            return mergeDateFilter(
                originalFilter,
                filterToMerge,
                config.dateFilterConfig,
                config.dateFilterConfigs,
            );
        } else {
            // For unknown filter types, just keep the original with no validation
            return {
                mergedFilter: originalFilter,
                validationResults: [] as ValidationResult[],
            };
        }
    });

    // Combine all validation results
    const validationResults = [
        ...missingFilterValidationResults,
        ...mergeResults.flatMap((result) => result.validationResults),
    ];

    // Extract the merged filters
    const mergedFilters = mergeResults.map((result) => result.mergedFilter);

    return {
        mergedFilters,
        validationResults,
    };
}
