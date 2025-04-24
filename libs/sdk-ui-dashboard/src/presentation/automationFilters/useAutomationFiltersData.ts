// (C) 2025 GoodData Corporation

import {
    dashboardFilterLocalIdentifier,
    FilterContextItem,
    IAutomationVisibleFilter,
    IFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
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
    arePersistedFiltersMissingOnDashboard: boolean;
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
        const existingCommonDateFilter = allFilters?.find(isDashboardCommonDateFilter);

        if (!hasCommonDateFilter && existingCommonDateFilter) {
            return [existingCommonDateFilter, ...effectiveFilters];
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

    // check is some of the filters are hidden
    const allVisibleFilters = useAutomationVisibleFilters(allFilters);
    const hiddenFilters = useMemo(() => {
        return sanitizedEffectiveFilters.filter((filter) => {
            const localId = dashboardFilterLocalIdentifier(filter);
            return !allVisibleFilters.some((visibleFilter) => {
                return visibleFilter.localIdentifier === localId;
            });
        });
    }, [allVisibleFilters, sanitizedEffectiveFilters]);

    // if some of the visible stored filter is missing on dashboard, we want to know about it
    const arePersistedFiltersMissingOnDashboard = useMemo(
        () =>
            storedVisibleLocalIdentifiersToShow
                ? sanitizedEffectiveFilters.length - hiddenFilters.length !==
                  storedVisibleLocalIdentifiersToShow.length
                : false,
        [hiddenFilters.length, sanitizedEffectiveFilters.length, storedVisibleLocalIdentifiersToShow],
    );

    const [selectedFilters, setSelectedFilters] = useState<FilterContextItem[]>(sanitizedEffectiveFilters);

    return {
        availableFilters: allFilters,
        automationFilters: selectedFilters,
        setAutomationFilters: setSelectedFilters,
        allVisibleFiltersMetadata: allVisibleFilters,
        arePersistedFiltersMissingOnDashboard,
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
