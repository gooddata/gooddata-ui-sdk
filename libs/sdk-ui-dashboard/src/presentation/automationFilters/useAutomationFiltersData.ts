// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IAutomationVisibleFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { useMemo, useState } from "react";
import compact from "lodash/compact.js";
import { getNonHiddenFilters, validateAllFilterLocalIdentifiers } from "./utils.js";
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
}

/**
 * Logic for preparation of data needed to be passed to other automation hooks outside of the component.
 */
export const useAutomationFiltersData = ({
    allFilters,
    storedFilters,
    enableAutomationFilterContext,
}: {
    /**
     * All possible filters at all times.
     */
    allFilters: FilterContextItem[] | undefined;
    /**
     * Filters that are already stored or about to be stored.
     * Difference of allFilters and storedFilters should represent filters that can be added.
     */
    storedFilters: FilterContextItem[] | undefined;
    enableAutomationFilterContext: boolean;
}): IUseAutomationFiltersData => {
    const effectiveFilters = useMemo(
        () =>
            storedFilters?.filter((filter) => {
                if (isDashboardAttributeFilter(filter)) {
                    return !isAllValuesDashboardAttributeFilter(filter);
                } else {
                    return true;
                }
            }),
        [storedFilters],
    );

    const allVisibleFilters = useAutomationVisibleFilters(allFilters);
    const doAllFiltersHaveLocalIdentifiers = useMemo(
        () => validateAllFilterLocalIdentifiers(allFilters ?? []),
        [allFilters],
    );
    const [selectedFilters, setSelectedFilters] = useState<FilterContextItem[]>(effectiveFilters ?? []);

    // Just use filters without any changes when FF is off or filters do not have localIdentifiers
    if (!enableAutomationFilterContext || !doAllFiltersHaveLocalIdentifiers) {
        return {
            availableFilters: allFilters,
            automationFilters: undefined,
            setAutomationFilters: () => {},
            allVisibleFiltersMetadata: undefined,
        };
    }

    return {
        availableFilters: allFilters,
        automationFilters: selectedFilters,
        setAutomationFilters: setSelectedFilters,
        allVisibleFiltersMetadata: allVisibleFilters,
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
