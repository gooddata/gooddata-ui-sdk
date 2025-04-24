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
    const areFiltersStored = useMemo(
        () =>
            editAutomation?.exportDefinitions?.some((exportDefinition) => {
                return (exportDefinition.requestPayload.content.filters?.length ?? 0) > 0;
            }) ?? false,
        [editAutomation],
    );
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(automationFilters, allVisibleFiltersMetadata),
        [automationFilters, allVisibleFiltersMetadata],
    );

    const [storeFilters, setStoreFilters] = useState(areFiltersStored);

    return {
        storeFilters,
        setStoreFilters,
        automationDashboardFilters: storeFilters ? automationFilters : undefined,
        visibleDashboardFilters: storeFilters ? visibleFilters : undefined,
    };
};
