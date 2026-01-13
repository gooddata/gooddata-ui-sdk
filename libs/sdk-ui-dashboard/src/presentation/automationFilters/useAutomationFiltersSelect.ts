// (C) 2025-2026 GoodData Corporation

import { useMemo, useState } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationVisibleFilter,
    isExportDefinitionDashboardRequestPayload,
} from "@gooddata/sdk-model";

import {
    useAutomationVisibleFilters,
    useAutomationVisibleFiltersByTab,
} from "./hooks/useAutomationVisibleFilters.js";
import {
    getDefaultSelectedFiltersByTabForExistingAutomation,
    useDefaultSelectedFiltersForExistingAutomation,
} from "./hooks/useDefaultSelectedFiltersForExistingAutomation.js";
import { useDefaultSelectedFiltersForNewAutomation } from "./hooks/useDefaultSelectedFiltersForNewAutomation.js";
import {
    type ExtendedDashboardWidget,
    type IAutomationFiltersTab,
    removeIgnoredWidgetFilters,
    selectAutomationCommonDateFilterId,
    selectAutomationFiltersByTab,
    selectDashboardFiltersWithoutCrossFiltering,
    selectEnableDashboardTabs,
    useDashboardSelector,
} from "../../model/index.js";

/**
 * Edited automation filters structured by tab ID.
 * Used for storing user edits to filters when dashboard tabs are enabled.
 * @internal
 */
export type EditedFiltersByTab = Record<string, FilterContextItem[]>;

/**
 * Result from useAutomationFiltersSelect hook.
 * @internal
 */
export interface IUseAutomationFiltersSelect {
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    storeFilters: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    availableFilters: FilterContextItem[] | undefined;
    availableFiltersAsVisibleFilters: IAutomationVisibleFilter[] | undefined;
    filtersForNewAutomation: FilterContextItem[];
    /**
     * Filters for new automation structured per tab.
     * Only provided for whole dashboard automations when dashboard tabs feature is enabled
     * and there are multiple tabs. When provided, the component should render filters grouped by tab.
     * When undefined, the component should use the flat filter list.
     */
    filtersByTab: IAutomationFiltersTab[] | undefined;
    /**
     * Edited filters structured by tab ID.
     * This is the state that stores user edits to per-tab filters until save.
     * Only provided when filtersByTab is provided.
     */
    editedAutomationFiltersByTab: EditedFiltersByTab | undefined;
    /**
     * Setter for editedFiltersByTab state.
     */
    setEditedAutomationFiltersByTab: (filters: EditedFiltersByTab) => void;

    availableFiltersAsVisibleFiltersByTab: Record<string, IAutomationVisibleFilter[]> | undefined;
}

/**
 * Checks if automation has all-time date filters stored in flat structure.
 */
function hasAllTimeDateFiltersInFlatStructure(
    automationToEdit: IAutomationMetadataObject | undefined,
): boolean {
    return automationToEdit?.metadata?.visibleFilters?.some((f) => f.isAllTimeDateFilter) ?? false;
}

/**
 * Checks if automation has filters stored in export definitions (flat structure).
 */
function hasFiltersInExportDefinitions(automationToEdit: IAutomationMetadataObject | undefined): boolean {
    return (
        automationToEdit?.exportDefinitions?.some((exportDefinition) => {
            return !!exportDefinition.requestPayload.content.filters;
        }) ?? false
    );
}

/**
 * Checks if automation has all-time date filters stored per tab.
 */
function hasAllTimeDateFiltersPerTab(automationToEdit: IAutomationMetadataObject | undefined): boolean {
    if (!automationToEdit?.metadata?.visibleFiltersByTab) {
        return false;
    }
    return Object.values(automationToEdit.metadata.visibleFiltersByTab).some((tabFilters) =>
        tabFilters.some((f) => f.isAllTimeDateFilter),
    );
}

/**
 * Checks if automation has filters stored per tab in export definitions.
 */
function hasFiltersByTabInExportDefinitions(
    automationToEdit: IAutomationMetadataObject | undefined,
): boolean {
    return (
        automationToEdit?.exportDefinitions?.some((exportDefinition) => {
            return (
                isExportDefinitionDashboardRequestPayload(exportDefinition.requestPayload) &&
                !!exportDefinition.requestPayload.content.filtersByTab
            );
        }) ?? false
    );
}

/**
 * Determines if the automation has any stored filters (either flat or per-tab structure).
 */
function checkAreFiltersStored(automationToEdit: IAutomationMetadataObject | undefined): boolean {
    // Check old flat filters structure
    const hasSavedSomeAllTimeDateFilters = hasAllTimeDateFiltersInFlatStructure(automationToEdit);
    const hasSavedFiltersInExportDefinitions = hasFiltersInExportDefinitions(automationToEdit);

    // Check new per-tab filters structure
    const hasSavedSomeAllTimeDateFiltersPerTab = hasAllTimeDateFiltersPerTab(automationToEdit);
    const hasSavedFiltersByTabInExportDefinitions = hasFiltersByTabInExportDefinitions(automationToEdit);

    // Filters are stored if either old OR new structure has filters
    return (
        hasSavedFiltersInExportDefinitions ||
        hasSavedSomeAllTimeDateFilters ||
        hasSavedFiltersByTabInExportDefinitions ||
        hasSavedSomeAllTimeDateFiltersPerTab
    );
}

/**
 * Hook to get data for AutomationFiltersSelect component.
 */
export const useAutomationFiltersSelect = ({
    widget,
    automationToEdit,
}: {
    /**
     * Widget to edit automation for (if editing widget related automation).
     */
    widget?: ExtendedDashboardWidget;

    /**
     * Alert or scheduled export automation metadata object to edit.
     * If not provided, returned filters will be the default filters usable for the automation.
     */
    automationToEdit?: IAutomationMetadataObject;
}): IUseAutomationFiltersSelect => {
    const availableFilters = useDashboardSelector(selectDashboardFiltersWithoutCrossFiltering);
    const availableFiltersWithoutIgnoredWidgetFilters = removeIgnoredWidgetFilters(availableFilters, widget!);

    const availableFiltersAsVisibleFilters = useAutomationVisibleFilters(
        availableFiltersWithoutIgnoredWidgetFilters,
    );

    const filtersForNewAutomation = useDefaultSelectedFiltersForNewAutomation(widget);
    const filtersForExistingAutomation = useDefaultSelectedFiltersForExistingAutomation(
        automationToEdit,
        availableFiltersAsVisibleFilters,
        widget,
    );

    // Get filters per tab - only applicable for whole dashboard automations (no widget)
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const allFiltersByTab = useDashboardSelector(selectAutomationFiltersByTab);
    const availableFiltersByTab = allFiltersByTab.reduce<Record<string, FilterContextItem[]>>((acc, tab) => {
        acc[tab.tabId] = tab.availableFilters;
        return acc;
    }, {});

    const availableFiltersAsVisibleFiltersByTab = useAutomationVisibleFiltersByTab(availableFiltersByTab);
    // Safe to get from active tab selector as it's a consistent identifier
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);

    // Only provide filtersPerTab for whole dashboard automations when tabs are enabled and there are multiple tabs
    const isDashboardAutomation = !widget;
    const hasMultipleTabs = allFiltersByTab.length > 1;
    const filtersByTab =
        isDashboardAutomation && enableDashboardTabs && hasMultipleTabs ? allFiltersByTab : undefined;

    const areFiltersStored = useMemo(() => checkAreFiltersStored(automationToEdit), [automationToEdit]);

    // Store filters or not? (checkbox to use latest saved dashboard filters vs "freeze" filters state as is)
    const [storeFilters, setStoreFilters] = useState(areFiltersStored);

    const isDashboardAutomationWithoutStoredFilters = useMemo(() => {
        return !widget && !storeFilters;
    }, [widget, storeFilters]);

    // State of current automation filters to display (and potentially save).
    const [editedAutomationFilters, setEditedAutomationFilters] = useState<FilterContextItem[]>(
        automationToEdit && !isDashboardAutomationWithoutStoredFilters
            ? filtersForExistingAutomation
            : filtersForNewAutomation,
    );

    const filtersByTabForNewAutomation = getDefaultSelectedFiltersFromFiltersByTab(filtersByTab);
    const filtersByTabForExistingAutomation = useMemo((): EditedFiltersByTab | undefined => {
        if (!filtersByTab || !automationToEdit || isDashboardAutomationWithoutStoredFilters) {
            return undefined;
        }

        const filtersByTabForExistingAutomation = getDefaultSelectedFiltersByTabForExistingAutomation(
            automationToEdit,
            availableFiltersByTab,
            commonDateFilterId,
        );

        if (filtersByTabForExistingAutomation) {
            return filtersByTabForExistingAutomation;
        }

        return undefined;
    }, [
        filtersByTab,
        automationToEdit,
        isDashboardAutomationWithoutStoredFilters,
        commonDateFilterId,
        availableFiltersByTab,
    ]);

    // State for edited filters per tab (only used when dashboard tabs are enabled)
    const [editedAutomationFiltersByTab, setEditedAutomationFiltersByTab] = useState<
        EditedFiltersByTab | undefined
    >(
        automationToEdit && !isDashboardAutomationWithoutStoredFilters
            ? filtersByTabForExistingAutomation
            : filtersByTabForNewAutomation,
    );

    return {
        storeFilters,
        setStoreFilters,
        //flat filters
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters: availableFiltersWithoutIgnoredWidgetFilters,
        availableFiltersAsVisibleFilters: availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
        // filters by tab data
        editedAutomationFiltersByTab,
        setEditedAutomationFiltersByTab,
        filtersByTab, // includes all filters related parameters
        availableFiltersAsVisibleFiltersByTab,
    };
};

export function getDefaultSelectedFiltersFromFiltersByTab(filtersByTab: IAutomationFiltersTab[] | undefined) {
    if (!filtersByTab) {
        return undefined;
    }
    return filtersByTab.reduce<EditedFiltersByTab>((acc, tab) => {
        acc[tab.tabId] = tab.defaultSelectedFilters;
        return acc;
    }, {});
}

export function getAvailableFiltersFromFiltersByTab(filtersByTab: IAutomationFiltersTab[] | undefined) {
    if (!filtersByTab) {
        return {};
    }
    return filtersByTab.reduce<Record<string, FilterContextItem[]>>((acc, tab) => {
        acc[tab.tabId] = tab.availableFilters;
        return acc;
    }, {});
}
