// (C) 2025 GoodData Corporation
import differenceBy from "lodash/differenceBy.js";
import omit from "lodash/omit.js";
import uniq from "lodash/uniq.js";

import {
    FilterContextItem,
    IAbsoluteDateFilter,
    IAutomationMetadataObject,
    IAutomationVisibleFilter,
    IDashboardDateFilter,
    IFilter,
    IFilterableWidget,
    IInsight,
    IRelativeDateFilter,
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    filterLocalIdentifier,
    filterObjRef,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
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
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/index.js";
import {
    ExtendedDashboardWidget,
    selectAutomationCommonDateFilterId,
    selectDashboardFiltersWithoutCrossFiltering,
    selectDashboardHiddenFilters,
    selectDashboardLockedFilters,
    useDashboardSelector,
} from "../../../model/index.js";
import { IDashboardFilter } from "../../../types.js";
import {
    areFiltersEqual,
    isAllTimeDateFilterFixed,
    isFilterIgnoredByWidget,
    isFilterMatch,
} from "../utils.js";

export interface IAutomationValidationResult {
    isValid: boolean;
    hiddenFilterIsMissingInSavedFilters: boolean;
    hiddenFilterHasDifferentValueInSavedFilter: boolean;
    lockedFilterIsMissingInSavedFilters: boolean;
    lockedFilterHasDifferentValueInSavedFilter: boolean;
    ignoredFilterIsAppliedInSavedFilters: boolean;
    insightFilterIsMissingInSavedFilters: boolean;
    insightFilterHasDifferentValueInSavedFilter: boolean;
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
    insightFilterIsMissingInSavedFilters: false,
    insightFilterHasDifferentValueInSavedFilter: false,
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

    const savedAutomationVisibleFilters = automationToEdit?.metadata?.visibleFilters;

    const ignoredFilters = widget ? dashboardFilters.filter((f) => isFilterIgnoredByWidget(f, widget)) : [];

    const { executionFilters: savedScheduleFilters, filterContextItems: savedScheduleFilterContextItems } =
        getAutomationVisualizationFilters(automationToEdit);
    const savedAlertFilters = getAutomationAlertFilters(automationToEdit);
    const savedDashboardFilters = getAutomationDashboardFilters(automationToEdit);

    const savedDashboardFiltersAsExecutionFilters = filterContextItemsToDashboardFiltersByWidget(
        savedDashboardFilters ?? [],
    ).map((filter): IDashboardFilter => {
        // Sanitize common date filters by removing date dataSet
        if (isDateFilter(filter) && filterLocalIdentifier(filter) === commonDateFilterId) {
            return isRelativeDateFilter(filter)
                ? (omit(filter, "relativeDateFilter.dataSet") as IRelativeDateFilter)
                : (omit(filter, "absoluteDateFilter.dataSet") as IAbsoluteDateFilter);
        }
        return filter;
    });

    const savedScheduleFiltersAsExecutionFilters =
        savedScheduleFilterContextItems === undefined
            ? undefined
            : filterContextItemsToDashboardFiltersByWidget(savedScheduleFilterContextItems).map(
                  (filter): IDashboardFilter => {
                      // Sanitize common date filters by removing date dataSet
                      if (isDateFilter(filter) && filterLocalIdentifier(filter) === commonDateFilterId) {
                          return isRelativeDateFilter(filter)
                              ? (omit(filter, "relativeDateFilter.dataSet") as IRelativeDateFilter)
                              : (omit(filter, "absoluteDateFilter.dataSet") as IAbsoluteDateFilter);
                      }
                      return filter;
                  },
              );

    const savedAutomationFilters =
        savedScheduleFilters ??
        savedScheduleFiltersAsExecutionFilters ??
        savedAlertFilters ??
        savedDashboardFiltersAsExecutionFilters;

    const skipValidation =
        !enableAutomationFilterContext ||
        !automationToEdit ||
        // Handle case, when dashboard scheduled export filters are not saved (undefined === always use latest dashboard filters in the scheduled export)
        // Also do not validate widgets that are not insight widgets
        (widget ? !isInsightWidget(widget) : typeof savedDashboardFilters === "undefined");

    if (skipValidation) {
        return defaultValidState;
    }

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

    const { insightFilterIsMissingInSavedFilters, insightFilterHasDifferentValueInSavedFilter } =
        validateInsightFilters(
            savedAutomationFilters,
            dashboardFilters,
            ignoredFilters,
            hiddenFilters,
            insightFilters,
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
        insightFilterIsMissingInSavedFilters,
        insightFilterHasDifferentValueInSavedFilter,
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
        insightFilterIsMissingInSavedFilters,
        insightFilterHasDifferentValueInSavedFilter,
        removedFilterIsAppliedInSavedFilters,
        commonDateFilterIsMissingInSavedVisibleFilters,
        visibleFilterIsMissingInSavedFilters,
        visibleFiltersAreMissing,
    };
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
        // All-time date filters should not be saved in automation filters, so we can skip them
        if (isAllTimeDateFilterFixed(hiddenFilter)) {
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
        // All-time date filters are not saved in automation filters, so we can skip them
        if (isAllTimeDateFilterFixed(lockedFilter)) {
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

function validateInsightFilters(
    savedAutomationFilters: IFilter[],
    dashboardFilters: FilterContextItem[],
    ignoredFilters: FilterContextItem[],
    hiddenFilters: FilterContextItem[],
    insightFilters: IFilter[],
    widget?: ExtendedDashboardWidget,
) {
    let insightFilterIsMissingInSavedFilters = false;
    let insightFilterHasDifferentValueInSavedFilter = false;

    const visibleDateFilterIds = dashboardFilters
        .filter(isDashboardDateFilter)
        .map((filter) => dashboardFilterLocalIdentifier(filter));

    const hiddenDateFilterIds = hiddenFilters
        .filter(isDashboardDateFilter)
        .map((filter) => dashboardFilterLocalIdentifier(filter));

    const possibleDateFilters = [...dashboardFilters, ...hiddenFilters];
    const dateFilterOverridesIds = uniq([...visibleDateFilterIds, ...hiddenDateFilterIds]);
    const dateFilters = dateFilterOverridesIds.map((id) =>
        possibleDateFilters.find((filter) => dashboardFilterLocalIdentifier(filter) === id),
    ) as IDashboardDateFilter[];
    const nonIgnoredDateFilters = differenceBy(dateFilters, ignoredFilters, dashboardFilterLocalIdentifier);

    for (const insightFilter of insightFilters) {
        const objRef = filterObjRef(insightFilter);
        const isDateOverride =
            (isInsightWidget(widget) && areObjRefsEqual(objRef, widget.dateDataSet)) ||
            nonIgnoredDateFilters.some((dateFilter) =>
                areObjRefsEqual(objRef, dateFilter.dateFilter.dataSet),
            );

        // All-time date filters are not saved in automation filters, so we can skip them.
        // Also, we can skip insight filter with the same dateDataSet that is configured on the widget,
        // it does not make sense to validate it - both missing (was saved as all-time),
        // or different value (was changed by the dashboard) are valid cases,
        // same applies for other non-ignored date filters.
        if (isAllTimeDateFilterFixed(insightFilter) || isDateOverride) {
            continue;
        }

        const storedInsightFilter = savedAutomationFilters.find((filter) =>
            isFilterMatch(filter, insightFilter),
        );

        if (!storedInsightFilter && !insightFilterIsMissingInSavedFilters) {
            insightFilterIsMissingInSavedFilters = true;
        }

        if (storedInsightFilter && !insightFilterHasDifferentValueInSavedFilter) {
            insightFilterHasDifferentValueInSavedFilter = !areFiltersEqual(
                storedInsightFilter,
                insightFilter,
            );
        }
    }

    return {
        insightFilterIsMissingInSavedFilters,
        insightFilterHasDifferentValueInSavedFilter,
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
