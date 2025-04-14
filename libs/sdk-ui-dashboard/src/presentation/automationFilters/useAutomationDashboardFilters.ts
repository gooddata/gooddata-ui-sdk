// (C) 2025 GoodData Corporation

import { useMemo, useState } from "react";
import { FilterContextItem, IAutomationMetadataObject, IAutomationVisibleFilter } from "@gooddata/sdk-model";
import { getVisibleFiltersByFilters } from "./utils.js";

interface IUseAutomationDashboardFiltersResult {
    useFilters: boolean;
    setUseFilters: React.Dispatch<React.SetStateAction<boolean>>;
    effectiveDashboardFilters: FilterContextItem[] | undefined;
    visibleDashboardFilters: IAutomationVisibleFilter[] | undefined;
}

/**
 * Logic to prepare automation filters for dashboard.
 */
export const useAutomationDashboardFilters = ({
    editAutomation,
    dashboardFilters,
    allVisibleFiltersMetadata,
    enableAutomationFilterContext,
}: {
    editAutomation: IAutomationMetadataObject | undefined;
    dashboardFilters: FilterContextItem[] | undefined;
    allVisibleFiltersMetadata?: IAutomationVisibleFilter[] | undefined;
    enableAutomationFilterContext?: boolean;
}): IUseAutomationDashboardFiltersResult => {
    const areFiltersStored = useMemo(
        () =>
            editAutomation?.exportDefinitions?.some((exportDefinition) => {
                return (exportDefinition.requestPayload.content.filters?.length ?? 0) > 0;
            }) ?? false,
        [editAutomation],
    );
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(dashboardFilters, allVisibleFiltersMetadata),
        [dashboardFilters, allVisibleFiltersMetadata],
    );

    const [useFilters, setUseFilters] = useState(areFiltersStored);

    if (!enableAutomationFilterContext) {
        return {
            useFilters: false,
            setUseFilters: () => {},
            effectiveDashboardFilters: dashboardFilters,
            visibleDashboardFilters: undefined,
        };
    }

    return {
        useFilters,
        setUseFilters,
        effectiveDashboardFilters: useFilters ? dashboardFilters : undefined,
        visibleDashboardFilters: useFilters ? visibleFilters : undefined,
    };
};
