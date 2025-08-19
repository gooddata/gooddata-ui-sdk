// (C) 2025 GoodData Corporation
import { useMemo, useState } from "react";

import { FilterContextItem, IAutomationMetadataObject, IAutomationVisibleFilter } from "@gooddata/sdk-model";

import { useAutomationVisibleFilters } from "./hooks/useAutomationVisibleFilters.js";
import { useDefaultSelectedFiltersForExistingAutomation } from "./hooks/useDefaultSelectedFiltersForExistingAutomation.js";
import { useDefaultSelectedFiltersForNewAutomation } from "./hooks/useDefaultSelectedFiltersForNewAutomation.js";
import { removeIgnoredWidgetFilters } from "./utils.js";
import {
    ExtendedDashboardWidget,
    selectDashboardFiltersWithoutCrossFiltering,
    useDashboardSelector,
} from "../../model/index.js";

interface IUseAutomationFiltersSelect {
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    storeFilters: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    availableFilters: FilterContextItem[] | undefined;
    availableFiltersAsVisibleFilters: IAutomationVisibleFilter[] | undefined;
    filtersForNewAutomation: FilterContextItem[];
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

    const areFiltersStored = useMemo(() => {
        const hasSavedSomeAllTimeDateFilters = automationToEdit?.metadata?.visibleFilters?.some(
            (f) => f.isAllTimeDateFilter,
        );
        const hasSavedFiltersInExportDefinitions = automationToEdit?.exportDefinitions?.some(
            (exportDefinition) => {
                return !!exportDefinition.requestPayload.content.filters;
            },
        );
        return hasSavedFiltersInExportDefinitions ?? hasSavedSomeAllTimeDateFilters ?? false;
    }, [automationToEdit]);

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

    return {
        editedAutomationFilters,
        setEditedAutomationFilters,
        storeFilters,
        setStoreFilters,
        availableFilters: availableFiltersWithoutIgnoredWidgetFilters,
        availableFiltersAsVisibleFilters: availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
    };
};
