// (C) 2025 GoodData Corporation

import { useMemo, useState } from "react";
import { FilterContextItem, IAutomationMetadataObject, IAutomationVisibleFilter } from "@gooddata/sdk-model";
import { getVisibleFiltersByFilters } from "./utils.js";

interface IUseAutomationDashboardFiltersResult {
    storeFilters: boolean;
    setStoreFilters: React.Dispatch<React.SetStateAction<boolean>>;
    automationDashboardFilters: FilterContextItem[] | undefined;
    visibleDashboardFilters: IAutomationVisibleFilter[] | undefined;
}

/**
 * Logic to prepare automation filters for dashboard.
 */
export const useAutomationDashboardFilters = ({
    editAutomation,
    automationFilters,
    allVisibleFiltersMetadata,
}: {
    editAutomation: IAutomationMetadataObject | undefined;
    automationFilters: FilterContextItem[] | undefined;
    allVisibleFiltersMetadata?: IAutomationVisibleFilter[] | undefined;
}): IUseAutomationDashboardFiltersResult => {
    // Is dashboard stored with "frozen" filters or is it using the latest saved ones?
    const areFiltersStored = useMemo(() => {
        const hasSavedSomeAllTimeDateFilters = editAutomation?.metadata?.visibleFilters?.some(
            (f) => f.isAllTimeDateFilter,
        );
        const hasSavedFiltersInExportDefinitions = editAutomation?.exportDefinitions?.some(
            (exportDefinition) => {
                return !!exportDefinition.requestPayload.content.filters;
            },
        );
        return hasSavedFiltersInExportDefinitions ?? hasSavedSomeAllTimeDateFilters ?? false;
    }, [editAutomation]);

    // Pair visible filters metadata with the filters that are currently selected
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(automationFilters, allVisibleFiltersMetadata),
        [automationFilters, allVisibleFiltersMetadata],
    );

    // Store filters or not? (checkbox to use latest saved dashboard filters vs "freeze" filters state as is)
    const [storeFilters, setStoreFilters] = useState(areFiltersStored);

    return {
        storeFilters,
        setStoreFilters,
        automationDashboardFilters: storeFilters ? automationFilters : undefined,
        visibleDashboardFilters: storeFilters ? visibleFilters : undefined,
    };
};
