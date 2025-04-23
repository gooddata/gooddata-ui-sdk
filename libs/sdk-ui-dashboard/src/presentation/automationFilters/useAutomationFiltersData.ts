// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IAutomationVisibleFilter,
    IFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
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
    enableAutomationFilterContext,
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
    enableAutomationFilterContext: boolean;
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

    const sanitizedEffectiveFilters = useMemo(() => {
        const allFiltersSet = new Set(allFilters.map(getFilterLocalIdentifier));
        return effectiveFilters.filter((filter) => allFiltersSet.has(getFilterLocalIdentifier(filter)));
    }, [allFilters, effectiveFilters]);

    const arePersistedFiltersMissingOnDashboard = useMemo(
        () =>
            storedVisibleLocalIdentifiersToShow
                ? sanitizedEffectiveFilters.length !== storedVisibleLocalIdentifiersToShow.length
                : false,
        [sanitizedEffectiveFilters, storedVisibleLocalIdentifiersToShow],
    );

    const [selectedFilters, setSelectedFilters] = useState<FilterContextItem[]>(sanitizedEffectiveFilters);
    const allVisibleFilters = useAutomationVisibleFilters(allFilters);

    // Just use filters without any changes when FF is off
    if (!enableAutomationFilterContext) {
        return {
            availableFilters: allFilters,
            automationFilters: storedFilters,
            setAutomationFilters: () => {},
            allVisibleFiltersMetadata: undefined,
            arePersistedFiltersMissingOnDashboard: false,
        };
    }

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
