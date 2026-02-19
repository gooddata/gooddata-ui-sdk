// (C) 2025-2026 GoodData Corporation

import { differenceBy, omit } from "lodash-es";

import {
    type FilterContextItem,
    type IAbsoluteDateFilter,
    type IAutomationMetadataObject,
    type IAutomationVisibleFilter,
    type IFilter,
    type IFilterableWidget,
    type IInsight,
    type IRelativeDateFilter,
    dashboardFilterLocalIdentifier,
    filterLocalIdentifier,
    isDashboardCommonDateFilter,
    isDateFilter,
    isInsightWidget,
    isLocalIdRef,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import {
    getAutomationAlertFilters,
    getAutomationDashboardFilters,
    getAutomationDashboardFiltersByTab,
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/filterConverters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectAutomationCommonDateFilterId,
    selectAutomationFiltersByTab,
    selectDashboardFiltersWithoutCrossFiltering,
    selectDashboardHiddenFilters,
    selectDashboardLockedFilters,
} from "../../../model/store/filtering/dashboardFilterSelectors.js";
import type { ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";
import { type IDashboardFilter } from "../../../types.js";
import {
    areFiltersEqual,
    isFilterIgnoredByWidget,
    isFilterMatch,
    isNoopAllTimeDateFilterFixed,
} from "../utils.js";

function sanitizeCommonDateFilter(filter: IDashboardFilter, commonDateFilterId?: string): IDashboardFilter {
    // Sanitize common date filters by removing date dataSet
    if (isDateFilter(filter) && filterLocalIdentifier(filter) === commonDateFilterId) {
        return isRelativeDateFilter(filter)
            ? (omit(filter, "relativeDateFilter.dataSet") as IRelativeDateFilter)
            : (omit(filter, "absoluteDateFilter.dataSet") as IAbsoluteDateFilter);
    }
    return filter;
}

function shouldSkipValidation(
    enableAutomationFilterContext: boolean | undefined,
    automationToEdit: IAutomationMetadataObject | undefined,
    widget: ExtendedDashboardWidget | undefined,
    savedDashboardFilters: FilterContextItem[] | undefined,
): boolean {
    if (!enableAutomationFilterContext || !automationToEdit) {
        return true;
    }
    // Handle case, when dashboard scheduled export filters are not saved (undefined === always use latest dashboard filters in the scheduled export)
    // Also do not validate widgets that are not insight widgets
    if (widget) {
        return !isInsightWidget(widget);
    }
    return typeof savedDashboardFilters === "undefined";
}

function hasMatchingPerTabFormat(
    widget: ExtendedDashboardWidget | undefined,
    dashboardFiltersByTab: IAutomationFiltersPerTabData[],
    savedAutomationVisibleFiltersByTab: Record<string, IAutomationVisibleFilter[]> | undefined,
    savedDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined,
): boolean {
    return (
        !widget &&
        dashboardFiltersByTab.length > 1 &&
        Boolean(savedAutomationVisibleFiltersByTab) &&
        Boolean(savedDashboardFiltersByTab)
    );
}

function hasFormatMismatch(
    widget: ExtendedDashboardWidget | undefined,
    dashboardFiltersByTab: IAutomationFiltersPerTabData[],
    savedAutomationVisibleFiltersByTab: Record<string, IAutomationVisibleFilter[]> | undefined,
    savedDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined,
): boolean {
    const automationHasPerTabFilters = Boolean(
        savedAutomationVisibleFiltersByTab || savedDashboardFiltersByTab,
    );
    const dashboardHasPerTabFilters = !widget && dashboardFiltersByTab.length > 1;
    return automationHasPerTabFilters !== dashboardHasPerTabFilters;
}

export interface IAutomationValidationResult {
    isValid: boolean;
    hiddenFilterIsMissingInSavedFilters: boolean;
    hiddenFilterHasDifferentValueInSavedFilter: boolean;
    lockedFilterIsMissingInSavedFilters: boolean;
    lockedFilterHasDifferentValueInSavedFilter: boolean;
    ignoredFilterIsAppliedInSavedFilters: boolean;
    removedFilterIsAppliedInSavedFilters: boolean;
    commonDateFilterIsMissingInSavedVisibleFilters: boolean;
    visibleFilterIsMissingInSavedFilters: boolean;
    visibleFiltersAreMissing: boolean;
}

const defaultValidState: IAutomationValidationResult = {
    isValid: true,
    hiddenFilterIsMissingInSavedFilters: false,
    hiddenFilterHasDifferentValueInSavedFilter: false,
    lockedFilterIsMissingInSavedFilters: false,
    lockedFilterHasDifferentValueInSavedFilter: false,
    ignoredFilterIsAppliedInSavedFilters: false,
    removedFilterIsAppliedInSavedFilters: false,
    commonDateFilterIsMissingInSavedVisibleFilters: false,
    visibleFilterIsMissingInSavedFilters: false,
    visibleFiltersAreMissing: false,
};

export function useValidateExistingAutomationFilters({
    automationToEdit,
    widget,
    insight,
    enableAutomationFilterContext,
}: {
    automationToEdit?: IAutomationMetadataObject;
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    enableAutomationFilterContext?: boolean;
}): IAutomationValidationResult {
    const lockedFilters = useDashboardSelector(selectDashboardLockedFilters);
    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const dashboardFilters = useDashboardSelector(selectDashboardFiltersWithoutCrossFiltering);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const dashboardFiltersByTab = useDashboardSelector(selectAutomationFiltersByTab);

    const savedAutomationVisibleFilters = automationToEdit?.metadata?.visibleFilters;
    const savedAutomationVisibleFiltersByTab = automationToEdit?.metadata?.visibleFiltersByTab;

    const ignoredFilters = widget ? dashboardFilters.filter((f) => isFilterIgnoredByWidget(f, widget)) : [];

    const { executionFilters: savedScheduleFilters, filterContextItems: savedScheduleFilterContextItems } =
        getAutomationVisualizationFilters(automationToEdit);
    const savedAlertFilters = getAutomationAlertFilters(automationToEdit);
    const savedDashboardFilters = getAutomationDashboardFilters(automationToEdit);
    const savedDashboardFiltersByTab = getAutomationDashboardFiltersByTab(automationToEdit);

    if (
        shouldSkipValidation(enableAutomationFilterContext, automationToEdit, widget, savedDashboardFilters)
    ) {
        return defaultValidState;
    }

    // Check for matching format scenario: both automation and dashboard have per-tab structure
    // When both have per-tab structure, validate tab by tab
    if (
        hasMatchingPerTabFormat(
            widget,
            dashboardFiltersByTab,
            savedAutomationVisibleFiltersByTab,
            savedDashboardFiltersByTab,
        )
    ) {
        return validateExistingAutomationFiltersPerTab({
            savedDashboardFiltersByTab: savedDashboardFiltersByTab!,
            savedAutomationVisibleFiltersByTab: savedAutomationVisibleFiltersByTab!,
            dashboardFiltersPerTab: dashboardFiltersByTab,
            commonDateFilterId,
        });
    }

    // Handle migration scenarios where formats don't match
    // If there's a format mismatch (automation saved with different structure than current dashboard),
    // mark as invalid - user needs to apply latest filters to migrate to the new structure
    if (
        hasFormatMismatch(
            widget,
            dashboardFiltersByTab,
            savedAutomationVisibleFiltersByTab,
            savedDashboardFiltersByTab,
        )
    ) {
        return {
            ...defaultValidState,
            isValid: false,
            visibleFiltersAreMissing: true,
        };
    }

    const savedDashboardFiltersAsExecutionFilters = filterContextItemsToDashboardFiltersByWidget(
        savedDashboardFilters ?? [],
    ).map((filter): IDashboardFilter => sanitizeCommonDateFilter(filter, commonDateFilterId));

    const savedScheduleFiltersAsExecutionFilters =
        savedScheduleFilterContextItems === undefined
            ? undefined
            : filterContextItemsToDashboardFiltersByWidget(savedScheduleFilterContextItems).map(
                  (filter): IDashboardFilter => sanitizeCommonDateFilter(filter, commonDateFilterId),
              );

    const savedAutomationFilters =
        savedScheduleFilters ??
        savedScheduleFiltersAsExecutionFilters ??
        savedAlertFilters ??
        savedDashboardFiltersAsExecutionFilters;

    return validateExistingAutomationFilters({
        savedAutomationFilters,
        savedAutomationVisibleFilters,
        hiddenFilters,
        lockedFilters,
        ignoredFilters,
        dashboardFilters,
        widget,
        insight,
    });
}

//
// Validations
//

/**
 * Validate existing automation filters against current dashboard filter context and optionally saved widget / insight.
 * Check for inconsistencies, that could lead to unwanted results when editing existing automation.
 *
 * What can happen:
 * - Hidden filter value on the dashboard is different from the saved automation filter value, or it is missing
 * - Locked filter value on the dashboard is different from the saved automation filter value, or it is missing
 * - Some insight filter is missing in the saved automation, or it has different value
 * - Ignored filter is applied in the saved automation
 * - Removed filter is applied in the saved automation
 * - Attribute filter display form has changed
 * - Common non all-time date filter is missing in the saved automation visible filters
 * - Visible filter is missing in the saved automation filters
 */
export function validateExistingAutomationFilters({
    savedAutomationFilters,
    savedAutomationVisibleFilters,
    hiddenFilters,
    lockedFilters,
    ignoredFilters,
    dashboardFilters,
    widget,
    insight,
}: {
    savedAutomationFilters: IFilter[];
    savedAutomationVisibleFilters: undefined | IAutomationVisibleFilter[];
    hiddenFilters: FilterContextItem[];
    lockedFilters: FilterContextItem[];
    ignoredFilters: FilterContextItem[];
    dashboardFilters: FilterContextItem[];
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
}): IAutomationValidationResult {
    const insightFilters = insight?.insight.filters ?? [];

    const { hiddenFilterIsMissingInSavedFilters, hiddenFilterHasDifferentValueInSavedFilter } =
        validateHiddenFilters(savedAutomationFilters, hiddenFilters, ignoredFilters, widget);

    const { lockedFilterIsMissingInSavedFilters, lockedFilterHasDifferentValueInSavedFilter } =
        validateLockedFilters(savedAutomationFilters, lockedFilters, ignoredFilters, widget);

    const { ignoredFilterIsAppliedInSavedFilters } = validateIgnoredFilters(
        savedAutomationFilters,
        ignoredFilters,
        widget,
    );

    // This is handling also changed display forms
    const { removedFilterIsAppliedInSavedFilters } = validateRemovedFilters(
        savedAutomationFilters,
        dashboardFilters,
        insightFilters,
        widget,
    );

    const {
        commonDateFilterIsMissingInSavedVisibleFilters,
        visibleFilterIsMissingInSavedFilters,
        visibleFiltersAreMissing,
    } = validateVisibleFilters(
        savedAutomationFilters,
        savedAutomationVisibleFilters,
        dashboardFilters,
        ignoredFilters,
    );

    const isValid = [
        hiddenFilterIsMissingInSavedFilters,
        hiddenFilterHasDifferentValueInSavedFilter,
        lockedFilterIsMissingInSavedFilters,
        lockedFilterHasDifferentValueInSavedFilter,
        ignoredFilterIsAppliedInSavedFilters,
        removedFilterIsAppliedInSavedFilters,
        commonDateFilterIsMissingInSavedVisibleFilters,
        visibleFilterIsMissingInSavedFilters,
        visibleFiltersAreMissing,
    ].every((validationError) => validationError === false);

    return {
        isValid,
        hiddenFilterIsMissingInSavedFilters,
        hiddenFilterHasDifferentValueInSavedFilter,
        lockedFilterIsMissingInSavedFilters,
        lockedFilterHasDifferentValueInSavedFilter,
        ignoredFilterIsAppliedInSavedFilters,
        removedFilterIsAppliedInSavedFilters,
        commonDateFilterIsMissingInSavedVisibleFilters,
        visibleFilterIsMissingInSavedFilters,
        visibleFiltersAreMissing,
    };
}

export interface IAutomationFiltersPerTabData {
    tabId: string;
    availableFilters: FilterContextItem[];
    hiddenFilters: FilterContextItem[];
    lockedFilters: FilterContextItem[];
}

/**
 * Validate existing automation filters for dashboards with per-tab filter structure.
 * Validates each tab's filters and aggregates results - if any tab is invalid, the whole automation is invalid.
 */
export function validateExistingAutomationFiltersPerTab({
    savedDashboardFiltersByTab,
    savedAutomationVisibleFiltersByTab,
    dashboardFiltersPerTab,
    commonDateFilterId,
}: {
    savedDashboardFiltersByTab: Record<string, FilterContextItem[]>;
    savedAutomationVisibleFiltersByTab: Record<string, IAutomationVisibleFilter[]>;
    dashboardFiltersPerTab: IAutomationFiltersPerTabData[];
    commonDateFilterId?: string;
}): IAutomationValidationResult {
    const tabValidationResults = Object.entries(savedDashboardFiltersByTab).map(([tabId, tabFilters]) => {
        const tabVisibleFilters = savedAutomationVisibleFiltersByTab[tabId] ?? [];
        const tabData = dashboardFiltersPerTab.find((t) => t.tabId === tabId);

        if (!tabData) {
            // Tab no longer exists - mark as invalid
            return {
                ...defaultValidState,
                isValid: false,
                removedFilterIsAppliedInSavedFilters: true,
            };
        }

        const savedTabFiltersAsExecutionFilters = filterContextItemsToDashboardFiltersByWidget(
            tabFilters,
        ).map((filter): IDashboardFilter => sanitizeCommonDateFilter(filter, commonDateFilterId));

        // Validate this tab's filters against THIS TAB's dashboard configuration
        return validateExistingAutomationFilters({
            savedAutomationFilters: savedTabFiltersAsExecutionFilters,
            savedAutomationVisibleFilters: tabVisibleFilters,
            hiddenFilters: tabData.hiddenFilters,
            lockedFilters: tabData.lockedFilters,
            ignoredFilters: [],
            dashboardFilters: tabData.availableFilters,
            widget: undefined,
            insight: undefined,
        });
    });

    // Aggregate validation results - if any tab is invalid, the whole automation is invalid
    return tabValidationResults.reduce<IAutomationValidationResult>(
        (aggregated, tabResult) => ({
            isValid: aggregated.isValid && tabResult.isValid,
            hiddenFilterIsMissingInSavedFilters:
                aggregated.hiddenFilterIsMissingInSavedFilters ||
                tabResult.hiddenFilterIsMissingInSavedFilters,
            hiddenFilterHasDifferentValueInSavedFilter:
                aggregated.hiddenFilterHasDifferentValueInSavedFilter ||
                tabResult.hiddenFilterHasDifferentValueInSavedFilter,
            lockedFilterIsMissingInSavedFilters:
                aggregated.lockedFilterIsMissingInSavedFilters ||
                tabResult.lockedFilterIsMissingInSavedFilters,
            lockedFilterHasDifferentValueInSavedFilter:
                aggregated.lockedFilterHasDifferentValueInSavedFilter ||
                tabResult.lockedFilterHasDifferentValueInSavedFilter,
            ignoredFilterIsAppliedInSavedFilters:
                aggregated.ignoredFilterIsAppliedInSavedFilters ||
                tabResult.ignoredFilterIsAppliedInSavedFilters,
            removedFilterIsAppliedInSavedFilters:
                aggregated.removedFilterIsAppliedInSavedFilters ||
                tabResult.removedFilterIsAppliedInSavedFilters,
            commonDateFilterIsMissingInSavedVisibleFilters:
                aggregated.commonDateFilterIsMissingInSavedVisibleFilters ||
                tabResult.commonDateFilterIsMissingInSavedVisibleFilters,
            visibleFilterIsMissingInSavedFilters:
                aggregated.visibleFilterIsMissingInSavedFilters ||
                tabResult.visibleFilterIsMissingInSavedFilters,
            visibleFiltersAreMissing:
                aggregated.visibleFiltersAreMissing || tabResult.visibleFiltersAreMissing,
        }),
        defaultValidState,
    );
}

/**
 * Validates saved automation filters against current dashboard filter context hidden filters.
 * If we are editing saved automation, and in the meantime, some hidden filter was added to the original filter context,
 * or its value has changed, it likely means that also execution filters of the automation should be updated with the changes.
 */
function validateHiddenFilters(
    savedAutomationFilters: IFilter[],
    hiddenFilters: FilterContextItem[],
    ignoredFilters: FilterContextItem[],
    widget?: ExtendedDashboardWidget,
) {
    let hiddenFilterIsMissingInSavedFilters = false;
    let hiddenFilterHasDifferentValueInSavedFilter = false;

    const hiddenFiltersWithoutIgnored = differenceBy(
        hiddenFilters,
        ignoredFilters,
        dashboardFilterLocalIdentifier,
    );
    const hiddenFiltersAsIFilter = filterContextItemsToDashboardFiltersByWidget(
        hiddenFiltersWithoutIgnored,
        widget as IFilterableWidget,
    );

    for (const hiddenFilter of hiddenFiltersAsIFilter) {
        // Noop "all time" date filters should not be saved in automation filters, so we can skip them
        if (isNoopAllTimeDateFilterFixed(hiddenFilter)) {
            continue;
        }

        const storedHiddenFilter = savedAutomationFilters.find(
            (f) => filterLocalIdentifier(f) === filterLocalIdentifier(hiddenFilter),
        );

        if (storedHiddenFilter && !hiddenFilterHasDifferentValueInSavedFilter) {
            hiddenFilterHasDifferentValueInSavedFilter = !areFiltersEqual(storedHiddenFilter, hiddenFilter);
        }

        if (!storedHiddenFilter && !hiddenFilterIsMissingInSavedFilters) {
            hiddenFilterIsMissingInSavedFilters = true;
        }
    }

    return {
        hiddenFilterIsMissingInSavedFilters,
        hiddenFilterHasDifferentValueInSavedFilter,
    };
}

/**
 * Validates saved automation filters against current dashboard filter context locked filters.
 * If we are editing saved automation, and in the meantime, some locked filter was added to the original filter context,
 * or its value has changed, it likely means that also execution filters of the automation should be updated with the changes.
 */
function validateLockedFilters(
    savedAutomationFilters: IFilter[],
    lockedFilters: FilterContextItem[],
    ignoredFilters: FilterContextItem[],
    widget?: ExtendedDashboardWidget,
) {
    let lockedFilterIsMissingInSavedFilters = false;
    let lockedFilterHasDifferentValueInSavedFilter = false;

    const lockedFiltersWithoutIgnored = differenceBy(
        lockedFilters,
        ignoredFilters,
        dashboardFilterLocalIdentifier,
    );
    const lockedFilterAsIFilter = filterContextItemsToDashboardFiltersByWidget(
        lockedFiltersWithoutIgnored,
        widget as IFilterableWidget,
    );

    for (const lockedFilter of lockedFilterAsIFilter) {
        // Noop "all time" date filters are not saved in automation filters, so we can skip them
        if (isNoopAllTimeDateFilterFixed(lockedFilter)) {
            continue;
        }

        const storedLockedFilter = savedAutomationFilters.find(
            (f) => filterLocalIdentifier(f) === filterLocalIdentifier(lockedFilter),
        );

        if (storedLockedFilter && !lockedFilterHasDifferentValueInSavedFilter) {
            lockedFilterHasDifferentValueInSavedFilter = !areFiltersEqual(storedLockedFilter, lockedFilter);
        }

        if (!storedLockedFilter && !lockedFilterIsMissingInSavedFilters) {
            lockedFilterIsMissingInSavedFilters = true;
        }
    }

    return {
        lockedFilterIsMissingInSavedFilters,
        lockedFilterHasDifferentValueInSavedFilter,
    };
}

/**
 * Validates saved automation filters against current ignored widget filters.
 * If we are editing saved automation, and in the meantime, some filter started to be ignored by the widget,
 * it likely means that also execution filters of the automation should be updated with the changes.
 */
function validateIgnoredFilters(
    savedAutomationFilters: IFilter[],
    ignoredFilters: FilterContextItem[],
    widget?: ExtendedDashboardWidget,
) {
    let ignoredFilterIsAppliedInSavedFilters = false;

    const ignoredFiltersAsIFilter = filterContextItemsToDashboardFiltersByWidget(
        ignoredFilters,
        widget as IFilterableWidget,
    );

    for (const ignoredFilter of ignoredFiltersAsIFilter) {
        const storedIgnoredFilter = savedAutomationFilters.find(
            (f) => filterLocalIdentifier(f) === filterLocalIdentifier(ignoredFilter),
        );

        if (storedIgnoredFilter && !ignoredFilterIsAppliedInSavedFilters) {
            ignoredFilterIsAppliedInSavedFilters = true;
        }
    }

    return {
        ignoredFilterIsAppliedInSavedFilters,
    };
}

/**
 * Validates saved automation filters against current available dashboard / insight filters.
 * If we are editing saved automation, and in the meantime, some filter was removed from dashboard / insight,
 * it likely means that also execution filters of the automation should be updated with the changes.
 */
function validateRemovedFilters(
    savedAutomationFilters: IFilter[],
    dashboardFilters: FilterContextItem[],
    insightFilters: IFilter[],
    widget?: ExtendedDashboardWidget,
) {
    let removedFilterIsAppliedInSavedFilters = false;

    const dashboardFiltersAsIFilter = filterContextItemsToDashboardFiltersByWidget(
        dashboardFilters,
        widget as IFilterableWidget,
    );
    const availableFilters = [...dashboardFiltersAsIFilter, ...insightFilters];

    for (const savedFilter of savedAutomationFilters) {
        const availableFilter = availableFilters.find((filter) => isFilterMatch(filter, savedFilter));

        // Skip ad-hoc "slice filters" ("For" dropdown in alert dialog) - see `getAlertAttribute` or `transformAlertByAttribute` functions that handle that case
        const isSliceAttributeFilter = isSliceFilter(savedFilter);

        if (!availableFilter && !removedFilterIsAppliedInSavedFilters && !isSliceAttributeFilter) {
            removedFilterIsAppliedInSavedFilters = true;
        }
    }

    return {
        removedFilterIsAppliedInSavedFilters,
    };
}

function validateVisibleFilters(
    savedAutomationFilters: IFilter[],
    savedVisibleFilters: undefined | IAutomationVisibleFilter[],
    dashboardFilters: FilterContextItem[],
    ignoredFilters: FilterContextItem[],
) {
    let commonDateFilterIsMissingInSavedVisibleFilters = false;
    let visibleFilterIsMissingInSavedFilters = false;
    if (!savedVisibleFilters) {
        return {
            commonDateFilterIsMissingInSavedVisibleFilters,
            visibleFilterIsMissingInSavedFilters,
            visibleFiltersAreMissing: true,
        };
    }
    for (const savedVisibleFilter of savedVisibleFilters) {
        // All-time date filters are not saved in automation visible filters, so we can skip them
        if (savedVisibleFilter.isAllTimeDateFilter) {
            continue;
        }

        const localIdentifier = savedVisibleFilter.localIdentifier;
        const savedFilter = savedAutomationFilters.find((f) => filterLocalIdentifier(f) === localIdentifier);

        if (!savedFilter && !visibleFilterIsMissingInSavedFilters) {
            visibleFilterIsMissingInSavedFilters = true;
        }
    }

    const dashboardFiltersWithoutIgnored = differenceBy(
        dashboardFilters,
        ignoredFilters,
        dashboardFilterLocalIdentifier,
    );
    const nonIgnoredCommonDateFilter = dashboardFiltersWithoutIgnored.find(isDashboardCommonDateFilter);

    if (nonIgnoredCommonDateFilter) {
        const localIdentifier = dashboardFilterLocalIdentifier(nonIgnoredCommonDateFilter);
        const savedCommonDateFilter = savedVisibleFilters.find(
            (visibleFilter) => visibleFilter.localIdentifier === localIdentifier,
        );

        if (!savedCommonDateFilter && !commonDateFilterIsMissingInSavedVisibleFilters) {
            commonDateFilterIsMissingInSavedVisibleFilters = true;
        }
    }

    return {
        commonDateFilterIsMissingInSavedVisibleFilters,
        visibleFilterIsMissingInSavedFilters,
        visibleFiltersAreMissing: false,
    };
}

function isSliceFilter(filter: IFilter) {
    if (isPositiveAttributeFilter(filter)) {
        return (
            isLocalIdRef(filter.positiveAttributeFilter.displayForm) &&
            !filter.positiveAttributeFilter.localIdentifier
        );
    }
    if (isNegativeAttributeFilter(filter)) {
        return (
            isLocalIdRef(filter.negativeAttributeFilter.displayForm) &&
            !filter.negativeAttributeFilter.localIdentifier
        );
    }
    return false;
}
