// (C) 2025 GoodData Corporation
import {
    FilterContextItem,
    IAutomationVisibleFilter,
    isDashboardAttributeFilter,
    isAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { useMemo } from "react";
import compact from "lodash/compact.js";
import { useFiltersNamings } from "../../../_staging/sharedHooks/useFiltersNamings.js";

export const useAutomationVisibleFilters = (
    availableFilters: FilterContextItem[] | undefined = [],
    effectiveFilters: FilterContextItem[] | undefined = [],
): IAutomationVisibleFilter[] => {
    const filterNamings = useFiltersNamings(availableFilters);

    return useMemo(() => {
        return compact(filterNamings).map((filter) => {
            // We need to get `isAllTimeDateFilter` info from actual edited automation filters in the dialog,
            // not current dashboard filter context.
            const targetFilter = effectiveFilters.find((f) =>
                isDashboardAttributeFilter(f)
                    ? f.attributeFilter.localIdentifier === filter.id
                    : f.dateFilter.localIdentifier === filter.id,
            );

            return {
                title: filter.title,
                localIdentifier: filter.id,
                isAllTimeDateFilter: !!targetFilter && isAllTimeDashboardDateFilter(targetFilter),
            };
        });
    }, [filterNamings, effectiveFilters]);
};
