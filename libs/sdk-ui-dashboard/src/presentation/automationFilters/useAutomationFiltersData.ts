// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IAutomationVisibleFilter,
    IFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";
import { useMemo, useState } from "react";
import compact from "lodash/compact.js";
import {
    getFilterLocalIdentifier,
    getNonHiddenFilters,
    updateFiltersByExecutionFilterValues,
} from "./utils.js";
import { useFiltersNamings } from "../../_staging/sharedHooks/useFiltersNamings.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectDateFilterConfigsOverrides,
    useDashboardSelector,
} from "../../model/index.js";

interface IUseAutomationFiltersData {
    availableFilters: FilterContextItem[] | undefined;
    automationFilters: FilterContextItem[] | undefined;
    setAutomationFilters: (filters: FilterContextItem[]) => void;
    allVisibleFiltersMetadata: IAutomationVisibleFilter[] | undefined;
    areVisibleFiltersMissingOnDashboard: boolean;
}

/**
 * Logic for preparation of data needed to be passed to other automation hooks outside of the component.
 */
export const useAutomationFiltersData = ({
    allFilters = [],
    storedDashboardFilters,
    storedWidgetFilters,
    metadataVisibleFilters,
    isEditing,
}: {
    /**
     * All possible filters at all times.
     */
    allFilters: FilterContextItem[] | undefined;
    /**
     * Filters that are already stored or about to be stored.
     * Difference of allFilters and storedFilters should represent filters that can be added.
     */
    storedDashboardFilters: FilterContextItem[] | undefined;
    /**
     * Filters that are already stored or about to be stored.
     * Difference of allFilters and storedFilters should represent filters that can be added.
     */
    storedWidgetFilters: IFilter[] | undefined;
    metadataVisibleFilters: IAutomationVisibleFilter[] | undefined;
    isEditing: boolean;
}): IUseAutomationFiltersData => {
    const storedVisibleLocalIdentifiersToShow = useMemo(() => {
        return metadataVisibleFilters?.map((filter) => filter.localIdentifier);
    }, [metadataVisibleFilters]);

    const convertedStoredWidgetFilters = useMemo(() => {
        return updateFiltersByExecutionFilterValues(storedWidgetFilters, allFilters);
    }, [storedWidgetFilters, allFilters]);

    const storedFilters = useMemo(
        () => convertedStoredWidgetFilters ?? storedDashboardFilters,
        [convertedStoredWidgetFilters, storedDashboardFilters],
    );

    const effectiveFilters = useMemo(() => {
        if (!isEditing || !metadataVisibleFilters) {
            return (storedFilters ?? []).filter((filter) => {
                if (isDashboardAttributeFilter(filter)) {
                    return !isAllValuesDashboardAttributeFilter(filter);
                } else {
                    return true;
                }
            });
        }
        return storedFilters ?? [];
    }, [isEditing, metadataVisibleFilters, storedFilters]);

    // add common date filter when it is not present
    const effectiveFiltersWithDateFilter = useMemo(() => {
        const hasCommonDateFilter = effectiveFilters.find(isDashboardCommonDateFilter);
        const dashboardCommonDateFilter = allFilters?.find(isDashboardCommonDateFilter);

        const dashboardCommonDateFilterLocalId = dashboardCommonDateFilter?.dateFilter.localIdentifier;
        const dashboardCommonDateFilterExistsInEffectiveFilters = effectiveFilters.some((filter) => {
            if (isDashboardDateFilter(filter)) {
                return filter.dateFilter.localIdentifier === dashboardCommonDateFilterLocalId;
            }
            return false;
        });

        if (
            !hasCommonDateFilter &&
            dashboardCommonDateFilter &&
            !dashboardCommonDateFilterExistsInEffectiveFilters
        ) {
            return [dashboardCommonDateFilter, ...effectiveFilters];
        }

        return effectiveFilters;
    }, [effectiveFilters, allFilters]);

    // filter out local identifiers that are not on the dashboard
    const sanitizedEffectiveFilters = useMemo(() => {
        const allFiltersSet = new Set(allFilters.map(getFilterLocalIdentifier));
        return effectiveFiltersWithDateFilter.filter((filter) =>
            allFiltersSet.has(getFilterLocalIdentifier(filter)),
        );
    }, [allFilters, effectiveFiltersWithDateFilter]);

    // if some of the visible stored filter are missing on dashboard, we want to know about it
    const allVisibleFilters = useAutomationVisibleFilters(allFilters);
    const areVisibleFiltersMissingOnDashboard = useMemo(() => {
        const allVisibleFiltersSet = new Set(allVisibleFilters.map((filter) => filter.localIdentifier));
        return (
            storedVisibleLocalIdentifiersToShow?.some((localId) => !allVisibleFiltersSet.has(localId)) ??
            false
        );
    }, [allVisibleFilters, storedVisibleLocalIdentifiersToShow]);

    const [selectedFilters, setSelectedFilters] = useState<FilterContextItem[]>(sanitizedEffectiveFilters);

    return {
        availableFilters: allFilters,
        automationFilters: selectedFilters,
        setAutomationFilters: setSelectedFilters,
        allVisibleFiltersMetadata: allVisibleFilters,
        areVisibleFiltersMissingOnDashboard,
    };
};

const useAutomationVisibleFilters = (
    filters: FilterContextItem[] | undefined,
): IAutomationVisibleFilter[] => {
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);

    const nonHiddenFilters = useMemo(() => {
        return getNonHiddenFilters(filters, attributeConfigs, dateConfigs);
    }, [filters, attributeConfigs, dateConfigs]);

    const filterNamings = useFiltersNamings(nonHiddenFilters);

    return useMemo(() => {
        return compact(filterNamings).map((filter) => {
            return {
                title: filter.title,
                localIdentifier: filter.id,
            };
        });
    }, [filterNamings]);
};
