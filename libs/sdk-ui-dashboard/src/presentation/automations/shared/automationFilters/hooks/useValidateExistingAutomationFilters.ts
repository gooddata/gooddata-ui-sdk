// (C) 2025-2026 GoodData Corporation

import { differenceBy, omit } from "lodash-es";

import {
    type DashboardAttributeFilterSelectionType,
    DashboardParameterModeValues,
    type FilterContextItem,
    type IAbsoluteDateFilter,
    type IAutomationMetadataObject,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IFilter,
    type IFilterableWidget,
    type IInsight,
    type IParameterMetadataObject,
    type IRelativeDateFilter,
    dashboardFilterLocalIdentifier,
    filterLocalIdentifier,
    isAllDashboardMeasureValueFilter,
    isAllValuesAttributeFilter,
    isAllValuesDashboardAttributeFilter,
    isAttributeFilter,
    isAttributeFilterWithSelection,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDateFilter,
    isInsightWidget,
    isLocalIdRef,
    isNegativeAttributeFilter,
    isNumberParameterDefinition,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

import {
    getAutomationAlertParameters,
    getAutomationExportParametersByTab,
} from "../../../../../_staging/automation/index.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../../../converters/filterConverters.js";
import { isFilterTypeCompatibleWithSelectionType } from "../../../../../model/commandHandlers/dashboard/common/attributeFilterSelectionTypeCompatibility.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../../model/store/config/configSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectSmartPersistedTabsParameters } from "../../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectTabs } from "../../../../../model/store/tabs/tabsSelectors.js";
import { type ExtendedDashboardWidget } from "../../../../../model/types/layoutTypes.js";
import { type IDashboardFilter } from "../../../../../types.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import {
    getAutomationAlertFilters,
    getAutomationDashboardFilters,
    getAutomationDashboardFiltersByTab,
    getAutomationVisualizationFilters,
} from "../../utils/automationUtils.js";
import { hasStaleAlertParameters } from "../automationParameters.js";
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
    automationToEdit: IAutomationMetadataObject | undefined,
    widget: ExtendedDashboardWidget | undefined,
    savedDashboardFilters: FilterContextItem[] | undefined,
    savedDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined,
): boolean {
    if (!automationToEdit) {
        return true;
    }
    // Handle case, when dashboard scheduled export filters are not saved (undefined === always use latest dashboard filters in the scheduled export)
    // Also do not validate widgets that are not insight widgets
    if (widget) {
        return !isInsightWidget(widget);
    }
    return typeof savedDashboardFilters === "undefined" && typeof savedDashboardFiltersByTab === "undefined";
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
    incompatibleSelectionTypeIsAppliedInSavedFilters: boolean;
    /**
     * A stored parameter override is stale. A missing workspace parameter (its ref left the
     * catalog) is the shared signal for both flows; export schedules additionally flag a removed
     * tab or a `readonly`/`hidden` parameter whose pinned value drifted from the dashboard.
     */
    parametersAreStale?: boolean;
    /**
     * Filter staleness in isolation — kept separate because `isValid` folds it together with
     * {@link parametersAreStale}, so a filters-only repair can't recover it from `!isValid`.
     */
    filtersAreStale?: boolean;
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
    incompatibleSelectionTypeIsAppliedInSavedFilters: false,
    parametersAreStale: false,
};

export function useValidateExistingAutomationFilters({
    automationToEdit,
    widget,
    insight,
}: {
    automationToEdit?: IAutomationMetadataObject;
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
}): IAutomationValidationResult {
    const {
        lockedFilters,
        hiddenFilters,
        availableFilters: dashboardFilters,
        commonDateFilterId,
        automationFiltersByTab: dashboardFiltersByTab,
        attributeFilterSelectionTypeMap: selectionTypeMap,
        attributeFilterSelectionTypeMapByTab: selectionTypeMapByTab,
    } = useAutomationsContext();
    const parametersEnabled = useDashboardSelector(selectEnableParameters);
    const catalogParameters = useDashboardSelector(selectCatalogParameters);
    const catalogParametersIsLoaded = useDashboardSelector(selectCatalogParametersIsLoaded);
    const dashboardParametersByTab = useDashboardSelector(selectSmartPersistedTabsParameters);
    const tabs = useDashboardSelector(selectTabs);
    const widgetTabMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);

    // A widget export covers exactly the widget's current tab, so its stored overrides must live under
    // that tab; a dashboard export covers every tab. Resolved here so the validator can flag a widget
    // whose stored override was orphaned under its previous tab after a move.
    const widgetTabId = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    // Before the catalog loads, every stored ref looks removed — treat loading as not-stale.
    const parametersAreStale =
        parametersEnabled && catalogParametersIsLoaded
            ? validateExistingAutomationParameters({
                  storedParametersByTab: getAutomationExportParametersByTab(automationToEdit),
                  catalog: catalogParameters,
                  dashboardParametersByTab,
                  existingTabIds: new Set((tabs ?? []).map((tab) => tab.localIdentifier)),
                  widgetTabId,
              }) || validateExistingAutomationAlertParameters(automationToEdit, catalogParameters)
            : false;

    const filterValidation = resolveFilterValidation({
        automationToEdit,
        widget,
        insight,
        lockedFilters,
        hiddenFilters,
        dashboardFilters,
        commonDateFilterId,
        dashboardFiltersByTab,
        selectionTypeMap,
        selectionTypeMapByTab,
    });

    // Parameter staleness is resolved at this single hook boundary and folded into the filter result
    // exactly once; the pure filter validators below never deal with the parameter concept.
    return {
        ...filterValidation,
        isValid: filterValidation.isValid && !parametersAreStale,
        parametersAreStale,
        filtersAreStale: !filterValidation.isValid,
    };
}

/**
 * Resolves the filter-only validation result (no parameter staleness) for an existing automation.
 * Pure: it takes everything the hook already read from the store, so the early-return branching stays
 * testable and free of React hooks.
 */
function resolveFilterValidation({
    automationToEdit,
    widget,
    insight,
    lockedFilters,
    hiddenFilters,
    dashboardFilters,
    commonDateFilterId,
    dashboardFiltersByTab,
    selectionTypeMap,
    selectionTypeMapByTab,
}: {
    automationToEdit?: IAutomationMetadataObject;
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    lockedFilters: FilterContextItem[];
    hiddenFilters: FilterContextItem[];
    dashboardFilters: FilterContextItem[];
    commonDateFilterId?: string;
    dashboardFiltersByTab: IAutomationFiltersPerTabData[];
    selectionTypeMap?: Map<string, DashboardAttributeFilterSelectionType | undefined>;
    selectionTypeMapByTab?: Record<string, Map<string, DashboardAttributeFilterSelectionType | undefined>>;
}): IAutomationValidationResult {
    const savedAutomationVisibleFilters = automationToEdit?.metadata?.visibleFilters;
    const savedAutomationVisibleFiltersByTab = automationToEdit?.metadata?.visibleFiltersByTab;

    const ignoredFilters = widget ? dashboardFilters.filter((f) => isFilterIgnoredByWidget(f, widget)) : [];

    const { executionFilters: savedScheduleFilters, filterContextItems: savedScheduleFilterContextItems } =
        getAutomationVisualizationFilters(automationToEdit);
    const savedAlertFilters = getAutomationAlertFilters(automationToEdit);
    const savedDashboardFilters = getAutomationDashboardFilters(automationToEdit);
    const savedDashboardFiltersByTab = getAutomationDashboardFiltersByTab(automationToEdit);

    if (shouldSkipValidation(automationToEdit, widget, savedDashboardFilters, savedDashboardFiltersByTab)) {
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
            selectionTypeMapByTab,
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
        selectionTypeMap,
    });
}

//
// Validations
//

/**
 * Flags stale stored parameter overrides for an existing automation: a ref that left the workspace
 * catalog, a tab that no longer exists, or a `readonly`/`hidden` parameter whose pinned value
 * drifted from the current dashboard. `active` parameters are user-owned, so their drift is allowed.
 */
export function validateExistingAutomationParameters({
    storedParametersByTab,
    catalog,
    dashboardParametersByTab,
    existingTabIds,
    widgetTabId,
}: {
    storedParametersByTab: Record<string, IDashboardExportParameter[]> | undefined;
    catalog: IParameterMetadataObject[];
    dashboardParametersByTab: Record<string, IDashboardParameter[]>;
    existingTabIds: Set<string>;
    /**
     * For widget schedules, the widget's current tab. A stored override under any other tab is
     * orphaned (the widget was moved) and flagged stale. Undefined for dashboard schedules and when
     * the tab can't be resolved, where every existing tab is accepted.
     */
    widgetTabId?: string;
}): boolean {
    if (!storedParametersByTab) {
        return false;
    }
    const workspaceById = new Map(catalog.map((parameter) => [parameter.id, parameter]));
    for (const [tabId, storedParameters] of Object.entries(storedParametersByTab)) {
        const tabIsValid = widgetTabId === undefined ? existingTabIds.has(tabId) : tabId === widgetTabId;
        if (!tabIsValid) {
            return true;
        }
        const dashboardById = new Map(
            (dashboardParametersByTab[tabId] ?? []).map((parameter) => [parameter.ref.identifier, parameter]),
        );
        for (const stored of storedParameters) {
            const workspaceParameter = workspaceById.get(stored.id);
            if (!workspaceParameter) {
                return true;
            }
            if ((stored.parameterType ?? "NUMBER") !== workspaceParameter.definition.type) {
                return true;
            }
            const dashboardParameter = dashboardById.get(stored.id);
            const mode = dashboardParameter?.mode ?? DashboardParameterModeValues.ACTIVE;
            const isPinnedByAuthor =
                mode === DashboardParameterModeValues.READONLY ||
                mode === DashboardParameterModeValues.HIDDEN;
            if (!isPinnedByAuthor) {
                continue;
            }
            const currentValue = dashboardParameter?.value ?? workspaceParameter.definition.defaultValue;
            // NUMBER compares numerically so a non-canonical stored encoding (e.g. "1.50") doesn't read as drift
            const valueDrifted = isNumberParameterDefinition(workspaceParameter.definition)
                ? Number(stored.value) !== currentValue
                : String(currentValue) !== stored.value;
            if (valueDrifted) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Sibling of {@link validateExistingAutomationParameters} for the alert path.
 */
function validateExistingAutomationAlertParameters(
    automationToEdit: IAutomationMetadataObject | undefined,
    catalog: IParameterMetadataObject[],
): boolean {
    return hasStaleAlertParameters(getAutomationAlertParameters(automationToEdit), catalog);
}

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
    selectionTypeMap,
}: {
    savedAutomationFilters: IFilter[];
    savedAutomationVisibleFilters: undefined | IAutomationVisibleFilter[];
    hiddenFilters: FilterContextItem[];
    lockedFilters: FilterContextItem[];
    ignoredFilters: FilterContextItem[];
    dashboardFilters: FilterContextItem[];
    widget?: ExtendedDashboardWidget;
    insight?: IInsight;
    selectionTypeMap?: Map<string, DashboardAttributeFilterSelectionType | undefined>;
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

    const { removedFilterIsAppliedInSavedFilters } = validateRemovedFilters(
        savedAutomationFilters,
        dashboardFilters,
        insightFilters,
        widget,
    );

    const { incompatibleSelectionTypeIsAppliedInSavedFilters } = validateSelectionTypeFilters(
        savedAutomationFilters,
        selectionTypeMap,
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
        incompatibleSelectionTypeIsAppliedInSavedFilters,
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
        incompatibleSelectionTypeIsAppliedInSavedFilters,
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
    selectionTypeMapByTab,
}: {
    savedDashboardFiltersByTab: Record<string, FilterContextItem[]>;
    savedAutomationVisibleFiltersByTab: Record<string, IAutomationVisibleFilter[]>;
    dashboardFiltersPerTab: IAutomationFiltersPerTabData[];
    commonDateFilterId?: string;
    selectionTypeMapByTab?: Record<string, Map<string, DashboardAttributeFilterSelectionType | undefined>>;
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
            selectionTypeMap: selectionTypeMapByTab?.[tabId],
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
            incompatibleSelectionTypeIsAppliedInSavedFilters:
                aggregated.incompatibleSelectionTypeIsAppliedInSavedFilters ||
                tabResult.incompatibleSelectionTypeIsAppliedInSavedFilters,
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
        // Noop "all values" attribute filters are not saved in automation filters, so we can skip them
        if (isAllValuesAttributeFilter(hiddenFilter)) {
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
        // Noop "all values" attribute filters are not saved in automation filters, so we can skip them
        if (isAllValuesAttributeFilter(lockedFilter)) {
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

function validateSelectionTypeFilters(
    savedAutomationFilters: IFilter[],
    selectionTypeMap?: Map<string, DashboardAttributeFilterSelectionType | undefined>,
): { incompatibleSelectionTypeIsAppliedInSavedFilters: boolean } {
    let incompatibleSelectionTypeIsAppliedInSavedFilters = false;
    for (const savedFilter of savedAutomationFilters) {
        if (!isAttributeFilter(savedFilter)) {
            continue;
        }

        const localIdentifier = filterLocalIdentifier(savedFilter);
        if (!localIdentifier) {
            continue;
        }

        const filterType = isAttributeFilterWithSelection(savedFilter) ? "list" : "text";
        const configuredSelectionType = selectionTypeMap?.get(localIdentifier);
        const singleSelectionDefault =
            isDashboardAttributeFilter(savedFilter) && isSingleSelectionFilter(savedFilter)
                ? "list"
                : undefined;
        const isIncompatible = !isFilterTypeCompatibleWithSelectionType(
            filterType,
            configuredSelectionType,
            singleSelectionDefault,
        );

        if (isIncompatible) {
            incompatibleSelectionTypeIsAppliedInSavedFilters = true;
        }
    }

    return { incompatibleSelectionTypeIsAppliedInSavedFilters };
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
            // Check if the current dashboard filter is "All values" - noop attribute filters
            // are intentionally not saved in execution filters, so a missing match is expected.
            const currentDashboardFilter = dashboardFilters.find(
                (dashboardFilter) => dashboardFilterLocalIdentifier(dashboardFilter) === localIdentifier,
            );
            if (isAllValuesDashboardAttributeFilter(currentDashboardFilter)) {
                continue;
            }
            if (isAllDashboardMeasureValueFilter(currentDashboardFilter)) {
                continue;
            }
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
