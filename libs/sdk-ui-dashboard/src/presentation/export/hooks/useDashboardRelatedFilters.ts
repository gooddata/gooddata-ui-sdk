// (C) 2022-2025 GoodData Corporation
import { selectFilterContextFilters, useDashboardSelector } from "../../../model/index.js";
import { useFiltersNamings } from "../../../_staging/sharedHooks/useFiltersNamings.js";

export function useDashboardRelatedFilters() {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const filters = useFiltersNamings(dashboardFilters);

    const all = filters.filter((f) => !f?.all);

    return {
        dateFilters: all.filter((f) => f?.type === "dateFilter"),
        attributeFilters: all.filter((f) => f?.type === "attributeFilter"),
    };
}
